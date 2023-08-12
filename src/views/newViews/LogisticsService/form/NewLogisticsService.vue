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
  import {
    asyncCustomerFormField,
    deliveryMethodSelection,
    getDatePickerFormField,
    getFilesUploadFormField,
  } from '@/api/dataLayer/fieldDefination/common';
  import { reactive } from 'vue';
  import { LogisticServiceManager } from '@/api/dataLayer/modules/logistic/logistcService';

  interface Props {
    model?: any;
  }
  const schemas: FormField[] = reactive(
    [
      {
        field: 'ticketId',
        label: '票号/订单号',
      },
      getDatePickerFormField(),
      {
        field: 'outId',
        label: '出库ID',
      },
      ...deliveryMethodSelection,
      {
        field: 'ISA',
        label: 'ISA',
      },
      {
        field: 'wrongDescribe',
        label: '异常描述',
      },
      getFilesUploadFormField(),
    ].map((it: FormField) => {
      it.required = false;
      return it;
    })
  );
  async function init() {
    schemas.unshift(await asyncCustomerFormField());
  }
  init();

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();

  const emit = defineEmits(['saved']);

  async function handleSubmit(values) {
    loading = true;
    if (prop.model) {
      await safeScope(async () => {
        await LogisticServiceManager.editInternal(values, prop.model.id);
        emit('saved', values);
      });
    } else {
      await safeScope(async () => {
        await LogisticServiceManager.addInternal(values);
        emit('saved', values);
      });
    }
    loading = false;
  }
</script>

<style lang="less" scoped></style>
