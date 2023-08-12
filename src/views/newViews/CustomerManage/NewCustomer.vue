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
      label: '客户ID',
      field: 'customerId',
    },
    {
      label: '客户名称',
      field: 'customerName',
    },
    {
      label: '业务关联方',
      field: 'businessParty',
    },
    {
      label: '所属仓库',
      field: 'belongWarehouse',
    },
    {
      label: '所属业务员',
      field: 'belongSalesName',
    },
    {
      label: '子客户ID',
      field: 'childrenCustomerId',
    },
    {
      label: '使用系统',
      field: 'useSystem',
    },
    {
      label: '快速账号绑定',
      field: 'quickBindAccount',
    },
    {
      label: '状态',
      field: 'status',
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
