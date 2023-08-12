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
      field: 'financeID',
    },
    {
      label: '货柜号',
      field: 'containerNo',
    },
    {
      label: '出库状态',
      field: 'outStatus',
    },
    asyncCustomerFormField(),
    {
      label: '入库ID',
      field: 'notifyId',
    },
    {
      label: '金额',
      field: 'notifyPrice',
    },
    {
      label: '出库ID',
      field: 'OutboundId',
    },
    {
      label: '金额',
      field: 'outboundPrice',
    },
    {
      label: '物流ID',
      field: 'logisticId',
    },
    {
      label: '金额',
      field: 'logisticPrice',
    },
    {
      label: '其他费用',
      field: 'otherPriceName',
    },
    {
      label: '金额',
      field: 'otherPrice',
    },
    {
      label: '合计',
      field: 'totalPrice',
    },
    {
      label: '备注',
      field: 'note',
    },
    {
      label: '查单ID',
      field: 'checkId',
    },
    {
      label: '索赔退款',
      field: 'claimMoney',
    },
    {
      label: '结算状态',
      field: 'settlementStatus',
    },
    {
      label: '时间线',
      field: 'timeLine',
    },
  ];

  const emit = defineEmits(['submit']);

  function handleSubmit(values: any) {
    emit('submit', values);
  }
</script>

<style lang="less" scoped></style>
