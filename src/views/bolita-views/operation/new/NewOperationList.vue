<template>
  <loading-frame>
    <n-card class="proCard">
      <normal-form :default-value-model="model" :form-fields="schemas" @submit="handleSubmit" />
    </n-card>
  </loading-frame>
</template>
<script setup lang="ts">
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import { ref } from 'vue';
  import { usePermission } from '@/hooks/web/usePermission';
  import { listUser, PermissionEnums } from '@/api/user/baseUser';
  import { getFormFieldForTaskType } from '@/api/task/taskRepo';
  import { TaskType } from '@/api/task/task-types';
  import { createTask } from '@/api/task/task-api';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';

  interface Props {
    taskType: TaskType;
    model?: any;
  }

  const props = defineProps<Props>();

  let customerList = ref<any[]>([]);
  const { hasPermission } = usePermission();
  async function init() {
    customerList.value = (await listUser(PermissionEnums.Customer)).result.map((it) => ({
      label: it.realName,
      value: it.id,
    }));
  }
  init();
  const customerField: FormField = {
    field: 'customerId',
    label: '客户',
    component: 'NSelect',
    componentProps: {
      options: customerList,
    },
    displayCondition() {
      return !hasPermission([PermissionEnums.Customer]);
    },
  };
  const schemas: FormField[] = getFormFieldForTaskType(props.taskType, customerField);

  const emit = defineEmits(['submit', 'loading', 'stop']);

  async function handleSubmit(values) {
    emit('loading');
    await createTask(values);
    emit('stop');
    emit('submit', values);
  }
</script>

<style scoped lang="less"></style>
