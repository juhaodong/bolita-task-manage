<script setup lang="ts">
  import { reactive, watchEffect } from 'vue';
  import {
    editableColumn,
    getDateNow,
    timeDisplay,
  } from '@/views/bolita-views/composable/useableColumns';
  import {
    OutBoundDetailManager,
    OutBoundPlanManager,
  } from '@/api/dataLayer/modules/OutBoundPlan/outBoundPlan';
  import { DataTableColumns } from 'naive-ui';
  import { where } from 'firebase/firestore';
  import {
    operationInfos,
    OperationType,
  } from '@/api/dataLayer/modules/OutBoundPlan/outboundOperations';

  console.log(getDateNow, timeDisplay);

  interface Props {
    outId: string;
  }

  const props = defineProps<Props>();
  let outDetail: any | null = $ref(null);
  const extraInfo = reactive({
    containerNo: '',
    oldLabel: '',
    newLabel: '',
    operationNote: '',
    specialNote: '',
    wasteNote: '',
    loadCount: '',
    operationPerson: '',
  });
  let currentDetailList: any[] = $ref([]);

  const emit = defineEmits(['close', 'refresh', 'save']);
  watchEffect(async () => {
    await reload();
  });

  const normalOperationInfos = operationInfos.filter((it) => it.category == OperationType.Normal);
  const specialOperationInfos = operationInfos.filter((it) => it.category == OperationType.Special);
  const wasteOperationInfos = operationInfos.filter((it) => it.category == OperationType.Waste);

  async function reload() {
    if (props.outId != null) {
      outDetail = await OutBoundPlanManager.getById(props.outId);
      currentDetailList = await OutBoundDetailManager.load(null, where('outId', '==', props.outId));
      operationInfos.forEach((it) => {
        it.amount = '';
      });
      emit('refresh');
    }
  }

  async function save() {}

  const columns: DataTableColumns<any> = $computed(() => [
    { title: '客户ID', key: 'customerId' },
    { title: '票号', key: 'ticketId' },
    { title: '箱号', key: 'containerId' },
    { title: '托数', key: 'trayNum' },
    { title: '箱数', key: 'containerNum' },
    editableColumn({ title: '完成数量', key: 'completeNum' }, currentDetailList),
    editableColumn({ title: '备注', key: 'note' }, currentDetailList),
  ]);
</script>

<template>
  <div class="mt-8" id="print" v-if="outDetail">
    <n-space>
      <n-button v-print="'#print'" type="default">打印计划</n-button>
      <n-button secondary>下载</n-button>
    </n-space>
    <n-descriptions :columns="3" label-placement="left" class="mt-4" bordered>
      <n-descriptions-item :span="2" label="仓库" />
      <n-descriptions-item label="日期"> {{ getDateNow() }}</n-descriptions-item>
      <n-descriptions-item label="出库ID"> {{ outDetail?.id }}</n-descriptions-item>
      <n-descriptions-item label="物流渠道"> {{ outDetail?.deliveryMethod }}</n-descriptions-item>
    </n-descriptions>
    <div>
      <n-data-table
        class="mt-4"
        virtual-scroll
        max-height="450"
        :columns="columns"
        :row-key="(row) => row.id"
        :data="currentDetailList"
      />
    </div>
    <n-descriptions columns="7" class="mt-4">
      <n-descriptions-item :span="4" label="操作要求">
        {{ outDetail?.operationRequirement }}
      </n-descriptions-item>
      <n-descriptions-item label="箱号/SKU">
        <div>
          <n-input placeholder="" v-model:value="extraInfo.containerNo" />
        </div>
      </n-descriptions-item>
      <n-descriptions-item label="旧标签">
        <div>
          <n-input placeholder="" v-model:value="extraInfo.oldLabel" />
        </div>
      </n-descriptions-item>
      <n-descriptions-item label="新标签">
        <div>
          <n-input placeholder="" v-model:value="extraInfo.newLabel" />
        </div>
      </n-descriptions-item>
      <n-descriptions-item label="操作" content-style="width:100px"> 数量 </n-descriptions-item>
      <n-descriptions-item v-for="item in normalOperationInfos" :key="item.name" :label="item.name">
        <div>
          <n-input placeholder="" v-model:value="item.amount" />
        </div>
      </n-descriptions-item>
      <n-descriptions-item label="特殊操作" content-style="width:60px"> 数量 </n-descriptions-item>
      <n-descriptions-item
        v-for="item in specialOperationInfos"
        :key="item.name"
        :label="item.name"
      >
        <div>
          <n-input placeholder="" v-model:value="item.amount" />
        </div>
      </n-descriptions-item>
      <n-descriptions-item label="耗材" content-style="width:60px"> 数量 </n-descriptions-item>
      <n-descriptions-item v-for="item in wasteOperationInfos" :key="item.name" :label="item.name">
        <div>
          <n-input placeholder="" v-model:value="item.amount" />
        </div>
      </n-descriptions-item>
    </n-descriptions>
    <n-descriptions :columns="1" label-placement="left" bordered class="mt-4">
      <n-descriptions-item label="操作备注" v-model:value="extraInfo.operationNote">
        <n-input />
      </n-descriptions-item>
      <n-descriptions-item label="特殊操作备注" v-model:value="extraInfo.specialNote">
        <n-input />
      </n-descriptions-item>
      <n-descriptions-item label="耗材备注" v-model:value="extraInfo.wasteNote">
        <n-input />
      </n-descriptions-item>
    </n-descriptions>
    <n-space v-if="outDetail" class="mt-4" :wrap-item="false">
      <div>
        <n-input placeholder="装车数量" v-model:value="extraInfo.loadCount" />
      </div>

      <div class="flex-grow"></div>
      <div>
        <n-input placeholder="操作人:" v-model:value="extraInfo.operationPerson" />
      </div>
      <n-button @click="save" type="warning" secondary>确认 </n-button>
    </n-space>
  </div>
</template>

<style scoped lang="less">
  @media print {
    .noMaxHeight {
      max-height: unset !important;
      overflow: hidden;
    }
  }
</style>