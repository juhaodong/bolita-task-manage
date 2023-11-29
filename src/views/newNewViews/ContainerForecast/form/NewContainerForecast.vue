<template>
  <n-card class="proCard">
    <normal-form :default-value-model="model" :form-fields="schemas" @submit="handleSubmit" />
  </n-card>
</template>
<script lang="ts" setup>
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { getFilesUploadFormField } from '@/api/dataLayer/fieldDefination/common';
  import { FormFields, safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { NotifyManager } from '@/api/dataLayer/modules/notify/notify-api';

  interface Props {
    model?: any;
  }

  const prop = defineProps<Props>();

  const schemas: FormFields = [
    {
      field: 'weeks',
      label: '自然周',
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
      field: 'address',
      label: '地址',
    },
    {
      field: 'realArriveDateTime',
      component: 'NDatePicker',
      label: '实际仓位日期',
      componentProps: {
        type: 'date',
        clearable: true,
      },
    },
    {
      field: 'inHouseTime',
      label: '仓位时间',
      required: false,
    },
    getFilesUploadFormField('files', false, () => {
      window.open(
        'https://firebasestorage.googlea' +
          'pis.com/v0/b/bolita-task-manage.appspot.' +
          'com/o/%E8%B4%A7%E6%9F%9C%E6%A8%A1%E6%9D%BF' +
          '.xlsx?alt=media&token=a5cfed10-917c-41dd-806d-5d9addd5156d'
      );
    }),
    {
      field: 'trayNum',
      label: '托盘',
    },
    {
      field: 'carNumber',
      label: '卡车号',
    },
    {
      field: 'ISA',
      label: 'ISA',
    },
    {
      field: 'destination',
      label: '目的地',
    },
    {
      field: 'bookingCar',
      component: 'NSelect',
      label: '可约车',
      componentProps: {
        options: [
          { value: '1', label: '是' },
          { value: '0', label: '否' },
        ],
      },
    },
    {
      field: 'pickUpDateTime',
      component: 'NDatePicker',
      label: '提货时间',
      componentProps: {
        type: 'date',
        clearable: true,
      },
    },
    {
      field: 'pickUpPerson',
      label: '提货方',
    },
    {
      field: 'detail',
      label: '明细',
    },
    {
      field: 'POD',
      label: 'POD',
    },
    {
      field: 'note',
      label: '备注',
    },
  ];

  const emit = defineEmits(['submit', 'closed']);
  async function handleSubmit(values: any) {
    console.log(values);
    console.log(prop?.model?.id, 'prop?.model?.id');
    await safeScope(async () => {
      if (prop?.model?.id) {
        await NotifyManager.editInternal(values, prop.model.id);
        emit('closed');
      } else {
        emit('submit', values);
      }
    });
  }
</script>

<style lang="less" scoped></style>
