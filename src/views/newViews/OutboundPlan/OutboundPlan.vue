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
  import { CashStatus, OutStatus } from '@/api/dataLayer/modules/notify/notify-api';
  import OutBoundOperationTable from '@/views/newViews/OutboundPlan/dialog/OutBoundOperationTable.vue';
  import OutBoundCheckOutTable from '@/views/newViews/OutboundPlan/dialog/OutBoundCheckOutTable.vue';
  import OutBoundEditDialog from '@/views/newViews/OutboundPlan/dialog/OutBoundEditDialog.vue';
  import { where } from 'firebase/firestore';
  import { usePermission } from '@/hooks/web/usePermission';
  import { OutBoundPlanPower } from '@/api/dataLayer/common/PowerModel';
  import dayjs from 'dayjs';

  const { hasPermission } = usePermission();

  const showModal = ref(false);

  let showOperationTable = $ref(false);
  let showEditInfoDialog = $ref(false);
  let currentId: string | null = $ref(null);
  let showFeeDialog = $ref(false);
  const actionRef = ref();
  let filterObj: any | null = $ref(null);
  const loadDataTable = async () => {
    const res = await OutBoundPlanManager.load(filterObj, where('onlyDelivery', '==', false));
    res.forEach((it) => {
      const date1 = dayjs(it.reservationOutboundDate).format('YYYY-MM-DD');
      const date2 = dayjs(it.createTimestamp).format('YYYY-MM-DD');
      it.ageing = dayjs(date1).diff(date2, 'day');
    });
    return res;
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
          {
            label: '取消',
            icon: Delete28Filled,
            ifShow() {
              return record.outStatus == OutStatus.WaitForCheck;
            },
            popConfirm: {
              title: '是否取消此出库计划？',
              async confirm() {
                await OutBoundPlanManager.edit({ outStatus: OutStatus.Cancel }, record.id);
                reloadTable();
              },
            },
          },
          fileAction('附件', 'files', Folder32Filled, true),
          fileAction('CMR', 'CMR', undefined, true),
          fileAction('POD', 'PODFiles'),
          fileAction('提单', 'pickupFiles'),
          {
            label: '编辑信息',
            icon: Edit24Filled,
            onClick() {
              currentId = record.id!;
              showEditInfoDialog = true;
            },
            auth: [OutBoundPlanPower.Edit],
          },
          {
            label: '操作',
            icon: Hammer,
            ifShow() {
              return record.outStatus !== OutStatus.WaitForCheck;
            },
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
            highlight: () => {
              if (record?.cashStatus == CashStatus.Done) {
                return 'success';
              } else if (record?.cashStatus == CashStatus.WaitConfirm) {
                return 'warning';
              } else {
                return 'error';
              }
            },
          },
        ],
      });
    },
  });

  function addTable() {
    showModal.value = true;
  }
</script>

<style lang="less" scoped></style>
