<script lang="ts" setup>
  import { computed, reactive, watchEffect } from 'vue';
  import { editableColumn, getDateNow } from '@/views/bolita-views/composable/useableColumns';
  import { OutBoundPlanManager } from '@/api/dataLayer/modules/OutBoundPlan/outBoundPlan';
  import { DataTableColumns } from 'naive-ui';
  import { where } from 'firebase/firestore';
  import {
    operationInfos,
    OperationType,
  } from '@/api/dataLayer/modules/OutBoundPlan/outboundOperations';
  import { cloneDeep } from 'lodash-es';
  import { OutStatus } from '@/api/dataLayer/modules/notify/notify-api';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { safeParseInt, safeSumInt } from '@/store/utils/utils';
  import { CarStatus } from '@/views/newViews/OutboundPlan/columns';
  import { OutBoundDetailManager } from '@/api/dataLayer/modules/OutBoundPlan/outboundDetail';
  import { truckDeliveryMethod } from '@/api/dataLayer/modules/deliveryMethod';

  interface Props {
    outId: string;
  }

  const props = defineProps<Props>();
  let outDetail: any | null = $ref(null);
  const defaultExtraInfo = {
    containerNo: '',
    oldLabel: '',
    newLabel: '',
    operationNote: '',
    specialNote: '',
    wasteNote: '',
    loadCount: '',
    operationPerson: '',
    trayNum: '',
  };
  const extraInfo = reactive(defaultExtraInfo);
  let currentDetailList: any[] = $ref([]);

  const emit = defineEmits(['close', 'refresh', 'save']);
  watchEffect(async () => {
    await reload();
  });

  const normalOperationInfos = computed(() => {
    return localOperationInfo.filter((it) => it.category == OperationType.Normal);
  });
  const specialOperationInfos = computed(() => {
    return localOperationInfo.filter((it) => it.category == OperationType.Special);
  });
  const wasteOperationInfos = computed(() => {
    return localOperationInfo.filter((it) => it.category == OperationType.Waste);
  });
  const localOperationInfo = reactive(cloneDeep(operationInfos));

  async function reload() {
    if (props.outId != null) {
      outDetail = await OutBoundPlanManager.getById(props.outId);
      currentDetailList = await OutBoundDetailManager.load(null, where('outId', '==', props.outId));
      localOperationInfo.length = 0;
      localOperationInfo.push(...cloneDeep(outDetail?.operationInfo ?? operationInfos));
      Object.assign(extraInfo, cloneDeep(outDetail?.extraInfo ?? defaultExtraInfo));
      emit('refresh');
    }
  }

  async function save() {
    const completeNumber = safeSumInt(currentDetailList, 'completeNum');
    const editValue = {
      operationInfo: localOperationInfo,
      extraInfo: extraInfo,
      outStatus: OutStatus.WaitOperation,
    };
    if (completeNumber > 0) {
      editValue.outStatus = OutStatus.Partial;
      const targetNumber = safeParseInt(outDetail?.outboundNum);
      if (completeNumber >= targetNumber) {
        if (truckDeliveryMethod.includes(outDetail.deliveryMethod)) {
          editValue.outStatus = OutStatus.Wait;
        } else {
          editValue.outStatus = OutStatus.All;
        }
      }
    }
    await safeScope(async () => {
      await OutBoundPlanManager.edit(editValue, props.outId);
      await OutBoundDetailManager.massiveUpdate(
        currentDetailList.map((it) => {
          return {
            id: it.id,
            completeNum: it.completeNum,
            note: it.note,
          };
        })
      );
      emit('save');
    });
  }

  async function confirm() {
    const completeNumber = safeSumInt(currentDetailList, 'completeNum');
    const editValue = {
      operationInfo: localOperationInfo,
      extraInfo: extraInfo,
      trayNum: extraInfo?.trayNum ?? '',
      outStatus: OutStatus.WaitOperation,
      carStatus: CarStatus.Able,
    };
    if (completeNumber > 0) {
      editValue.outStatus = OutStatus.Partial;
      const targetNumber = safeParseInt(outDetail?.outboundNum);
      if (completeNumber >= targetNumber) {
        editValue.outStatus = OutStatus.Wait;
      }
    }
    await safeScope(async () => {
      await OutBoundPlanManager.edit(editValue, props.outId);
      await OutBoundDetailManager.massiveUpdate(
        currentDetailList.map((it) => {
          return {
            id: it.id,
            completeNum: it?.completeNum ?? 0,
            note: it.note,
          };
        })
      );
      emit('save');
    });
  }

  const columns: DataTableColumns<any> = $computed(() => [
    { title: '客户ID', key: 'customerName' },
    { title: '票号', key: 'ticketId' },
    { title: '箱号', key: 'containerId' },
    { title: '托数', key: 'trayNum' },
    { title: '箱数', key: 'containerNum' },
    editableColumn({ title: '完成数量', key: 'completeNum' }, currentDetailList),
    editableColumn({ title: '备注', key: 'note' }, currentDetailList),
  ]);
