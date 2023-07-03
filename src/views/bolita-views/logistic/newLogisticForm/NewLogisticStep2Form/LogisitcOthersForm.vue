<template>
  <n-card class="proCard">
    <normal-form :form-fields="schemas" @submit="handleSubmit" />
  </n-card>
</template>
<script setup lang="ts">
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { generateOptionFromArray } from '@/utils/utils';
  import { trayTypes } from '@/api/deliveryMethod/logistic-type';

  import { commonDeliveryFields } from '@/api/model/common/addressGroup';

  const schemas = [
    {
      field: 'deliveryNo',
      label: '送仓号',
      required: false,
    },
    {
      field: 'trayInfo.length',
      label: '托盘长',
      required: true,
    },
    {
      field: 'trayInfo.width',
      label: '托盘宽',
      required: true,
    },
    {
      field: 'trayInfo.height',
      label: '托盘高',
      required: true,
    },
    {
      field: 'trayInfo.weight',
      label: '托盘重量',
      required: true,
    },
    {
      field: 'trayInfo.trayType',
      label: '托盘类型',
      component: 'NSelect',
      componentProps: {
        options: generateOptionFromArray(trayTypes),
      },
      required: true,
    },
    ...commonDeliveryFields,
  ];

  const emit = defineEmits(['submit']);

  function handleSubmit(values: Recordable) {
    emit('submit', values);
    console.log(values);
  }
</script>

<style scoped lang="less"></style>
