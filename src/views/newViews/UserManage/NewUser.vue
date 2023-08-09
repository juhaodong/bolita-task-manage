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
  import { formatItemAddress } from '@/api/dataLayer/fieldDefination/addressGroup';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { OutBoundDetailManager } from '@/api/dataLayer/modules/OutBoundPlan/outBoundPlan';

  interface Props {
    model?: any;
  }

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();
  console.log(prop.model);
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
      label: '公司',
      field: 'company',
    },
    {
      label: '部门',
      field: 'department',
    },
    {
      label: '用户类型',
      field: 'userType',
    },
    {
      label: '操作',
      field: 'action',
    },
    {
      label: '备注',
      field: 'note',
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
    formatItemAddress(values);
    await safeScope(async () => {
      await OutBoundDetailManager.edit(values, prop.model.id);
      emit('saved', values);
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
