<template>
  <n-card class="proCard">
    <normal-form :form-fields="schemas" @submit="handleSubmit" />
  </n-card>
</template>
<script setup lang="ts">
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { generateOptionFromArray } from '@/utils/utils';
  import { deliveryMethods } from '@/api/deliveryMethod';

  const schemas: FormField[] = [
    {
      field: 'fbaDesc',
      label: 'FBA描述',
      required: true,
    },
    {
      field: 'fbaFile',
      component: 'NUpload',
      label: 'FBA文件',
      componentProps: {
        multiple: true,
      },
      required: true,
    },
    {
      field: 'poDesc',
      label: 'PO描述',
      required: true,
    },
    {
      field: 'poFile',
      component: 'NUpload',
      label: 'PO文件',
      componentProps: {
        multiple: true,
      },
      required: true,
    },
    {
      field: 'fbaCode',
      label: 'FBA代码',
      required: true,
    },
    {
      field: 'deliveryMethod',
      label: '配送方式',
      component: 'NSelect',
      componentProps: {
        options: generateOptionFromArray(deliveryMethods),
      },
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
      field: 'totalVolume',
      label: '总体积',
      required: true,
    },
  ];

  const emit = defineEmits(['submit']);

  function handleSubmit(values: Recordable) {
    emit('submit', values);
    console.log(values);
  }
</script>

<style scoped lang="less"></style>
