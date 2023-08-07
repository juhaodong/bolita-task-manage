<template>
  <n-card class="proCard">
    <normal-form :default-value-model="model" :form-fields="schemas" @submit="handleSubmit" />
  </n-card>
</template>
<script lang="ts" setup>
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import { NotifyModel } from '@/api/notify/notify-api';
  import { ref } from 'vue';
  import { usePermission } from '@/hooks/web/usePermission';
  import { listUser, PermissionEnums } from '@/api/dataLayer/modules/system/user/baseUser';

  interface Props {
    model?: any;
  }

  defineProps<Props>();
  let task = [];

  let customerList = ref<any[]>([]);
  const { hasPermission } = usePermission();

  async function init() {
    customerList.value = (await listUser(PermissionEnums.Customer)).result.map((it) => ({
      label: it.realName,
      value: it.id,
    }));
  }

  init();
  const schemas: FormField[] = [
    {
      field: 'LogisticId',
      label: '查单ID',
    },
    {
      field: 'ticketId',
      label: '票号/订单号',
    },
    {
      field: 'OutboundId',
      label: '出库ID',
    },
    {
      field: 'customerId',
      label: '客户ID',
    },
    {
      field: 'deliveryWay',
      label: '物流方式',
    },
    {
      field: 'deliveryMethod',
      label: '物流渠道',
    },
    {
      field: 'waybillId',
      label: '运单号',
    },
    {
      field: 'ISA',
      label: 'ISA',
    },
    {
      field: 'wrongDescribe',
      label: '异常描述',
    },
    {
      field: 'uploadFile',
      label: '上传附件',
    },
    {
      field: 'warehouseFeedback',
      label: '仓库反馈',
    },
    {
      field: 'checkDate',
      label: '开查时间',
    },
    {
      field: 'endDate',
      label: '截止时间',
    },
    {
      field: 'processingProgress',
      label: '处理进度',
    },
    {
      field: 'handlingFeedback',
      label: '处理反馈',
    },
    {
      field: 'claimantID',
      label: '索赔号',
    },
    {
      field: 'handlingStatus',
      label: '处理状态',
    },
    {
      field: 'applicationsAmount',
      label: '申请金额',
    },
    {
      field: 'claimAmount',
      label: '索赔金额',
    },
    {
      field: 'settlementStatus',
      label: '结算状态',
    },
  ];

  const emit = defineEmits(['submit']);

  function handleSubmit(values: NotifyModel) {
    values.taskList = task;
    emit('submit', values);
  }
</script>

<style lang="less" scoped></style>
