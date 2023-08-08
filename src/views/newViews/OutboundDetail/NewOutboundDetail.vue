<template>
  <n-card class="proCard">
    <normal-form :default-value-model="model" :form-fields="schemas" @submit="handleSubmit" />
  </n-card>
</template>
<script lang="ts" setup>
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import { sizeFormField } from '@/api/dataLayer/fieldDefination/SizeFormField';
  import {
    formatItemAddress,
    getTargetAddressSelectionGroup,
  } from '@/api/dataLayer/fieldDefination/addressGroup';

  interface Props {
    model?: any;
  }

  defineProps<Props>();

  const schemas: FormField[] = [
    {
      field: 'containerId',
      label: '箱号',
    },
    {
      field: 'productSKU',
      label: '产品SKU',
    },
    {
      field: 'trayNum',
      label: '托数',
    },
    {
      field: 'containerNum',
      label: '数量(箱/件)',
    },
    ...sizeFormField,
    {
      field: 'weightKg',
      label: '重量kg',
    },
    {
      field: 'volume',
      label: '体积',
    },
    {
      field: 'wareHouse',
      label: '仓库',
    },
    ...getTargetAddressSelectionGroup(),
  ].map((it) => {
    it.required = false;
    return it;
  });

  const emit = defineEmits(['submit']);

  function handleSubmit(values: any) {
    formatItemAddress(values);
    console.log(values);
    emit('submit', values);
  }
</script>

<style lang="less" scoped></style>
