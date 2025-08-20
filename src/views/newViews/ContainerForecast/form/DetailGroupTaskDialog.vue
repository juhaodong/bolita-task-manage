<script lang="ts" setup>
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { computed, onMounted } from 'vue';
  import { $ref } from 'vue/macros';
  import { getTaskListByNotifyId } from '@/api/newDataLayer/TaskList/TaskList';
  import { DataTableColumns } from 'naive-ui';
  import { statusColumnEasy } from '@/views/bolita-views/composable/useableColumns';
  import { groupBy } from 'lodash';
  import { safeSumBy } from '@/store/utils/utils';

  const columns: DataTableColumns<any> = [
    {
      title: '客户ID',
      key: 'customer.customerName',
    },
    {
      title: 'ref',
      key: 'ref',
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
      title: 'FC/Address',
      key: 'fcAddress',
    },
    {
      title: 'FBA单号',
      key: 'fbaDeliveryCode',
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
      title: '出库件数/总件数',
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
      currentItems = await getTaskListByNotifyId(props.notifyId);
    }
    loading = false;
  }

  const currentDisplay = computed(() => {
    const groupInfo = groupBy(currentItems, (item) => {
      return ['fcAddress', 'deliveryMethod', 'outboundMethod'].map((it) => item[it]).join('-');
    });
    const res = Object.entries(groupInfo).map(([key, value]) => {
      console.log(key, value, 'key');
      const outNumber = safeSumBy(
        value.filter((it) => it.inStatus === '全部出库'),
        'number'
      );
      return {
        customer: value[0].customer,
        ticketId: value.map((it) => it.ticketId).join(','),
        ref: value.map((it) => it.ref).join(','),
        country: value[0].country,
        inStatus: value[0].inStatus,
        fcAddress: value[0].fcAddress,
        fbaDeliveryCode: value[0].fbaDeliveryCode,
        outboundMethod: value[0].outboundMethod,
        deliveryMethod: value[0].deliveryMethod,
        numberDisplay: outNumber + '/' + safeSumBy(value, 'number'),
      };
    });
    console.log(res, 'res');
    return res;
  });
  onMounted(async () => {
    await reload();
  });
</script>

<template>
  <div>
    <loading-frame :loading="loading">
      <n-data-table max-height="500px" :columns="columns" :data="currentDisplay" />
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
