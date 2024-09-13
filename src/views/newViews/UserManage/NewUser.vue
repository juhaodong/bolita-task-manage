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
  import { asyncMultipleCustomer, generateOptionFromArray } from '@/store/utils/utils';
  import { UserType, UserTypeByArray } from '@/views/newViews/UserManage/columns';
  import { getPowerTypeByName } from '@/api/newDataLayer/Power/Power';
  import { $ref } from 'vue/macros';
  import { addOrUpdateUser } from '@/api/newDataLayer/User/User';
  import { flatChildrenById } from '@/api/newDataLayer/Power/PowerItems';
  import { getCustomerList } from '@/api/newDataLayer/Customer/Customer';

  interface Props {
    model?: any;
  }

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();
  const availableUserType = $computed(() => {
    return Object.values(UserType);
  });
  const schemas: FormField[] = [
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
      label: '用户名',
      field: 'userName',
    },
    {
      label: '名称',
      field: 'realName',
      required: false,
    },
    {
      label: '公司',
      field: 'company',
      required: false,
    },
    {
      label: '部门',
      field: 'department',
      required: false,
    },
    {
      label: '用户类型',
      field: 'userType',
      component: 'NSelect',
      componentProps: {
        options: generateOptionFromArray(availableUserType),
      },
    },
    asyncMultipleCustomer(),
    {
      label: '登录名',
      field: 'loginName',
    },
    {
      label: '密码',
      field: 'password',
    },
  ];

  const emit = defineEmits(['saved']);

  async function handleSubmit(values: any) {
    loading = true;
    await safeScope(async () => {
      const res = UserTypeByArray.find((it) => it.label === values.userType);
      values.company = values.company ?? '';
      values.token = values.token ?? '';
      values.department = values.department ?? '';
      values.customerName = values?.customerName ?? '';
      values.customerIds = values?.customerIds ? values?.customerIds.join(',') : '';
      values.realName = values.realName ?? '';
      if (values.customerIds === 'all') {
        values.customerIds = (await getCustomerList()).map((it) => it.id).join(',');
      }
      const allPowerList = (await getPowerTypeByName(res.label)) ?? [];
      values.powerTypeItemIds = flatChildrenById(allPowerList);
      await addOrUpdateUser(values);
      emit('saved');
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
