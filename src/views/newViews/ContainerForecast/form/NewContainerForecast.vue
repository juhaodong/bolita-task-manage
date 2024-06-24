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
  import {
    asyncUserCustomer,
    asyncWarehouseList,
    generateOptionFromArray,
  } from '@/store/utils/utils';
  import { reservationTimeList } from '@/views/newViews/ContainerForecast/columns';

  interface Props {
    model?: any;
    defaultValue: any;
  }

  const prop = defineProps<Props>();

  const schemas: FormFields = [
    asyncUserCustomer(prop.defaultValue.customerName),
    {
      field: 'containerNo',
      label: '货柜号',
      defaultValue: prop.defaultValue.containerNo,
    },
    asyncWarehouseList(prop.defaultValue.warehouseId),
    {
      field: 'planArriveDateTime',
      component: 'NDatePicker',
      label: '预计到仓时间',
      defaultValue: prop.defaultValue.planArriveDateTime,
      componentProps: {
        type: 'date',
        clearable: true,
      },
    },
    {
      field: 'inHouseTime',
      label: '到达时间',
      component: 'NSelect',
      defaultValue: prop.defaultValue.inHouseTime,
      componentProps: {
        options: generateOptionFromArray(reservationTimeList),
      },
    },
    getFilesUploadFormField('files', false, () => {
      window.open(
        'https://firebasestorage.googleapis.com/v0/b/bolita-task-manage.appspot.com/o/NotifyMoBan.xlsx?alt=media&token=12ccc420-eb09-4afb-9ad4-fff39da9da77'
      );
    }),
    {
      field: 'note',
      label: '预报备注',
      defaultValue: prop.defaultValue.note,
      required: false,
    },
  ];

  const emit = defineEmits(['submit', 'closed']);
  async function handleSubmit(values: any) {
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
