<template>
  <n-card class="proCard">
    <loading-frame :loading="loading">
      <normal-form :default-value-model="model" :form-fields="schemas" @submit="handleSubmit" />
    </loading-frame>
  </n-card>
</template>
<script lang="ts" setup>
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import { formatItemAddress } from '@/api/dataLayer/fieldDefination/addressGroup';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { OutBoundDetailManager } from '@/api/dataLayer/modules/OutBoundPlan/outBoundPlan';

  interface Props {
    model?: any;
  }

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();
  console.log(prop.model);
  const schemas: FormField[] = [
    {
      label: '仓库ID',
      field: 'warehouseId',
    },
    {
      label: '公司名称',
      field: 'companyName',
    },
    {
      label: '国家',
      field: 'country',
    },
    {
      label: '地址',
      field: 'address',
    },
    {
      label: '面积',
      field: 'area',
    },
    // {
    //   label: '操作',
    //   field: 'action',
    // },
    {
      label: '结算方式',
      field: 'settlementMethod',
    },
    {
      label: '所属操作员',
      field: 'belongOperator',
    },
    {
      label: '所属业务员',
      field: 'belongSalesName',
    },
    {
      label: '使用系统',
      field: 'useSystem',
    },
    {
      label: '快递账号',
      field: 'courierAccount',
    },
    {
      label: '备注',
      field: 'note',
    },
  ];

  const emit = defineEmits(['saved']);

  async function handleSubmit(values: any) {
    loading = true;
    formatItemAddress(values);
    await safeScope(async () => {
      await OutBoundDetailManager.edit(values, prop.model.id);
      emit('saved', values);
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
