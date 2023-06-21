<template>
  <n-card class="proCard">
    <normal-form :form-fields="schemas" @submit="handleSubmit" />
  </n-card>
</template>
<script setup lang="ts">
  import { filesUpload, FormField } from '@/views/bolita-views/composable/form-field-type';
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';

  const schemas: FormField[] = [
    {
      field: 'fba',
      label: 'FBA',
      required: true,
    },
    {
      field: 'po',
      label: 'PO',
      required: true,
    },
    {
      field: 'fbaCode',
      label: 'FBA代码',
      required: true,
    },
    {
      field: 'trayCount',
      label: '托数',
      component: 'NInputNumber',
      required: true,
    },
    {
      field: 'deliveryAddress',
      label: '送货地址',
      componentProps: {
        type: 'textarea',
      },
      required: true,
    },
    {
      field: 'totalWeight',
      label: '总重量',
      required: true,
    },
    filesUpload,
  ];

  const emit = defineEmits(['submit']);

  function handleSubmit(values: Recordable) {
    emit('submit', values);
    console.log(values);
  }
</script>

<style scoped lang="less"></style>
