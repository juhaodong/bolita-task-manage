<template>
  <n-card class="proCard">
    <n-grid :cols="3" x-gap="12">
      <n-gi>
        <normal-form :form-fields="schemas" @submit="handleSubmit" :default-value-model="model" />
      </n-gi>
      <n-gi :span="2">
        <notify-tasks-table
          @tasks-update="(t) => (task = t)"
          :notify-type="NotifyType.TrayOrBox"
          :editable="true"
        />
      </n-gi>
    </n-grid>
  </n-card>
</template>
<script setup lang="ts">
  import dayjs from 'dayjs';
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import { NotifyModel, NotifyType } from '@/api/notify/notify-api';
  import NotifyTasksTable from '@/views/bolita-views/notify/NotifyDetail/NotifyTasksTable.vue';
  import { listUser, PermissionEnums } from '@/api/user/baseUser';
  import { ref } from 'vue';
  import { usePermission } from '@/hooks/web/usePermission';

  interface Props {
    model?: any;
  }
  defineProps<Props>();
  let task = [];
  let customerList = ref<any[]>([]);
  const { hasPermission } = usePermission();
  async function init() {
    customerList.value = (await listUser(PermissionEnums.Customer)).result.map((it) => ({
      label: it.realName,
      value: it.id,
    }));
  }
  init();
  const schemas: FormField[] = [
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
      field: 'reserveTime',
      component: 'NDatePicker',
      label: '预约仓位',
      componentProps: {
        type: 'datetime',
        clearable: true,
        timePickerProps: {
          hours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
          minutes: [0, 15, 30, 45],
          seconds: [0],
        },
        isDateDisabled: (current) => {
          return !(
            dayjs(current).isAfter(dayjs().startOf('d')) &&
            dayjs(current).isBefore(dayjs().add(3, 'month'))
          );
        },
        onUpdateValue: (e: any) => {
          console.log(e);
        },
      },
    },
    {
      field: 'planArriveDateTime',
      component: 'NDatePicker',
      label: '预计到达时间',
      componentProps: {
        type: 'date',
        clearable: true,
        timePickerProps: {
          hours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
          minutes: [0, 15, 30, 45],
          seconds: [0],
        },
        isDateDisabled: (current) => {
          return !(
            dayjs(current).isAfter(dayjs().startOf('d')) &&
            dayjs(current).isBefore(dayjs().add(3, 'month'))
          );
        },
        onUpdateValue: (e: any) => {
          console.log(e);
        },
      },
    },
    {
      field: 'note',
      label: '备注',
      required: false,
    },
  ];

  const emit = defineEmits(['submit']);

  function handleSubmit(values: NotifyModel) {
    values.taskList = task;
    emit('submit', values);
  }
</script>

<style scoped lang="less"></style>
