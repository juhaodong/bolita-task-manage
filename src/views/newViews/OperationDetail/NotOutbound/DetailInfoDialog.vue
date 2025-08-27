<script lang="ts" setup>
  import { $ref } from 'vue/macros';
  import { getTaskListByIds, getTaskListByNotifyId } from '@/api/newDataLayer/TaskList/TaskList';
  import { statusColumnEasy, timeColumn } from '@/views/bolita-views/composable/useableColumns';
  import { onMounted } from 'vue';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { DataTableColumns } from 'naive-ui';

  onMounted(async () => {
    await reload();
  });

  const allColumns: DataTableColumns<any> = [
    {
      title: '票号',
      key: 'ticketId',
      fixed: 'left',
      width: 120,
    },
    {
      title: 'Ref',
      key: 'ref',
      width: 120,
    },
    {
      title: '国家',
      key: 'country',
      width: 60,
    },
    {
      title: '预报/实际件数',
      key: 'numberDisplay',
      width: 120,
    },
    {
      title: '预报/实际托数',
      key: 'trayDisplay',
      width: 120,
    },
    {
      title: 'FC',
      key: 'fcAddress',
      width: 80,
    },
    {
      title: '送货地址',
      key: 'address',
      width: 100,
    },
    {
      title: 'FBA单号',
      key: 'fbaDeliveryCode',
      width: 140,
    },
    {
      title: '出库方式',
      key: 'outboundMethod',
      width: 100,
    },
    {
      title: '物流渠道',
      key: 'deliveryMethod',
      width: 100,
    },
    {
      title: '总实重',
      key: 'weight',
      width: 80,
    },
    {
      title: '总体积',
      key: 'volume',
      width: 80,
    },
    {
      title: '尺寸',
      key: 'size',
      width: 80,
    },
    {
      title: '操作要求',
      key: 'operationRequire',
      width: 100,
    },
    {
      title: '操作备注',
      key: 'operationNote',
      width: 100,
    },
    statusColumnEasy({
      title: '状态',
      key: 'inStatus',
    }),
    timeColumn('arriveTime', '实际到仓日期'),
    timeColumn('arriveTime', '预计取货日期'),
    timeColumn('outBoundTime', '实际发货时间'),
    {
      title: '滞留时间',
      key: 'storageTime',
      width: 100,
    },
    {
      title: '库位',
      key: 'storageTime',
    },
  ].map((it) => {
    it.ellipsis = {
      tooltip: true,
    };
    return it;
  });

  interface Props {
    ids: [];
    notifyId: '';
  }
  let loading = $ref(false);
  const props = defineProps<Props>();
  let currentList = $ref([]);
  async function reload() {
    loading = true;
    if (props.ids) {
      currentList = await getTaskListByIds(props.ids.split(','));
    }
    if (props.notifyId) {
      currentList = (await getTaskListByNotifyId(props.notifyId)).map((it) => {
        it.numberDisplay = it.number + '/' + it.arrivedContainerNum;
        it.trayDisplay = it.trayNum + '/' + it.arrivedTrayNum;
        return it;
      });
    }
    loading = false;
  }
</script>

<template>
  <loading-frame :loading="loading">
    <n-data-table :max-height="400" :columns="allColumns" :data="currentList" />
  </loading-frame>
</template>

<style lang="less" scoped>
  @media print {
    .noMaxHeight {
      max-height: unset !important;
      overflow: hidden;
    }
  }
</style>
