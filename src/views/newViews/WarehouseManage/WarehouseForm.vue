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
  import { generateOptionFromTimeArray } from '@/store/utils/utils';
  import { timeArrays } from '@/api/newDataLayer/Common/Common';
  import { addOrUpdateInventory } from '@/api/newDataLayer/Warehouse/Warehouse';

  interface Props {
    model?: any;
  }

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();
  const schemas: FormFields = [
    {
      label: 'id',
      field: 'id',
      disableCondition: () => {
        return prop.model?.id;
      },
      displayCondition: () => {
        return prop.model?.id;
      },
    },
    {
      label: '仓库ID',
      field: 'name',
    },
    {
      label: '公司名称',
      field: 'companyName',
    },
    {
      label: '国家',
      field: 'country',
      defaultValue: '',
      required: false,
    },
    {
      label: '地址',
      field: 'address',
      defaultValue: '',
      required: false,
    },
    {
      label: '面积',
      field: 'area',
      defaultValue: '',
      required: false,
    },
    {
      label: '开放时间',
      field: 'useTimeSpan',
      component: 'NSelect',
      componentProps: {
        options: generateOptionFromTimeArray(timeArrays),
        multiple: true,
      },
      defaultValue: [],
      required: false,
    },
    {
      label: '开放库位',
      field: 'useAmount',
      defaultValue: '1',
    },
  ];

  const emit = defineEmits(['saved']);

  async function handleSubmit(values: any) {
    console.log(values, 'value');
    values.useTimeSpan = values.useTimeSpan.join(',');
    loading = true;
    await safeScope(async () => {
      await addOrUpdateInventory(values);
      emit('saved');
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
