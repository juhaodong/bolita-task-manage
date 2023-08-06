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
      field: 'OutboundId',
      label: '出库ID',
    },
    {
      field: 'operate',
      label: '操作',
    },
    {
      field: 'customerId',
      label: '客户ID',
    },
    {
      field: 'salesName',
      label: '业务员',
    },
    {
      field: 'toExamine',
      label: '审核',
    },
    {
      field: 'wareHouse',
      label: '仓库',
    },
    {
      field: 'deliveryWay',
      label: '物流方式',
    },
    {
      field: 'trayNum',
      label: '托数',
    },
    {
      field: 'containerNum',
      label: '箱数',
    },
    {
      field: 'targetCountry',
      label: '目的国',
    },
    {
      field: 'FBACode',
      label: 'FBACode',
    },
    {
      field: 'shippingAddress',
      label: '收货地址',
    },
    {
      field: 'createTime',
      label: '创建日期',
    },
    {
      field: 'endTime',
      label: '完成时间',
    },
    {
      field: 'reservationOutboundDate',
      label: '预约出库日期',
    },
    {
      field: 'ageing',
      label: '时效',
    },
    {
      field: 'outboundNum',
      label: '出库数量',
    },
    {
      field: 'outboundStatus',
      label: '出库状态',
    },
    {
      field: 'trayChange',
      label: '托盘置换',
    },
    {
      field: 'voucherAttachment',
      label: '凭证附件',
    },
    {
      field: 'warehouseNote',
      label: '仓库备注',
    },
    {
      field: 'operateRequired',
      label: '操作要求',
    },
    {
      field: 'exchange',
      label: '交流',
    },
    {
      field: 'settlementSituation',
      label: '结算情况',
    },
  ];

  const emit = defineEmits(['submit']);

  function handleSubmit(values: NotifyModel) {
    values.taskList = task;
    emit('submit', values);
  }
</script>

<style lang="less" scoped></style>
