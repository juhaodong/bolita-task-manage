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
  import {
    CustomerManager,
    customerStatusSelection,
    UserManager,
  } from '@/api/dataLayer/modules/user/user';
  import { $ref } from 'vue/macros';
  import {
    asyncCustomerWarehouseFormField,
    asyncSalesManFormField,
  } from '@/api/dataLayer/fieldDefination/common';

  interface Props {
    model?: any;
    salesManList: [];
  }

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();
  const schemas: FormFields = [
    {
      label: '客户名称',
      field: 'customerName',
    },
    {
      label: '业务关联方',
      field: 'businessParty',
      required: false,
    },
    asyncCustomerWarehouseFormField(false),
    asyncSalesManFormField(),
    // {
    //   label: '使用系统',
    //   field: 'useSystem',
    //   required: false,
    // },
    // {
    //   label: '快速账号绑定',
    //   field: 'quickBindAccount',
    //   required: false,
    // },
    customerStatusSelection,
    {
      label: '备注',
      field: 'note',
      required: false,
    },
  ];

  const emit = defineEmits(['saved']);

  async function handleSubmit(values: any) {
    loading = true;
    values.belongSalesId =
      (await UserManager.load()).find((it) => it.realName === values.belongSalesMan)?.id ?? '';
    if (!values.belongSalesId) {
      values.belongSalesMan = '';
    }
    await safeScope(async () => {
      if (prop?.model?.id) {
        await CustomerManager.editInternal(values, prop.model.id);
      } else {
        await CustomerManager.addInternal(values);
      }
      emit('saved', values);
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
