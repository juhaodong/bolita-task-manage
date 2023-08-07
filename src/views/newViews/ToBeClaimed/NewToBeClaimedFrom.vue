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
  import { getFilesUploadFormField } from '@/api/dataLayer/fieldDefination/common';

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
      field: 'deliveryId',
      label: '物流单号',
    },
    {
      field: 'receivingWarehouse',
      label: '收货仓库',
    },
    {
      field: 'containerMark',
      label: '外箱标识',
    },
    getFilesUploadFormField('img', true),
    {
      field: 'storeAddress',
      label: '库位',
    },
  ];

  const emit = defineEmits(['submit']);

  function handleSubmit(values: any) {
    emit('submit', values);
  }
</script>

<style lang="less" scoped></style>
