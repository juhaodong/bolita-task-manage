<template>
  <n-card class="proCard">
    <normal-form :form-fields="schemas" @submit="handleSubmit" :default-value-model="model" />
  </n-card>
</template>
<script setup lang="ts">
  import { generateOptionFromArray } from '@/utils/utils';
  import { listUser, PermissionEnums } from '@/api/user/baseUser';
  import { ref } from 'vue';
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import { questNotifyTypeList } from '@/api/quest/quest-type';
  import { usePermission } from '@/hooks/web/usePermission';

  let warehouseList = ref<any[]>([]);
  let customerList = ref<any[]>([]);
  const { hasPermission } = usePermission();
  interface Props {
    model: any;
  }
  const props = defineProps<Props>();

  const schemas: FormField[] = [
    {
      field: 'notifyType',
      component: 'NSelect',
      label: '货物预报类型',
      componentProps: {
        options: generateOptionFromArray(questNotifyTypeList),
      },
    },
    {
      field: 'customerId',
      label: '客户',
      component: 'NSelect',
      componentProps: {
        options: customerList,
      },
      displayCondition() {
        return !hasPermission([PermissionEnums.Customer]);
      },
    },
    {
      field: 'boxCount',
      labelMessage: '请在此填入本次预计需要操作的总箱数，如果是货柜，请填写货柜内的总箱数',
      component: 'NInputNumber',
      label: '箱数',
      componentProps: {
        step: 1,
        precision: 0,
      },
    },
    {
      field: 'note',
      component: 'NInput',
      label: '备注',
      componentProps: {
        placeholder: '一些需要我们注意的事情',
      },
      required: false,
    },
  ];

  const emit = defineEmits(['submit']);

  function handleSubmit(values: Recordable) {
    emit('submit', values);
    console.log(values);
  }

  async function init() {
    warehouseList.value = (await listUser(PermissionEnums.Operator)).result.map((it) => ({
      label: it.realName,
      value: it.id,
    }));
    customerList.value = (await listUser(PermissionEnums.Customer)).result.map((it) => ({
      label: it.realName,
      value: it.id,
    }));
  }

  init();
</script>

<style scoped lang="less"></style>
