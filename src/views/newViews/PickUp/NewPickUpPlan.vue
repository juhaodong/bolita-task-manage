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
  import { PickUpPlanManager } from '@/views/newViews/PickUp/columns';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';

  interface Props {
    model?: any;
    initialKey?: any[];
  }

  const prop = defineProps<Props>();
  const emit = defineEmits(['saved']);
  let loading: boolean = $ref(false);
  const schemas: FormField[] = [
    {
      field: 'selectedDate',
      component: 'NDatePicker',
      label: '取货时间',
      componentProps: {
        type: 'date',
        clearable: true,
      },
    },
    {
      label: 'Ref',
      field: 'Ref',
    },
    {
      label: 'ISA',
      field: 'ISA',
    },
    {
      label: 'AMZ. F Sendungs ID',
      field: 'AMZID',
    },
    {
      label: 'Zeit',
      field: 'detailTime',
    },
    {
      label: 'Halle',
      field: 'door',
    },
    {
      label: 'Kunden',
      field: 'customer',
    },
    {
      label: 'Adresse',
      field: 'address',
    },
    {
      label: 'Mitarbeiter',
      field: 'staff',
    },
    {
      label: 'Menge',
      field: 'number',
    },
    {
      label: 'Anmerkung',
      field: 'note',
    },
  ];

  async function handleSubmit(values: any) {
    loading = true;
    await safeScope(async () => {
      if (prop?.model?.id) {
        await PickUpPlanManager.editInternal(values, prop.model.id);
      } else {
        await PickUpPlanManager.addInternal(values);
      }
      emit('saved', values);
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
