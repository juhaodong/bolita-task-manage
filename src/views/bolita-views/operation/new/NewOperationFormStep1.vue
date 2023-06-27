<template>
  <n-card class="proCard">
    <normal-form :form-fields="schemas" @submit="handleSubmit" />
  </n-card>
</template>
<script setup lang="ts">
  import { generateOptionFromArray } from '@/utils/utils';
  import { listUser, PermissionEnums } from '@/api/user/baseUser';
  import { ref } from 'vue';

  import { taskTypes } from '@/api/task/task-types';
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';

  let warehouseList = ref<any[]>([]);
  const schemas: FormField[] = [
    {
      field: 'boxCount',
      labelMessage: '请在此填入本次预计到达的总箱数，如果是货柜，请填写货柜内的总箱数',
      component: 'NInputNumber',
      label: '箱数',
      componentProps: {
        type: 'number',
        step: 1,
        precision: 0,
      },
    },
    {
      field: 'taskType',
      component: 'NSelect',
      label: '任务类型',
      componentProps: {
        options: generateOptionFromArray(taskTypes),
      },
    },
    {
      field: 'sortLabel',
      label: '分拣码',
      required: false,
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
    {
      field: 'refLink',
      component: 'NInput',
      label: '业务链接',
      componentProps: {
        placeholder: '业务操作后台的链接',
      },
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
  }

  init();
</script>

<style scoped lang="less"></style>
