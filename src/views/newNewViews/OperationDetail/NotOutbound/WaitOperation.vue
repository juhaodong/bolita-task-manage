<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar :form-fields="filters" @clear="updateFilter(null)" @submit="updateFilter">
      <n-button v-if="hasPermission([OutBoundPlanPower.Add])" type="primary" @click="addTable()">
        <template #icon>
          <n-icon>
            <Box20Filled />
          </n-icon>
        </template>
        新建出库计划
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
      v-model:show="showOperationTable"
      :show-icon="false"
      preset="dialog"
      :title="'出库计划' + currentId"
      style="width: 90%; min-width: 600px; max-width: 800px"
    >
      <out-bound-operation-table @save="reloadTable" :out-id="currentId!" />
    </n-modal>
    <n-modal
      v-model:show="showFeeDialog"
      :show-icon="false"
      preset="dialog"
      :title="'出库计划' + currentId"
      style="width: 90%; min-width: 600px; max-width: 800px"
    >
      <out-bound-check-out-table @save="reloadTable" :out-id="currentId!" />
    </n-modal>
    <n-modal
      v-model:show="showEditInfoDialog"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="编辑信息"
    >
      <out-bound-edit-dialog :model="currentId" @saved="reloadTable" />
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
  import { Box20Filled, Edit24Filled, Folder32Filled } from '@vicons/fluent';
  import NewOutboundPlan from '@/views/newViews/OutboundPlan/NewOutboundPlan.vue';
  import Delete28Filled from '@vicons/fluent/es/Delete28Filled';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import { Hammer } from '@vicons/ionicons5';
  import { CurrencyEuro } from '@vicons/carbon';
  import { $ref } from 'vue/macros';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { OutBoundPlanManager } from '@/api/dataLayer/modules/OutBoundPlan/outBoundPlan';
  import { CashStatus, NotifyManager, OutStatus } from '@/api/dataLayer/modules/notify/notify-api';
  import OutBoundOperationTable from '@/views/newViews/OutboundPlan/dialog/OutBoundOperationTable.vue';
  import OutBoundCheckOutTable from '@/views/newViews/OutboundPlan/dialog/OutBoundCheckOutTable.vue';
  import OutBoundEditDialog from '@/views/newViews/OutboundPlan/dialog/OutBoundEditDialog.vue';
  import { usePermission } from '@/hooks/web/usePermission';
  import { OutBoundPlanPower } from '@/api/dataLayer/common/PowerModel';

  const { hasPermission } = usePermission();

  const showModal = ref(false);

  let showOperationTable = $ref(false);
  let showEditInfoDialog = $ref(false);
  let currentId: string | null = $ref(null);
  let showFeeDialog = $ref(false);
  const actionRef = ref();
  let filterObj: any | null = $ref(null);
  const loadDataTable = async () => {
    return (await NotifyManager.load(filterObj)).filter(
      (it) => it.outStatus !== OutStatus.All || !it.POD
    );
  };

  function reloadTable() {
    actionRef.value.reload();
    showModal.value = false;
    showFeeDialog = false;
    showOperationTable = false;
    showEditInfoDialog = false;
  }

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 120,
    render(record) {
      const fileAction = (label, key, icon?: Component, editable = false) => {
        return getFileActionButton(
          label,
          key,
          OutBoundPlanManager,
          reloadTable,
          record,
          icon,
          editable
        );
      };
      return h(TableAction as any, {
        style: 'button',
        actions: [
          fileAction('提单文件', 'files', Folder32Filled),
          fileAction('POD', 'POD'),
          fileAction('操作文件', 'operationFiles'),
          fileAction('问题图片', 'problemFiles'),
        ],
      });
    },
  });

  function addTable() {
    showModal.value = true;
  }
</script>

<style lang="less" scoped></style>
