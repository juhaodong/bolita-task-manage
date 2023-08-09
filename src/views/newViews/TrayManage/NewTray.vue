<template>
  <n-card class="proCard">
    <normal-form :default-value-model="model" :form-fields="schemas" @submit="handleSubmit" />
  </n-card>
</template>
<script lang="ts" setup>
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import { ref } from 'vue';
  import { listUser, PermissionEnums } from '@/api/dataLayer/modules/system/user/baseUser';

  interface Props {
    model?: any;
  }

  defineProps<Props>();

  let customerList = ref<any[]>([]);

  async function init() {
    customerList.value = (await listUser(PermissionEnums.Customer)).result.map((it) => ({
      label: it.realName,
      value: it.id,
    }));
  }

  init();
  const schemas: FormField[] = [
    {
      label: '结算ID',
      field: 'id',
    },
    {
      label: '拼车ID',
      field: 'id',
    },
    {
      label: '物流ID',
      field: 'logisticId',
    },
    {
      field: 'date',
      component: 'NDatePicker',
      label: '日期',
      componentProps: {
        type: 'date',
        clearable: true,
      },
    },
    {
      label: '仓库',
      field: 'warehouseName',
    },
    {
      label: '托盘',
      field: 'tray',
    },
    {
      label: '运输公司',
      field: 'deliveryCompany',
    },
    {
      label: '退回托盘数量',
      field: 'backTrayNumber',
    },
    {
      field: 'time',
      component: 'NDatePicker',
      label: '时间',
      componentProps: {
        type: 'date',
        clearable: true,
      },
    },
    {
      label: '备注',
      field: 'note',
    },
  ];

  const emit = defineEmits(['submit']);

  function handleSubmit(values: any) {
    emit('submit', values);
  }
</script>

<style lang="less" scoped></style>
