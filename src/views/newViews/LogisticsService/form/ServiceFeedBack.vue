<template>
  <n-card class="proCard">
    <loading-frame :loading="loading">
      <normal-form :form-fields="schemas" @submit="handleSubmit" :default-value-model="model" />
    </loading-frame>
  </n-card>
</template>
<script lang="ts" setup>
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { reactive } from 'vue';
  import {
    handleStatus,
    LogisticServiceManager,
  } from '@/api/dataLayer/modules/logistic/logistcService';
  import { generateOptionFromArray } from '@/store/utils/utils';
  import { getDatePickerFormField } from '@/api/dataLayer/fieldDefination/common';
  import { OperationType, saveCash } from '@/api/dataLayer/modules/cash/cash';

  interface Props {
    model?: any;
  }

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();

  const schemas: FormField[] = reactive(
    [
      getDatePickerFormField('checkDate', '开查时间'),
      getDatePickerFormField('endDate', '截止时间'),
      {
        field: 'processingProgress',
        label: '处理进度',
      },
      {
        field: 'handlingFeedback',
        label: '处理反馈',
      },
      {
        field: 'claimantID',
        label: '索赔号',
      },
      {
        field: 'handleStatus',
        label: '处理状态',
        component: 'NSelect',
        componentProps: {
          options: generateOptionFromArray(handleStatus),
        },
      },
      {
        field: 'applicationsAmount',
        label: '申请金额',
      },
      {
        field: 'claimAmount',
        label: '索赔金额',
      },
    ].map((it: FormField) => {
      it.required = false;
      return it;
    })
  );

  const emit = defineEmits(['saved']);

  async function handleSubmit(values) {
    loading = true;

    await safeScope(async () => {
      if (values.claimAmount) {
        values.cashId = await saveCash(
          {
            customerId: prop.model?.customerId,
            containerNo: prop.model?.containerNo ?? '',
            operationId: prop.model?.id,
            operationType: OperationType.Refund,
            amount: values.claimAmount,
            note: values.note,
          },
          prop.model?.cashId
        );
      }
      await LogisticServiceManager.editInternal(values, prop.model.id);
      emit('saved', values);
    });

    loading = false;
  }
</script>

<style lang="less" scoped></style>
