<script lang="ts" setup>
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { onMounted } from 'vue';
  import { $ref } from 'vue/macros';
  import { getTaskListByIds, getTaskListByNotifyId } from '@/api/newDataLayer/TaskList/TaskList';
  import { DataTableColumns } from 'naive-ui';
  import { InBoundDetailStatus } from '@/api/dataLayer/modules/notify/notify-api';
  import { statusColumnEasy } from '@/views/bolita-views/composable/useableColumns';

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
    notifyId: '';
  }

  let currentItems = $ref([]);
  let loading = $ref(false);
  const props = defineProps<Props>();
  async function reload() {
    loading = true;
    if (props.ids) {
      currentItems = await getTaskListByIds(props.ids.split(','));
    }
    if (props.notifyId) {
      currentItems = await getTaskListByNotifyId(props.notifyId);
    }
    loading = false;
  }
  onMounted(async () => {
    await reload();
  });
</script>

<template>
  <div>
    <loading-frame :loading="loading">
      <n-data-table max-height="500px" :columns="columns" :data="currentItems" />
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
