<template>
  <n-card class="proCard"> <normal-form :form-fields="schemas" @submit="handleSubmit" /></n-card>
</template>
<script setup lang="ts">
  import { listUser, PermissionEnums } from '@/api/dataLayer/modules/system/user/baseUser';
  import { Ref, ref, UnwrapRef } from 'vue';
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import { getDeliveryMethodSelection } from '@/api/dataLayer/fieldDefination/common';

  let warehouseList: Ref<UnwrapRef<Array<any>>> = ref([]);
  const schemas: FormField[] = [
    {
      field: 'boxCount',
      component: 'NInputNumber',
      label: '箱数',
      required: true,
    },
    ...getDeliveryMethodSelection(),
    {
      field: 'warehouseId',
      component: 'NSelect',
      label: '操作仓库',
      componentProps: {
        options: warehouseList,
      },
      required: true,
    },
    {
      field: 'note',
      component: 'NInput',
      label: '备注',
      componentProps: {
        placeholder: '一些需要我们注意的事情',
      },
      required: false,
    },
  ];

  const emit = defineEmits(['submit']);

  function handleSubmit(values: Recordable) {
    emit('submit', values);
    console.log(values);
  }
  async function init() {
    warehouseList.value = (await listUser(PermissionEnums.Warehouse)).result.map((it) => ({
      label: it.realName,
      value: it.id,
    }));
  }

  init();
</script>

<style scoped lang="less"></style>
