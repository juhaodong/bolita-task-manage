<script lang="ts" setup>
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { onMounted } from 'vue';
  import { $ref } from 'vue/macros';
  import { getTaskListByIds } from '@/api/newDataLayer/TaskList/TaskList';
  import { DataTableColumns } from 'naive-ui';
  import { InBoundDetailStatus } from '@/api/dataLayer/modules/notify/notify-api';
  import {
    statusColumnEasy,
    storageTimeWarnColumn,
    timeColumn,
  } from '@/views/bolita-views/composable/useableColumns';

  const columns: DataTableColumns<any> = [
    {
      type: 'selection',
      disabled: (row) => row.inStatus !== InBoundDetailStatus.WaitCheck,
    },
    {
      title: '客户ID',
      key: 'customer.customerName',
    },
    {
      title: '柜号',
      key: 'containerId',
    },
    {
      title: '票号',
      key: 'ticketId',
    },
    {
      title: '国家',
      key: 'country',
    },
    statusColumnEasy({
      title: '状态',
      key: 'inStatus',
    }),
    {
      title: '仓库',
      key: 'inventory.name',
    },
    {
      title: '邮编',
      key: 'postcode',
    },
    {
      title: 'FBA单号',
      key: 'FBADeliveryCode',
    },
    {
      title: '出库方式',
      key: 'outboundMethod',
    },
    {
      title: '物流渠道',
      key: 'deliveryMethod',
    },
  ];

  interface Props {
    ids: [];
    loading: {};
  }

  let currentItems = $ref([]);
  const props = defineProps<Props>();
  async function reload() {
    currentItems = await getTaskListByIds(props.ids.split(','));
  }
  onMounted(async () => {
    await reload();
  });
</script>

<template>
  <div>
    <loading-frame :loading="loading">
      <n-data-table :columns="columns" :data="currentItems" />
      <!--      <div v-for="item in currentItems" :key="item.id">-->
      <!--        <div class="mt-2 font-bold text-l">{{ item.ticketId }}</div>-->
      <!--        <n-descriptions :columns="2" bordered label-placement="left">-->
      <!--          <n-descriptions-item label="客户"> {{ item?.customerName }} </n-descriptions-item>-->
      <!--          <n-descriptions-item label="国家"> {{ item?.country }} </n-descriptions-item>-->
      <!--          <n-descriptions-item label="票号"> {{ item?.ticketId }} </n-descriptions-item>-->
      <!--          <n-descriptions-item label="柜号"> {{ item?.containerId }} </n-descriptions-item>-->
      <!--          <n-descriptions-item label="仓库"> {{ item?.warehouseId }} </n-descriptions-item>-->
      <!--          <n-descriptions-item label="箱数"> {{ item?.number }} </n-descriptions-item>-->
      <!--          <n-descriptions-item label="重量"> {{ item?.weight }} </n-descriptions-item>-->
      <!--          <n-descriptions-item label="体积"> {{ item?.volume }} </n-descriptions-item>-->
      <!--          <n-descriptions-item label="托数"> {{ item?.trayNum ?? 0 }} </n-descriptions-item>-->
      <!--          <n-descriptions-item label="托盘类型">-->
      <!--            {{ item?.trayType ?? '' }}-->
      <!--          </n-descriptions-item>-->
      <!--          <n-descriptions-item label="出库方式">-->
      <!--            {{ item?.outboundMethod }}-->
      <!--          </n-descriptions-item>-->
      <!--          <n-descriptions-item label="物流方式">-->
      <!--            {{ item?.deliveryMethod }}-->
      <!--          </n-descriptions-item>-->
      <!--          <n-descriptions-item label="FC/送货地址">-->
      <!--            {{ item?.FCAddress }}-->
      <!--          </n-descriptions-item>-->
      <!--          <n-descriptions-item label="FBA/快递单号">-->
      <!--            {{ item?.FBADeliveryCode }}-->
      <!--          </n-descriptions-item>-->
      <!--        </n-descriptions>-->
      <!--      </div>-->
    </loading-frame>
  </div>
</template>

<style lang="less" scoped>
  @media print {
    .noMaxHeight {
      max-height: unset !important;
      overflow: hidden;
    }
  }
</style>
