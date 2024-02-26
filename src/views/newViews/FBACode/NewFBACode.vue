<template>
  <n-card class="proCard">
    <loading-frame :loading="loading">
      <normal-form :default-value-model="model" :form-fields="schemas" @submit="handleSubmit" />
    </loading-frame>
  </n-card>
</template>
<script lang="ts" setup>
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { FormFields, safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { FBACodeManager } from '@/api/dataLayer/modules/user/user';

  interface Props {
    model?: any;
  }

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();
  const schemas: FormFields = [
    {
      label: 'FBA码',
      field: 'code',
    },
    {
      label: '地址',
      field: 'address',
    },
    {
      label: '城市',
      field: 'city',
    },
    {
      label: '州',
      field: 'state',
    },
    {
      label: '邮编',
      field: 'postcode',
    },
  ];

  const emit = defineEmits(['saved']);

  async function handleSubmit(values: any) {
    loading = true;
    await safeScope(async () => {
      if (prop?.model?.id) {
        await FBACodeManager.editInternal(values, prop.model.id);
      } else {
        await FBACodeManager.addInternal(values);
      }
      emit('saved', values);
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
