<template>
  <n-card class="proCard">
    <normal-form :default-value-model="model" :form-fields="schemas" @submit="handleSubmit" />
  </n-card>
</template>
<script lang="ts" setup>
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import { NotifyModel } from '@/api/notify/notify-api';
  import { ref } from 'vue';
  import { usePermission } from '@/hooks/web/usePermission';
  import { listUser, PermissionEnums } from '@/api/user/baseUser';

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
      field: 'warehousingTime',
      label: '入库时间',
    },
    {
      field: 'deliveryMethod',
      label: '物流渠道',
    },
    {
      field: 'deliveryId',
      label: '物流单号',
    },
    {
      field: 'receivingWarehouse',
      label: '收货仓库',
    },
    {
      field: 'containerLogo',
      label: '外箱标识',
    },
    {
      field: 'img',
      label: '图片',
    },
    {
      field: 'claimStatus',
      label: '认领状态',
    },
    {
      field: 'claimCustomId',
      label: '认领客户ID',
    },
    {
      field: 'storageDays',
      label: '在库天数',
    },
    {
      field: 'discardTime',
      label: '废弃时间点',
    },
    {
      field: 'storeAddress',
      label: '库位',
    },
  ];

  const emit = defineEmits(['submit']);

  function handleSubmit(values: NotifyModel) {
    values.taskList = task;
    emit('submit', values);
  }
</script>

<style lang="less" scoped></style>
