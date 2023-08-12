<script setup lang="ts">
  import { computed, reactive, watchEffect } from 'vue';
  import {
    editableColumn,
    formatColumn,
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
    OperationInfo,
    operationInfos,
  } from '@/api/dataLayer/modules/OutBoundPlan/outboundOperations';
  import { cloneDeep, sumBy } from 'lodash-es';
  import { CashStatus } from '@/api/dataLayer/modules/notify/notify-api';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { safeParseFloat, safeParseInt, safeSumInt } from '@/store/utils/utils';
  import { OperationType, saveCash } from '@/api/dataLayer/modules/cash/cash';

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
      currentDetailList = await OutBoundDetailManager.load(null, where('outId', '==', props.outId));
      localOperationInfo.length = 0;
      localOperationInfo.push(...cloneDeep(outDetail?.operationInfo ?? operationInfos));
      Object.assign(extraInfo, cloneDeep(outDetail?.extraInfo ?? defaultExtraInfo));
      emit('refresh');
    }
  }

  async function confirm() {
    const editValue = {
      cashStatus: CashStatus.Done,
    };
    await safeScope(async () => {
      await saveCash(
        {
          containerNo: outDetail?.containerNo,
          operationId: props.outId,
          operationType: OperationType.Out,
          amount: extraInfo.finalPrice,
          note: extraInfo.explain,
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
      await saveCash(
        {
          containerNo: outDetail?.containerNo,
          operationId: props.outId,
          operationType: OperationType.Out,
          amount: extraInfo.finalPrice,
          note: extraInfo.explain,
        },
        outDetail?.cashId
      );
      await OutBoundPlanManager.edit(editValue, props.outId);
      emit('save');
    });
  }

  const columns: DataTableColumns<any> = $computed(() => [
    { title: '客户ID', key: 'customerId' },
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
    editableColumn({ title: '单价', key: 'price' }, billed),
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
    <n-descriptions columns="3" class="mt-4">
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
    <n-data-table class="mt-4" size="small" :columns="checkOutColumn" :data="billed" />
    <n-descriptions :columns="2" label-placement="top" bordered class="mt-4">
      <n-descriptions-item label="总数">
        {{ summary.amount }}
      </n-descriptions-item>
      <n-descriptions-item label="合计">
        {{ summary.sum }}
      </n-descriptions-item>
    </n-descriptions>
    <n-space v-if="outDetail" class="mt-4" align="center" :wrap-item="false">
      <div> 装车数量: {{ extraInfo?.loadCount }}</div>

      <div class="flex-grow"></div>
      <div> 操作人: {{ extraInfo?.operationPerson }}</div>
      <n-button @click="save" type="warning" secondary>保存结算</n-button>
      <n-button @click="confirm" type="primary" secondary>确认结算</n-button>
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
