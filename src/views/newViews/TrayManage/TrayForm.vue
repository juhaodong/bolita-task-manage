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
  import { getDatePickerFormField } from '@/api/dataLayer/fieldDefination/common';
  import { OutBoundPlanManager } from '@/api/dataLayer/modules/OutBoundPlan/outBoundPlan';

  interface Props {
    model?: any;
  }

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();
  const schemas: FormFields = [
    {
      label: '退回托盘数量',
      field: 'backTrayNumber',
    },
    getDatePickerFormField('returnTime', '退回时间'),
    {
      label: '备注',
      field: 'note',
      required: false,
    },
  ];

  const emit = defineEmits(['saved']);

  async function handleSubmit(values: any) {
    loading = true;
    await safeScope(async () => {
      await OutBoundPlanManager.editInternal(values, prop.model.id);
      emit('saved', values);
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
