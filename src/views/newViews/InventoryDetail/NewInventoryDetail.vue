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
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { NotifyDetailManager } from '@/api/dataLayer/modules/notify/notify-detail';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';

  interface Props {
    model?: any;
  }

  const prop = defineProps<Props>();

  let loading: boolean = $ref(false);

  const schemas: FormField[] = [
    {
      field: 'trayNum',
      label: '托',
    },
    {
      field: 'containerNum',
      label: '数量',
    },
    {
      field: 'note',
      label: '备注',
    },
    {
      field: 'storeAddress',
      label: '库位',
    },
  ].map((it: FormField) => {
    it.required = false;
    return it;
  });

  const emit = defineEmits(['saved']);

  async function handleSubmit(values: any) {
    loading = true;
    await safeScope(async () => {
      await NotifyDetailManager.edit(values, prop.model.id);
      emit('saved', values);
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
