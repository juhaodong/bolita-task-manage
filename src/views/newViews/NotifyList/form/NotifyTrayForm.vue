<template>
  <n-card class="proCard">
    <normal-form :form-fields="schemas" @submit="handleSubmit" :default-value-model="model" />
  </n-card>
</template>
<script setup lang="ts">
  import dayjs from 'dayjs';
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import { NotifyModel } from '@/views/newViews/NotifyList/api/notify-api';
  import { listUser, PermissionEnums } from '@/api/user/baseUser';
  import { ref } from 'vue';
  import { usePermission } from '@/hooks/web/usePermission';
  import { getFilesUploadFormField } from '@/api/dataLayer/fieldDefination/form-field-sort-label';

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
    getFilesUploadFormField('uploadFile', true, () => {
      window.open(
        'https://firebasestorage.googleapis.com/' +
          'v0/b/bolita-task-manage.appspot.com/o/' +
          'template%2F%E6%95%A3%E8%B4%A7%E6%A8%A1%E6%9D%BF.xlsx?' +
          'alt=media&token=ae08fd2d-8977-451d-9d2f-22b404480e5b'
      );
    }),
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
