<template>
  <n-card class="proCard">
    <normal-form :form-fields="schemas" @submit="handleSubmit" />
  </n-card>
</template>
<script setup lang="ts">
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { getFilesUploadFormField } from '@/api/dataLayer/fieldDefination/form-field-sort-label';

  const schemas: FormField[] = [
    {
      field: 'deliveryCompany',
      label: '运输公司',
      required: true,
    },
    getFilesUploadFormField('podFile'),
  ];

  const emit = defineEmits(['submit']);

  function handleSubmit(values: Recordable) {
    emit('submit', values);
  }
</script>

<style scoped lang="less"></style>
