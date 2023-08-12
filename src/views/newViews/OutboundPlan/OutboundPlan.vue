<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar :form-fields="filters" @clear="updateFilter(null)" @submit="updateFilter" />
    <div class="my-2"></div>
    <BasicTable
      ref="actionRef"
      :actionColumn="actionColumn"
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
    >
      <template #tableTitle>
        <n-space>
          <n-button @click="addTable()">
            <template #icon>
              <n-icon>
                <Box20Filled />
              </n-icon>
            </template>
            新建出库计划
          </n-button>
        </n-space>
      </template>
    </BasicTable>
    <n-modal
      v-model:show="showOperationTable"
      :show-icon="false"
      preset="dialog"
      :title="'出库计划' + currentId"
      style="width: 90%; min-width: 600px; max-width: 800px"
    >
      <out-bound-operation-table @save="reloadTable" :out-id="currentId!" />
    </n-modal>
    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 1200px"
      title="出库计划"
    >
      <new-outbound-plan @saved="reloadTable" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { Component, h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import { Box20Filled, Folder32Filled } from '@vicons/fluent';
  import NewOutboundPlan from '@/views/newViews/OutboundPlan/NewOutboundPlan.vue';
  import Delete28Filled from '@vicons/fluent/es/Delete28Filled';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import { Hammer } from '@vicons/ionicons5';
  import { CurrencyEuro } from '@vicons/carbon';
  import { $ref } from 'vue/macros';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import {
    outboundPath,
    OutBoundPlanManager,
  } from '@/api/dataLayer/modules/OutBoundPlan/outBoundPlan';
  import { OutStatus } from '@/api/dataLayer/modules/notify/notify-api';
  import OutBoundOperationTable from '@/views/newViews/OutboundPlan/dialog/OutBoundOperationTable.vue';

  const showModal = ref(false);
  const loadDataTable = async () => {
    const res = await OutBoundPlanManager.load(null);
    console.log(res);
    return res;
  };
  let showOperationTable = $ref(false);
  let currentId: string | null = $ref(null);
  let showFeeDialog = $ref(false);
  const actionRef = ref();

  function reloadTable() {
    actionRef.value.reload();
    showModal.value = false;
    showOperationTable = false;
  }

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 120,
    render(record) {
      const fileAction = (label, key, icon?: Component) => {
        return getFileActionButton(label, key, outboundPath, reloadTable, record, icon);
      };
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '取消',
            icon: Delete28Filled,
            popConfirm: {
              title: '是否取消此出库计划？',
              async confirm() {
                await OutBoundPlanManager.edit({ outStatus: OutStatus.Cancel }, record.id);
                reloadTable();
              },
            },
          },
          fileAction('附件', 'files', Folder32Filled),
          fileAction('CMR', 'CMR'),
          fileAction('POD', 'POD'),
          fileAction('提单', '提单'),
          {
            label: '操作',
            icon: Hammer,
            onClick() {
              currentId = record.id!;
              showOperationTable = true;
            },
          },
          {
            label: '费用',
            icon: CurrencyEuro,
            onClick() {
              currentId = record.id!;
              showFeeDialog = true;
            },
          },
        ],
        select: (key) => {
          window['$message'].info(`您点击了，${key} 按钮`);
        },
      });
    },
  });

  function addTable() {
    showModal.value = true;
  }
</script>

<style lang="less" scoped></style>
