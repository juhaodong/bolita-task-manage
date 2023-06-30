<template>
  <n-card class="proCard">
    <normal-form :form-fields="schemas" @submit="handleSubmit" :default-value-model="model" />
  </n-card>
</template>
<script setup lang="ts">
  import dayjs from 'dayjs';
  import { generateOptionFromArray } from '@/utils/utils';
  import { trayTypes } from '@/api/deliveryMethod/logistic-type';
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';

  interface Props {
    model: any;
  }
  defineProps<Props>();
  const schemas: FormField[] = [
    {
      field: 'traySize',
      component: 'NSelect',
      label: '托盘尺寸',
      componentProps: {
        options: generateOptionFromArray(['80*120', '60*80', '100*100', '120*120', '80*240']),
      },
    },
    {
      field: 'trayCount',
      component: 'NInputNumber',
      label: '托盘数量',
      componentProps: {
        type: 'number',
        step: 1,
        precision: 0,
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
      field: 'trayType',
      component: 'NSelect',
      label: '托盘类型',
      componentProps: {
        placeholder: '请选择托盘类型',
        options: generateOptionFromArray(trayTypes),
      },
    },
    {
      field: 'goodsType',
      component: 'NSelect',
      label: '货品类型',
      componentProps: {
        placeholder: '请选择货品类型',
        options: generateOptionFromArray(['超规', '常规']),
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
      },
    },
    {
      field: 'carNo',
      label: '车牌号',
      required: false,
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