</script>

<template>
  <div v-if="outDetail" id="print" class="mt-8">
    <n-space>
      <n-button v-print="'#print'" type="default">打印计划</n-button>
      <n-button secondary>下载</n-button>
    </n-space>
    <n-descriptions :columns="3" bordered class="mt-4" label-placement="left">
      <n-descriptions-item :span="2" label="仓库" />
      <n-descriptions-item label="日期"> {{ getDateNow() }}</n-descriptions-item>
      <n-descriptions-item label="出库ID"> {{ outDetail?.id }}</n-descriptions-item>
      <n-descriptions-item label="物流渠道"> {{ outDetail?.deliveryMethod }}</n-descriptions-item>
    </n-descriptions>
    <div>
      <n-data-table
        :columns="columns"
        :data="currentDetailList"
        :row-key="(row) => row.id"
        class="mt-4"
        max-height="450"
        virtual-scroll
      />
    </div>
    <n-descriptions class="mt-4" columns="7">
      <n-descriptions-item :span="4" label="操作要求">
        {{ outDetail?.operationRequirement }}
      </n-descriptions-item>
      <n-descriptions-item label="箱号/SKU">
        <div>
          <n-input v-model:value="extraInfo.containerNo" placeholder="" />
        </div>
      </n-descriptions-item>
      <n-descriptions-item label="旧标签">
        <div>
          <n-input v-model:value="extraInfo.oldLabel" placeholder="" />
        </div>
      </n-descriptions-item>
      <n-descriptions-item label="新标签">
        <div>
          <n-input v-model:value="extraInfo.newLabel" placeholder="" />
        </div>
      </n-descriptions-item>
      <n-descriptions-item content-style="width:100px" label="操作"> 数量</n-descriptions-item>
      <n-descriptions-item v-for="item in normalOperationInfos" :key="item.name" :label="item.name">
        <div>
          <n-input v-model:value="item.amount" placeholder="" />
        </div>
      </n-descriptions-item>
      <n-descriptions-item content-style="width:60px" label="特殊操作"> 数量</n-descriptions-item>
      <n-descriptions-item
        v-for="item in specialOperationInfos"
        :key="item.name"
        :label="item.name"
      >
        <div>
          <n-input v-model:value="item.amount" placeholder="" />
        </div>
      </n-descriptions-item>
      <n-descriptions-item content-style="width:60px" label="耗材"> 数量</n-descriptions-item>
      <n-descriptions-item v-for="item in wasteOperationInfos" :key="item.name" :label="item.name">
        <div>
          <n-input v-model:value="item.amount" placeholder="" />
        </div>
      </n-descriptions-item>
    </n-descriptions>
    <n-descriptions :columns="1" bordered class="mt-4" label-placement="left">
      <n-descriptions-item v-model:value="extraInfo.operationNote" label="操作备注">
        <n-input />
      </n-descriptions-item>
      <n-descriptions-item v-model:value="extraInfo.specialNote" label="特殊操作备注">
        <n-input />
      </n-descriptions-item>
      <n-descriptions-item v-model:value="extraInfo.wasteNote" label="耗材备注">
        <n-input />
      </n-descriptions-item>
    </n-descriptions>
    <n-space v-if="outDetail" :wrap-item="false" class="mt-4">
      <div>
        <n-form-item label="装车数量">
          <n-input v-model:value="extraInfo.loadCount" placeholder="装车数量" />
        </n-form-item>
      </div>

      <div class="flex-grow"></div>
      <div>
        <n-form-item label="操作人">
          <n-input v-model:value="extraInfo.operationPerson" placeholder="操作人:" />
        </n-form-item>
      </div>
      <div v-if="outDetail?.carStatus != CarStatus.NoNeed">
        <n-form-item label="打托数量">
          <n-input v-model:value="extraInfo.trayNum" placeholder="操作人:" />
        </n-form-item>
      </div>
      <n-button secondary type="warning" @click="save">保存</n-button>
      <n-button v-if="outDetail?.carStatus != CarStatus.NoNeed" type="primary" @click="confirm"
        >打托完成
      </n-button>
    </n-space>
  </div>
</template>

<style lang="less" scoped>
  @media print {
    .noMaxHeight {
      max-height: unset !important;
      overflow: hidden;
    }
  }
</style>
