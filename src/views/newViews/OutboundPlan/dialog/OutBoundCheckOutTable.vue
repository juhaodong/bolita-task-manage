<script lang="ts" setup>
  import { computed, reactive, watchEffect } from 'vue';
  import {
    editableColumn,
    formatColumn,
    getDateNow,
    timeDisplay,
  } from '@/views/bolita-views/composable/useableColumns';
  import { OutBoundPlanManager } from '@/api/dataLayer/modules/OutBoundPlan/outBoundPlan';
  import { DataTableColumns } from 'naive-ui';
  import { where } from 'firebase/firestore';
  import {
    OperationInfo,
    operationInfos,
  } from '@/api/dataLayer/modules/OutBoundPlan/outboundOperations';
  import { cloneDeep, sumBy } from 'lodash-es';
  import { CashStatus } from '@/api/dataLayer/modules/notify/notify-api';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { safeParseFloat, safeParseInt, safeSumInt } from '@/store/utils/utils';
  import { OperationType, saveCash } from '@/api/dataLayer/modules/cash/cash';
  import { OutBoundDetailManager } from '@/api/dataLayer/modules/OutBoundPlan/outboundDetail';
  import { useUserStore } from '@/store/modules/user';
  import { PermissionEnums } from '@/api/dataLayer/modules/system/user/baseUser';

  console.log(getDateNow, timeDisplay);

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
  };
  const extraInfo: any = reactive(defaultExtraInfo);
  let currentDetailList: any[] = $ref([]);

  const emit = defineEmits(['close', 'refresh', 'save']);
  watchEffect(async () => {
    await reload();
  });

  const billed: any[] = $computed(() => {
    return localOperationInfo.filter((it) => it.amount > 0);
  });

  const localOperationInfo = reactive(cloneDeep(operationInfos));

  async function reload() {
    if (props.outId != null) {
      outDetail = await OutBoundPlanManager.getById(props.outId);
      console.log(outDetail, 'outDetail');
      currentDetailList = await OutBoundDetailManager.load(null, where('outId', '==', props.outId));
      console.log(currentDetailList, 'list');
      localOperationInfo.length = 0;
      localOperationInfo.push(...cloneDeep(outDetail?.operationInfo ?? operationInfos));
      Object.assign(extraInfo, cloneDeep(outDetail?.extraInfo ?? defaultExtraInfo));
      emit('refresh');
    }
  }

  const userPowerType = $computed(() => {
    return useUserStore()?.info?.userType;
  });

  async function confirm() {
    const editValue = {
      cashStatus: CashStatus.Done,
    };
    await safeScope(async () => {
      await saveCash(
        {
          customerId: outDetail?.customerId,
          containerNo: outDetail?.containerNo ?? '',
          operationId: props.outId,
          operationType: OperationType.Out,
          amount: summary.value.sum,
          note: extraInfo.operationNote,
          cashStatus: CashStatus.Done,
        },
        outDetail?.cashId
      );
      await OutBoundPlanManager.edit(editValue, props.outId);
      emit('save');
    });
  }

  async function save() {
    const editValue = {
      operationInfo: localOperationInfo,
      cashStatus: CashStatus.WaitConfirm,
    };

    await safeScope(async () => {
      editValue.cashId = await saveCash(
        {
          customerId: outDetail?.customerId,
          containerNo: outDetail?.containerNo ?? '',
          operationId: props.outId,
          operationType: OperationType.Out,
          amount: summary.value.sum,
          note: extraInfo.operationNote,
        },
        outDetail?.cashId
      );
      await OutBoundPlanManager.edit(editValue, props.outId);
      emit('save');
    });
  }

  const columns: DataTableColumns<any> = $computed(() => [
    { title: '客户ID', key: 'customerName' },
    { title: '票号', key: 'ticketId' },
    { title: '箱号', key: 'containerId' },
    { title: '托数', key: 'trayNum' },
    { title: '箱数', key: 'containerNum' },
    { title: '完成数量', key: 'completeNum' },
    editableColumn({ title: '备注', key: 'note' }, currentDetailList),
  ]);

  const checkOutColumn: DataTableColumns<OperationInfo> = $computed(() => [
    { title: '操作名称', key: 'name' },
    { title: '操作类型', key: 'category' },
    { title: '数量', key: 'amount' },
    editableColumn(
      {
        title: '单价',
        key: 'price',
        disabled:
          userPowerType === PermissionEnums.Logistic ||
          PermissionEnums.CustomerManage ||
          PermissionEnums.CustomerService,
      },
      billed
    ),
    formatColumn('sum', '小计', (record) => {
      return (safeParseInt(record.amount) * safeParseFloat(record.price)).toFixed(2);
    }),
  ]);

  const summary = computed(() => {
    return {
      amount: safeSumInt(billed, 'amount'),
      sum: sumBy(
        billed,
        (record: OperationInfo) => safeParseInt(record.amount) * safeParseFloat(record.price)
      ),
    };
  });
</script>

<template>
  <div v-if="outDetail" id="print" class="mt-8">
    <n-space>
      <n-button v-print="'#print'" type="default">打印计划</n-button>
      <n-button secondary>下载</n-button>
    </n-space>
    <n-descriptions :columns="3" bordered class="mt-4" label-placement="left">
      <n-descriptions-item :span="2" label="仓库">{{ outDetail?.warehouseId }}</n-descriptions-item>
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
    <n-descriptions class="mt-4" columns="3">
      <n-descriptions-item :span="3" label="操作要求">
        {{ outDetail?.operationRequirement }}
      </n-descriptions-item>

      <n-descriptions-item label="箱号/SKU">
        <div>
          {{ extraInfo?.containerNo ?? '-' }}
        </div>
      </n-descriptions-item>
      <n-descriptions-item label="旧标签">
        <div>
          {{ extraInfo?.oldLabel ?? '-' }}
        </div>
      </n-descriptions-item>
      <n-descriptions-item label="新标签">
        <div>
          {{ extraInfo?.newLabel ?? '-' }}
        </div>
      </n-descriptions-item>
      <n-descriptions-item label="操作备注">
        {{ extraInfo?.operationNote ?? '-' }}
      </n-descriptions-item>
      <n-descriptions-item label="特殊操作备注">
        {{ extraInfo?.specialNote ?? '-' }}
      </n-descriptions-item>
      <n-descriptions-item label="耗材备注">
        {{ extraInfo?.wasteNote ?? '-' }}
      </n-descriptions-item>
    </n-descriptions>
    <n-data-table :columns="checkOutColumn" :data="billed" class="mt-4" size="small" />
    <n-descriptions :columns="2" bordered class="mt-4" label-placement="top">
      <n-descriptions-item label="总数">
        {{ summary.amount }}
      </n-descriptions-item>
      <n-descriptions-item label="合计">
        {{ summary.sum }}
      </n-descriptions-item>
    </n-descriptions>
    <n-space v-if="outDetail" :wrap-item="false" align="center" class="mt-4">
      <div> 装车数量: {{ extraInfo?.loadCount }}</div>

      <div class="flex-grow"></div>
      <div> 操作人: {{ extraInfo?.operationPerson }}</div>
      <n-button secondary type="warning" @click="save">保存结算</n-button>
      <n-button secondary type="primary" @click="confirm">确认结算</n-button>
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
