<template>
  <n-card class="proCard">
    <normal-form :form-fields="schemas" @submit="handleSubmit" />
  </n-card>
</template>
<script setup lang="ts">
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { LogisticType } from '@/api/deliveryMethod/logistic-type';
  import { getFilesUploadFormField } from '@/api/dataLayer/fieldDefination/form-field-sort-label';

  interface Props {
    logisticType: LogisticType;
  }

  const props = defineProps<Props>();
  const schemas: FormField[] = [
    ...(props.logisticType === LogisticType.AmazonTray
      ? [
          {
            field: 'amazonReservationNo',
            label: '亚马逊预约号',
            required: true,
          },
        ]
      : []),
    getFilesUploadFormField('feedBackFiles'),
    {
      field: 'orderNo',
      label: '订单号',
      required: true,
    },
    {
      field: 'pickupDate',
      label: '取货日期',
      component: 'NDatePicker',
      required: true,
    },
  ];

  const emit = defineEmits(['submit']);

  function handleSubmit(values: Recordable) {
    emit('submit', values);
  }
</script>

<style scoped lang="less"></style>
