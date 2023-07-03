<template>
  <n-card class="proCard">
    <n-grid :cols="3" x-gap="12">
      <n-gi>
        <normal-form :default-value-model="model" :form-fields="schemas" @submit="handleSubmit" />
      </n-gi>
      <n-gi :span="2">
        <notify-tasks-table :notify-type="NotifyType.Container" :editable="true" notify-id="" />
      </n-gi>
    </n-grid>
  </n-card>
</template>
<script setup lang="ts">
  import dayjs from 'dayjs';
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import NotifyTasksTable from '@/views/bolita-views/notify/NotifyDetail/NotifyTasksTable.vue';
  import { NotifyType } from '@/api/notify/notify-api';
  import { ref } from 'vue';
  import { usePermission } from '@/hooks/web/usePermission';
  import { listUser, PermissionEnums } from '@/api/user/baseUser';

  interface Props {
    model?: any;
  }

  defineProps<Props>();

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
      field: 'containerNo',
      label: '货柜号',
      componentProps: {
        placeholder: '请输入货柜号',
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
      field: 'containerSize',
      component: 'NSelect',
      label: '货柜尺寸',
      componentProps: {
        options: [
          { value: '20H', label: '20H' },
          { value: '40H', label: '40H' },
          { value: '45H', label: '45H' },
        ],
      },
    },
    {
      field: 'containerType',
      component: 'NSelect',
      label: '货柜类型',
      componentProps: {
        options: [
          { value: '常规货柜', label: '常规货柜' },
          { value: '查验柜', label: '查验柜' },
          { value: '工业品', label: '工业品' },
          { value: '倒柜', label: '倒柜' },
        ],
      },
    },
    {
      field: 'note',
      label: '备注',
      required: false,
    },
  ];

  const emit = defineEmits(['submit']);

  function handleSubmit(values: Recordable) {
    emit('submit', values);
    console.log(values);
  }
</script>

<style scoped lang="less"></style>
