<template>
  <n-card class="proCard">
    <normal-form :form-fields="schemas" @submit="handleSubmit" :default-value-model="model">
      <div class="flex mb-4">
        <div style="width: 140px"></div>
        <div>
          <n-data-table :columns="columns" :data="task" />
          <div class="mt-4">
            <n-button @click="task.push(generateDefaultColumn())" class="mt-4" type="info" secondary
              >添加</n-button
            >
          </div>
        </div>
      </div>
    </normal-form>
  </n-card>
</template>
<script setup lang="ts">
  import dayjs from 'dayjs';
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { NotifyType } from '@/api/dataLayer/modules/notify/notify-api';
  import { reactive } from 'vue';
  import {
    asyncCustomerFormField,
    getFilesUploadFormField,
  } from '@/api/dataLayer/fieldDefination/common';
  import { getNeededColumnByNotifyType } from '@/api/dataLayer/modules/notify/NotifyRepository';
  import { editableColumn } from '@/views/bolita-views/composable/useableColumns';
  import { FormFields } from '@/api/dataLayer/common/GeneralModel';

  interface Props {
    model?: any;
  }
  let keyCounter = 0;
  defineProps<Props>();
  let task = reactive([generateDefaultColumn()]);
  function generateDefaultColumn() {
    return {
      key: keyCounter++,
    };
  }

  const schemas: FormFields = [
    asyncCustomerFormField(),
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
    getFilesUploadFormField('files', false, () => {
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
  const columns = getNeededColumnByNotifyType(NotifyType.TrayOrBox).map((it) =>
    editableColumn(it, task)
  );

  function handleSubmit(values: any) {
    values.trayTaskList = task.filter((it: any) => {
      delete it.key;
      return Object.values(it).join();
    });
    emit('submit', values);
  }
</script>

<style scoped lang="less"></style>
