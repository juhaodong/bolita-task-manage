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
  import dayjs from 'dayjs';
  import { trayTypes } from '@/api/deliveryMethod/logistic-type';

  const schemas: FormField[] = [
    {
      field: 'orderDate',
      component: 'NDatePicker',
      label: '需求日期',
      defaultValue: dayjs().valueOf(),
      componentProps: {},
      required: true,
    },
    {
      field: 'trayCount',
      label: '托数',
      component: 'NInputNumber',
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
  ];

  const emit = defineEmits(['submit']);

  function handleSubmit(values: Recordable) {
    emit('submit', values);
    console.log(values);
  }
</script>

<style scoped lang="less"></style>
