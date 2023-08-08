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
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { getDatePickerFormField } from '@/api/dataLayer/fieldDefination/common';
  import { CarpoolManager, updatePickupTime } from '@/api/dataLayer/modules/logistic/carpool';

  interface Props {
    model?: any;
  }

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();

  const schemas: FormField[] = [
    {
      field: 'ISA',
      label: 'ISA',
    },
    getDatePickerFormField('reservationGetProductTime', '预约取货时间'),
    {
      field: 'REF',
      label: 'REF.',
    },
    {
      field: 'deliveryCompany',
      label: '运输公司',
    },
  ].map((it) => {
    it.required = false;
    return it;
  });

  const emit = defineEmits(['saved']);

  async function handleSubmit(values) {
    loading = true;
    await safeScope(async () => {
      await CarpoolManager.editInternal(values, prop.model.id);
      await updatePickupTime(values.reservationGetProductTime);
      emit('saved', values);
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
