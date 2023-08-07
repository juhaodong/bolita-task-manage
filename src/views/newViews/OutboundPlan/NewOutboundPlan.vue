<template>
  <n-card class="proCard">
    <filter-bar :form-fields="searchSchema" />
    <n-data-table :columns="columns" />
  </n-card>
</template>
<script lang="ts" setup>
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import { onMounted, ref } from 'vue';
  import { listUser, PermissionEnums } from '@/api/dataLayer/modules/system/user/baseUser';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { DataTableColumns } from 'naive-ui';
  import { getNotifyDetailList } from '@/api/dataLayer/modules/notify/notify-detail';

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

  const columns: DataTableColumns<any> = [
    { title: '入库ID', key: 'notifyId' },
    { title: '票号', key: 'id' },
    { title: '箱号', key: 'containerId' },
    { title: '产品SKU', key: 'productSKU' },
    { title: '托数', key: 'trayNum' },
    { title: '箱数', key: 'containerNum' },
    { title: '长', key: 'length' },
    { title: '宽', key: 'width' },
    { title: '高', key: 'height' },
    { title: '重量', key: 'weightKg' },
    { title: '体积', key: 'volume' },
    { title: 'FBA号', key: 'FBANo' },
    { title: '操作要求', key: 'operationRequirement' },
    { title: '备注', key: 'note' },
  ];

  const searchSchema: FormField[] = [
    { label: '入库ID', field: 'notifyId' },
    { label: '票号', field: 'id' },
    { label: '货柜号', field: 'containerNo' },
  ];

  const emit = defineEmits(['submit']);

  let allNotifyDetail = $ref([]);

  onMounted(async () => {
    allNotifyDetail = await getNotifyDetailList();
  });
</script>

<style lang="less" scoped></style>
