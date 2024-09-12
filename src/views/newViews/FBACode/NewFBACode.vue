<template>
  <n-card class="proCard">
    <loading-frame :loading="loading">
      <normal-form
        :default-value-model="model"
        :form-fields="model ? schemas : schemasWithoutId"
        @submit="handleSubmit"
      />
    </loading-frame>
  </n-card>
</template>
<script lang="ts" setup>
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { FormFields, safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { addOrUpdateFBACode } from '@/api/newDataLayer/FBACode/FBACode';

  interface Props {
    model?: any;
  }

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();
  const schemas: FormFields = [
    {
      label: 'id',
      field: 'id',
      required: false,
      disableCondition: () => {
        return prop.model?.id;
      },
      displayCondition: () => {
        return prop.model?.id;
      },
    },
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

  const schemasWithoutId: FormFields = [
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
      await addOrUpdateFBACode(values);
      emit('saved', values);
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
