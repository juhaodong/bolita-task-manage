<template>
  <n-card class="proCard">
    <normal-form :default-value-model="model" :form-fields="schemas" @submit="handleSubmit" />
  </n-card>
</template>
<script setup lang="ts">
  import dayjs from 'dayjs';
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';

  interface Props {
    model: any;
  }

  defineProps<Props>();
  const schemas: FormField[] = [
    {
      field: 'containerNo',
      label: '货柜号',
      componentProps: {
        placeholder: '请输入货柜号',
      },
    },
    {
      field: 'sortingLabelCount',
      component: 'NInputNumber',
      label: 'SKU分拣标签数量',
      componentProps: {
        type: 'number',
        step: 1,
        precision: 0,
      },
    },
    {
      field: 'carNo',
      label: '车牌号',
      componentProps: {
        placeholder: '请输入车牌号',
      },
      required: false,
    },
    {
      field: 'containerSize',
      component: 'NSelect',
      label: '货柜尺寸',
      componentProps: {
        options: [
          { value: '20H', label: '20H' },
          { value: '40H', label: '40H' },
          { value: '45H', label: '45H' },
        ],
      },
    },
    {
      field: 'containerType',
      component: 'NSelect',
      label: '货柜类型',
      componentProps: {
        options: [
          { value: '常规货柜', label: '常规货柜' },
          { value: '查验柜', label: '查验柜' },
          { value: '工业品', label: '工业品' },
          { value: '倒柜', label: '倒柜' },
        ],
      },
    },
    {
      field: 'planArriveDateTime',
      component: 'NDatePicker',
      label: '预约仓位',
      componentProps: {
        type: 'datetime',
        clearable: true,
        timePickerProps: {
          hours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
          minutes: [0, 15, 30, 45],
          seconds: [0],
        },
        isDateDisabled: (current) => {
          return !(
            dayjs(current).isAfter(dayjs().startOf('d')) &&
            dayjs(current).isBefore(dayjs().add(3, 'month'))
          );
        },
        onUpdateValue: (e: any) => {
          console.log(e);
        },
      },
    },
    {
      field: 'note',
      label: '备注',
      required: false,
    },
  ];

  const emit = defineEmits(['submit']);

  function handleSubmit(values: Recordable) {
    emit('submit', values);
    console.log(values);
  }
</script>

<style scoped lang="less"></style>
