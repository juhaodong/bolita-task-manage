<script lang="ts" setup>
  import { $ref } from 'vue/macros';
  import { getTaskListByIds, getTaskListByNotifyId } from '@/api/newDataLayer/TaskList/TaskList';
  import { statusColumnEasy } from '@/views/bolita-views/composable/useableColumns';
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
      key: 'outboundForecast.ref',
      width: 120,
    },
    {
      title: '国家',
      key: 'country',
      width: 60,
    },
    {
      title: 'FC',
      key: 'fcAddress',
      width: 80,
    },
    {
      title: 'FBA单号',
      key: 'fbaDeliveryCode',
      width: 140,
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
    statusColumnEasy({
      title: '状态',
      key: 'inStatus',
    }),
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
      currentList = await getTaskListByIds(props.ids);
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
