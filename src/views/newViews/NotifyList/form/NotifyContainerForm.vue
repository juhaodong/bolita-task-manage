<template>
  <n-card class="proCard">
    <normal-form :default-value-model="model" :form-fields="schemas" @submit="handleSubmit" />
  </n-card>
</template>
<script setup lang="ts">
  import dayjs from 'dayjs';
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { ref } from 'vue';
  import { usePermission } from '@/hooks/web/usePermission';
  import { listUser, PermissionEnums } from '@/api/dataLayer/modules/system/user/baseUser';
  import {
    asyncCustomerFormField,
    getFilesUploadFormField,
    salesFormField,
  } from '@/api/dataLayer/fieldDefination/common';
  import { FormFields } from '@/api/dataLayer/common/GeneralModel';

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
  const schemas: FormFields = [
    asyncCustomerFormField(),
    {
      field: 'containerNo',
      label: '货柜号',
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
      field: 'planArriveDateTime',
      component: 'NDatePicker',
      label: '预计到仓时间',
      componentProps: {
        type: 'date',
        clearable: true,
      },
    },
    {
      field: 'reserveTime',
      component: 'NDatePicker',
      label: '预约仓位',
      required: false,
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
      field: 'totalWeight',
      label: '总重量',
      required: false,
    },
    getFilesUploadFormField('uploadFile', true, () => {
      window.open(
        'https://firebasestorage.googlea' +
          'pis.com/v0/b/bolita-task-manage.appspot.' +
          'com/o/%E8%B4%A7%E6%9F%9C%E6%A8%A1%E6%9D%BF' +
          '.xlsx?alt=media&token=a5cfed10-917c-41dd-806d-5d9addd5156d'
      );
    }),
    {
      field: 'note',
      label: '备注',
      required: false,
    },
    salesFormField,
  ];

  const emit = defineEmits(['submit']);

  function handleSubmit(values: any) {
    console.log(values);
    emit('submit', values);
  }
</script>

<style scoped lang="less"></style>
