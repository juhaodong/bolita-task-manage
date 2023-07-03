<template>
  <n-card class="proCard">
    <normal-form :form-fields="schemas" :default-value-model="model" @submit="handleSubmit" />
  </n-card>
</template>
<script setup lang="ts">
  import dayjs from 'dayjs';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';

  interface Props {
    model: any;
  }
  defineProps<Props>();

  const schemas: FormField[] = [
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
