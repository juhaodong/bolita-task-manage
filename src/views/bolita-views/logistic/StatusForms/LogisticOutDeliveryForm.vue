<template>
  <n-card class="proCard">
    <normal-form :form-fields="schemas" @submit="handleSubmit" />
  </n-card>
</template>
<script setup lang="ts">
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { LogisticType } from '@/api/dataLayer/modules/deliveryMethod/logistic-type';
  import { getFilesUploadFormField } from '@/api/dataLayer/fieldDefination/common';

  interface Props {
    logisticType: LogisticType;
  }

  const props = defineProps<Props>();
  const schemas: FormField[] = [
    ...(props.logisticType === LogisticType.AmazonTray ||
    props.logisticType === LogisticType.OtherTray
      ? [
          {
            field: 'transferTray',
            label: '交接托盘',
            required: true,
          },
        ]
      : []),
    getFilesUploadFormField('pickupFile'),
  ];

  const emit = defineEmits(['submit']);

  function handleSubmit(values: Recordable) {
    emit('submit', values);
  }
</script>

<style scoped lang="less"></style>
