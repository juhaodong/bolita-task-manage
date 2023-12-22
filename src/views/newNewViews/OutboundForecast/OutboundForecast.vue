<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar :form-fields="filters" @clear="updateFilter(null)" @submit="updateFilter">
      <n-button size="small" type="info" @click="addTable(NotifyType.Container)">
        <template #icon>
          <n-icon>
            <Box20Filled />
          </n-icon>
        </template>
        新建出库预报
      </n-button>
    </filter-bar>
    <div class="my-2"></div>
    <BasicTable
      ref="actionRef"
      :actionColumn="actionColumn"
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
    />
    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      :style="{ maxWidth: notifyType === NotifyType.TrayOrBox ? '1600px' : '800px' }"
      preset="card"
      style="width: 90%; min-width: 600px"
      title="新建出库预报"
    >
      <new-outbound-forecast />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { Component, h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import { Box20Filled } from '@vicons/fluent';
  import {
    InBoundStatus,
    NotifyManager,
    NotifyType,
    OutStatus,
  } from '@/api/dataLayer/modules/notify/notify-api';
  import { $ref } from 'vue/macros';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import { Hammer } from '@vicons/ionicons5';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import DocumentEdit16Filled from '@vicons/fluent/es/DocumentEdit16Filled';
  import NewOutboundForecast from '@/views/newNewViews/OutboundForecast/NewOutboundForecast.vue';

  let notifyType: NotifyType = $ref(NotifyType.Container);

  const showModal = ref(false);
  let filterObj: any | null = $ref(null);

  function addTable(type: NotifyType) {
    notifyType = type;
    showModal.value = true;
  }

  const loadDataTable = async () => {
    const res = await NotifyManager.load(filterObj);
    console.log(res, 'res');
    return res;
  };

  const actionRef = ref();

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  async function startEdit(id) {
    currentModel = await NotifyManager.getById(id);
    showModal.value = true;
  }

  function reloadTable() {
    actionRef.value.reload();
    showOperationTable = false;
    showFeeDialog = false;
  }

  async function closeAddDialog() {
    reloadTable();
    showModal.value = false;
  }

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 120,
    render(record: any) {
      const fileAction = (label, key, icon?: Component) => {
        return getFileActionButton(label, key, NotifyManager, reloadTable, record, icon);
      };
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '更改',
            icon: DocumentEdit16Filled,
            onClick() {
              startEdit(record.id);
            },
            ifShow() {
              return (
                record['inStatus'] === InBoundStatus.Wait && record['outStatus'] !== OutStatus.All
              );
            },
          },
          fileAction('CMR', 'CMRFiles'),
          fileAction('POD', 'PODFiles'),
          fileAction('提单', 'LadingBill'),
          {
            label: '出库单',
            icon: Hammer,
            onClick() {
              currentNotifyId = record.id!;
              showOperationTable = true;
            },
          },
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
