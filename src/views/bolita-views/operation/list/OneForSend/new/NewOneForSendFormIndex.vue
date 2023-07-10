<template>
  <n-card class="proCard">
    <normal-form :default-value-model="model" :form-fields="schemas" @submit="handleSubmit" />
  </n-card>
</template>
<script setup lang="ts">
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import { NotifyModel } from '@/api/notify/notify-api';
  import { ref } from 'vue';
  import { usePermission } from '@/hooks/web/usePermission';
  import { listUser, PermissionEnums } from '@/api/user/baseUser';
  import { formFieldUnitSelection } from '@/api/model/common/BoxOrTray';
  import { sizeFormField } from '@/api/model/common/SizeFormField';
  import { outBoundFormField } from '@/api/deliveryMethod';
  import { deliveryAddressDetail } from '@/api/model/common/addressGroup';

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
  const customerField = {
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
  const schemas: FormField[] = [
    {
      field: 'notifyId',
      label: '入库ID',
      required: false,
    },
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
      field: 'sortLabel',
      label: '分拣ID',
    },
    {
      field: 'boxNo',
      label: '箱号',
    },
    {
      field: 'SKU',
      label: 'SKU',
    },
    formFieldUnitSelection,

    {
      field: 'boxCount',
      label: '数量',
    },
    ...sizeFormField,
    outBoundFormField,
    ...deliveryAddressDetail.map((it) => {
      it.group = '收货地址';
      return it;
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
