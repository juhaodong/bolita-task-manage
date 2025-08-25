<script lang="ts" setup>
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { onMounted } from 'vue';
  import { $ref } from 'vue/macros';
  import { getTaskGroupByNotifyId } from '@/api/newDataLayer/TaskList/TaskList';
  import { DataTableColumns } from 'naive-ui';
  import { statusColumnEasy } from '@/views/bolita-views/composable/useableColumns';

  const columns: DataTableColumns<any> = [
    {
      title: '客户',
      key: 'customerName',
    },
    {
      title: 'ref',
      key: 'ref',
    },
    {
      title: '票号',
      key: 'ticketIds',
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
      title: 'FC/Address',
      key: 'fcAddress',
    },
    {
      title: 'FBA单号',
      key: 'fbaDeliveryCodes',
    },
    {
      title: '出库方式',
      key: 'outboundMethod',
    },
    {
      title: '物流渠道',
      key: 'deliveryMethod',
    },
    {
      title: '出库数/总数',
      key: 'numberDisplay',
    },
  ].map((it) => {
    it.ellipsis = {
      tooltip: true,
    };
    return it;
  });

  interface Props {
    notifyId: '';
  }

  let currentItems = $ref([]);
  let loading = $ref(false);
  const props = defineProps<Props>();
  async function reload() {
    loading = true;
    if (props.notifyId) {
      currentItems = (await getTaskGroupByNotifyId(props.notifyId)).map((it) => {
        it.ref = it.groupKey.ref;
        it.country = it.groupKey.country;
        it.customerName = it.groupKey.customerName;
        it.deliveryMethod = it.groupKey.deliveryMethod;
        it.fcAddress = it.groupKey.fcAddress;
        it.inStatus = it.groupKey.inStatus;
        it.outboundMethod = it.groupKey.outboundMethod;
        it.numberDisplay =
          it.totalOutContainerNum +
          '件' +
          it.totalOutTrayNum +
          '托' +
          '/' +
          it.totalArrivedContainerNum +
          '件' +
          it.totalArrivedTrayNum +
          '托';
        return it;
      });
      console.log(currentItems, 'currentItems');
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
