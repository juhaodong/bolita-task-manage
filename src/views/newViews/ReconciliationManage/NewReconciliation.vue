<template>
  <n-card class="proCard">
    <normal-form :default-value-model="model" :form-fields="schemas" @submit="handleSubmit" />
  </n-card>
</template>
<script lang="ts" setup>
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { ref } from 'vue';
  import { listUser, PermissionEnums } from '@/api/dataLayer/modules/system/user/baseUser';
  import { asyncCustomerFormField } from '@/api/dataLayer/fieldDefination/common';
  import { FormFields } from '@/api/dataLayer/common/GeneralModel';

  interface Props {
    model?: any;
  }

  defineProps<Props>();

  let customerList = ref<any[]>([]);

  async function init() {
    customerList.value = (await listUser(PermissionEnums.Customer)).result.map((it) => ({
      label: it.realName,
      value: it.id,
    }));
  }

  init();
  const schemas: FormFields = [
    {
      label: '结算ID',
      field: 'id',
    },
    {
      label: '财务ID',
      field: 'id',
    },
    asyncCustomerFormField(),
    {
      label: '客户名称',
      field: 'customerName',
    },
    {
      field: 'settlementTime',
      component: 'NDatePicker',
      label: '结算日期',
      componentProps: {
        type: 'date',
        clearable: true,
      },
    },
    {
      label: '本系统结算金额',
      field: 'systemSettlementPrice',
    },
    {
      label: '附件',
      field: 'file',
    },
    {
      label: '其他系统结算',
      field: 'otherSystemSettlement',
    },
    {
      label: '操作费',
      field: 'OperatingPrice',
    },
    {
      label: '快递结算',
      field: 'deliverySettlement',
    },
    {
      label: '物流费用',
      field: 'logisticsPrice',
    },
    {
      label: '仓储费',
      field: 'inventoryPrice',
    },
    {
      label: '其他费用',
      field: 'otherPrice',
    },
    {
      label: '合计netto',
      field: 'totalNetto',
    },
    {
      label: '发票金额',
      field: 'RMBPrice',
    },
    {
      label: '发票金额',
      field: 'EURPrice',
    },
    {
      label: '发票号',
      field: 'invoiceNumber',
    },
    {
      label: '回款情况',
      field: 'collectionSituation',
    },
    {
      label: '备注',
      field: 'note',
    },
  ];

  const emit = defineEmits(['submit']);

  function handleSubmit(values: any) {
    emit('submit', values);
  }
</script>

<style lang="less" scoped></style>
