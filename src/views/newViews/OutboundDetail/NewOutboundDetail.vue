<template>
  <n-card class="proCard">
    <loading-frame :loading="loading">
      <normal-form :default-value-model="model" :form-fields="schemas" @submit="handleSubmit" />
    </loading-frame>
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
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { OutBoundDetailManager } from '@/api/dataLayer/modules/OutBoundPlan/outBoundPlan';

  interface Props {
    model?: any;
  }

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();
  console.log(prop.model);
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
      field: 'note',
      label: '备注',
    },
    ...getTargetAddressSelectionGroup(),
  ].map((it) => {
    it.required = false;
    return it;
  });

  const emit = defineEmits(['saved']);

  async function handleSubmit(values: any) {
    loading = true;
    formatItemAddress(values);
    await safeScope(async () => {
      await OutBoundDetailManager.edit(values, prop.model.id);
      emit('saved', values);
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
