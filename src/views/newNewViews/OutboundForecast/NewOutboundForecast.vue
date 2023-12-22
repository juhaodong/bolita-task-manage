<template>
  <n-card class="proCard">
    <loading-frame :loading="loading">
      <normal-form :default-value-model="model" :form-fields="schemas" @submit="handleSubmit" />
    </loading-frame>
  </n-card>
</template>
<script lang="ts" setup>
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { FormFields, safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { schemas } from '@/views/newNewViews/OutboundForecast/columns';

  interface Props {
    model?: any;
  }
  const schemas: FormFields = [
    {
      field: 'customerName',
      label: '客户ID',
    },
    {
      field: 'containerNo',
      label: '货柜号',
    },
    {
      field: 'ticketId',
      label: '票号',
    },
    {
      field: 'FBACode',
      label: 'FBA',
    },
    {
      field: 'number',
      label: '数量',
    },
    {
      field: 'warehouseAddress',
      label: '货物位置',
    },
    {
      field: 'deliveryMethod',
      label: '出库方式',
    },
  ];
  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();

  const emit = defineEmits(['saved']);

  async function handleSubmit(values: any) {
    loading = true;
    await safeScope(async () => {
      emit('saved', values);
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
