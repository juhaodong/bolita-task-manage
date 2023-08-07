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
      field: 'outboundDetailId',
      label: '明细ID',
    },
    {
      field: 'OutboundId',
      label: '出库ID',
    },
    {
      field: 'inboundId',
      label: '入库ID',
    },
    {
      field: 'customerId',
      label: '客户ID',
    },
    {
      field: 'ticketId',
      label: '票号',
    },
    {
      field: 'containerId',
      label: '箱号',
    },
    {
      field: 'productSKU',
      label: '产品SKU',
    },
    {
      field: 'trayNum',
      label: '托',
    },
    {
      field: 'containerNum',
      label: '数量(箱/件)',
    },
    {
      field: 'containerStandards',
      label: '规格',
    },
    {
      field: 'weightKg',
      label: '重量kg',
    },
    {
      field: 'volume',
      label: '体积',
    },
    {
      field: 'wareHouse',
      label: '仓库',
    },
    {
      field: 'checkStatus',
      label: '审核状态',
    },
    {
      field: 'reservationOutboundDate',
      label: '预约出库日期',
    },
    {
      field: 'outStatus',
      label: '出库状态',
    },
    {
      field: 'waybillId',
      label: '运单号',
    },
    {
      field: 'REF',
      label: 'REF.',
    },
    {
      field: 'ISA',
      label: 'ISA',
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
      field: 'PO',
      label: 'PO',
    },
    {
      field: 'shippingAddress',
      label: '收件地址',
    },
    {
      field: 'logisticsMethods',
      label: '物流方式',
    },
    {
      field: 'storeAddress',
      label: '库位',
    },
    {
      field: 'storageDays',
      label: '存放天数',
    },
  ];

  const emit = defineEmits(['submit']);

  function handleSubmit(values: NotifyModel) {
    values.taskList = task;
    emit('submit', values);
  }
</script>

<style lang="less" scoped></style>
