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
  import { listUser, PermissionEnums } from '@/api/user/baseUser';

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
      field: 'carPoolID',
      label: '拼车ID',
    },
    {
      field: 'customerId',
      label: '客户ID',
    },
    {
      field: 'LogisticId',
      label: '物流ID',
    },
    {
      field: 'date',
      label: '日期',
    },
    {
      field: 'outboundDetailId',
      label: '出库明细ID',
    },
    {
      field: 'OutboundId',
      label: '出库ID',
    },
    {
      field: 'warehouseId',
      label: '仓库',
    },
    {
      field: 'trayNum',
      label: '托盘',
    },
    {
      field: 'containerNum',
      label: '箱数',
    },
    {
      field: 'outStatus',
      label: '出库状态',
    },
    {
      field: 'targetCountry',
      label: '目的国',
    },
    {
      field: 'FBACode',
      label: 'FBACode',
    },
    {
      field: 'quotation',
      label: '报价',
    },
    {
      field: 'address',
      label: '地址',
    },
    {
      field: 'reservationGetProductTime',
      label: '预约取货时间',
    },
  ];

  const emit = defineEmits(['submit']);

  function handleSubmit(values: NotifyModel) {
    values.taskList = task;
    emit('submit', values);
  }
</script>

<style lang="less" scoped></style>
