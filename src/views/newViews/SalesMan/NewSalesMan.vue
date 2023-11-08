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
  import { SalesManManager } from '@/api/dataLayer/modules/user/user';
  import { PermissionEnums } from '@/api/dataLayer/modules/system/user/baseUser';
  import { asyncCustomerWarehouseFormField } from '@/api/dataLayer/fieldDefination/common';

  interface Props {
    model?: any;
    warehouseList: [];
  }

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();
  const schemas: FormField[] = [
    {
      label: '用户名',
      field: 'userName',
    },
    {
      label: '名称',
      field: 'realName',
    },
    {
      label: '用户类型',
      field: 'userType',
      defaultValue: PermissionEnums.Sales,
      disableCondition: () => {
        return true;
      },
    },
    {
      label: '登录名',
      field: 'loginName',
    },
    {
      label: '密码',
      field: 'password',
    },
    asyncCustomerWarehouseFormField(true),
  ];

  const emit = defineEmits(['saved']);

  async function handleSubmit(values: any) {
    loading = true;
    await safeScope(async () => {
      if (prop?.model?.id) {
        await SalesManManager.editInternal(values, prop.model.id);
      } else {
        await SalesManManager.addInternal(values);
      }
      emit('saved', values);
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
