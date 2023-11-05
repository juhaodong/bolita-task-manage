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
  import { generateOptionFromArray } from '@/store/utils/utils';
  import { UserType } from '@/views/newViews/UserManage/columns';
  import { UserManager } from '@/api/dataLayer/modules/user/user';

  interface Props {
    model?: any;
  }

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();
  const availableUserType = $computed(() => {
    const id = prop?.model?.belongsToId;
    if (id) {
      if (id.startsWith('W')) {
        return [UserType.Operator, UserType.Sales];
      } else if (id.startsWith('C')) {
        return [UserType.CustomerService, UserType.CustomerManage];
      }
    } else {
      return Object.values(UserType);
    }
  });
  const schemas: FormField[] = [
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
    {
      label: '所属',
      field: 'belongsToId',
      required: false,
      disableCondition() {
        return true;
      },
    },
    {
      label: '备注',
      field: 'note',
      required: false,
    },
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
      if (prop?.model?.id) {
        await UserManager.editInternal(values, prop.model.id);
      } else {
        await UserManager.addInternal(values);
      }
      emit('saved', values);
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
