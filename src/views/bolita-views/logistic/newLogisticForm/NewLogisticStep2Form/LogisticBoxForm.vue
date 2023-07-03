<template>
  <n-card class="proCard">
    <normal-form :form-fields="schemas" @submit="handleSubmit" />
  </n-card>
</template>
<script setup lang="ts">
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';

  import { commonDeliveryFields } from '@/api/model/common/addressGroup';

  const schemas: FormField[] = [
    {
      field: 'fba',
      label: 'FBA',
      required: true,
    },
    {
      field: 'po',
      label: 'PO描述',
      required: true,
    },
    {
      field: 'fbaCode',
      label: 'FBA代码',
      required: true,
    },

    {
      field: 'totalVolume',
      label: '总体积',
      required: true,
    },
    ...commonDeliveryFields,
  ];

  const emit = defineEmits(['submit']);

  function handleSubmit(values: Recordable) {
    emit('submit', values);
  }
</script>

<style scoped lang="less"></style>
