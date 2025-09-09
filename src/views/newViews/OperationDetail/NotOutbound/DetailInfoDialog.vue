<script lang="ts" setup>
  import { $ref } from 'vue/macros';
  import { getTaskListByIds, getTaskListByNotifyId } from '@/api/newDataLayer/TaskList/TaskList';
  import { statusColumnEasy } from '@/views/bolita-views/composable/useableColumns';
  import { h, onMounted } from 'vue';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { DataTableColumns, NButton } from 'naive-ui';
  import ExceptionDialog from './dialog/ExceptionDialog.vue';

  onMounted(async () => {
    await reload();
  });

  let showExceptionDialog = $ref(false);
  let currentRow = $ref(null);

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
    {
      title: '异常',
      key: 'actions',
      width: 80,
      render(row) {
        return h(
          NButton,
          {
            strong: true,
            tertiary: true,
            size: 'small',
            onClick: () => {
              currentRow = row;
              showExceptionDialog = true;
            },
          },
          { default: () => '异常' }
        );
      },
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

  async function handleExceptionSaved(updatedData) {
    showExceptionDialog = false;
    // Update the local list with the updated data
    currentList = currentList.filter((it) => it.id !== updatedData.id);
  }

  function handleExceptionCancel() {
    showExceptionDialog = false;
  }
</script>

<template>
  <loading-frame :loading="loading">
    <n-data-table :max-height="400" :columns="allColumns" :data="currentList" />

    <n-modal v-model:show="showExceptionDialog" preset="dialog" title="异常信息">
      <exception-dialog
        :row="currentRow"
        @saved="handleExceptionSaved"
        @cancel="handleExceptionCancel"
      />
    </n-modal>
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
