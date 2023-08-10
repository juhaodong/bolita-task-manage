<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar @submit="updateFilter" :form-fields="filters" @clear="updateFilter(null)" />
    <div class="my-2"></div>
    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
    >
      <template #tableTitle>
        <n-space>
          <n-button @click="addTable(NotifyType.Container)">
            <template #icon>
              <n-icon>
                <Box20Filled />
              </n-icon>
            </template>
            新建货柜预报
          </n-button>
          <n-button @click="addTable(NotifyType.TrayOrBox)">
            <template #icon>
              <n-icon>
                <TruckDelivery />
              </n-icon>
            </template>
            新建散货/托盘预报
          </n-button>
        </n-space>
      </template>
    </BasicTable>
    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      preset="card"
      title="新建入库计划"
      style="width: 90%; min-width: 600px; max-width: 800px"
    >
      <notify-form-index @saved="closeAddDialog" :type="notifyType" />
    </n-modal>
    <n-modal
      v-model:show="showOperationTable"
      :show-icon="false"
      preset="dialog"
      title="卸柜表"
      style="width: 90%; min-width: 600px; max-width: 800px"
    >
      <notify-unload-form @save="reloadTable" :notify-id="currentNotifyId!" />
    </n-modal>
    <n-modal
      v-model:show="showFeeDialog"
      :show-icon="false"
      preset="dialog"
      title="费用表"
      style="width: 90%; min-width: 600px; max-width: 800px"
    >
      <notify-fee-dialog :notify-id="currentNotifyId!" />
    </n-modal>
    <n-modal
      v-model:show="showWarehouseDialog"
      :show-icon="false"
      preset="dialog"
      title="仓库信息"
      style="width: 90%; min-width: 600px; max-width: 800px"
    >
      <warehouse-info-dialog />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { Component, h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import { Box20Filled, Folder32Filled } from '@vicons/fluent';
  import {
    NotifyManager,
    NotifyModel,
    notifyPath,
    NotifyType,
  } from '@/api/dataLayer/modules/notify/notify-api';
  import NotifyFormIndex from '@/views/newViews/NotifyList/form/NotifyFormIndex.vue';
  import { $ref } from 'vue/macros';
  import { TruckDelivery } from '@vicons/tabler';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import Delete28Filled from '@vicons/fluent/es/Delete28Filled';
  import { Hammer, Home } from '@vicons/ionicons5';
  import { CurrencyEuro } from '@vicons/carbon';
  import NotifyUnloadForm from '@/views/newViews/NotifyList/form/NotifyUnloadForm.vue';
  import WarehouseInfoDialog from '@/views/newViews/NotifyList/form/WarehouseInfoDialog.vue';
  import NotifyFeeDialog from '@/views/newViews/NotifyList/form/NotifyFeeDialog.vue';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';

  let notifyType: NotifyType = $ref(NotifyType.Container);

  const showModal = ref(false);

  let showOperationTable = $ref(false);
  let currentNotifyId: string | null = $ref(null);
  let showWarehouseDialog = $ref(false);
  let showFeeDialog = $ref(false);
  let filterObj: any | null = $ref(null);

  function addTable(type: NotifyType) {
    notifyType = type;
    showModal.value = true;
  }

  const loadDataTable = async () => {
    return await NotifyManager.load(filterObj);
  };

  const actionRef = ref();

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  function reloadTable() {
    actionRef.value.reload();
    showOperationTable = false;
  }

  async function closeAddDialog() {
    reloadTable();
    showModal.value = false;
  }

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 120,
    render(record: NotifyModel) {
      const fileAction = (label, key, icon?: Component) => {
        return getFileActionButton(label, key, notifyPath, reloadTable, record, icon);
      };
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '删除',
            icon: Delete28Filled,
            popConfirm: {
              title: '是否确定删除此预报？',
              async confirm() {
                await NotifyManager.remove(record.id);
                reloadTable();
              },
            },
          },
          fileAction('附件', 'files', Folder32Filled),
          fileAction('CMR', 'CMRFiles'),
          fileAction('问题图片', 'problemFiles'),
          {
            label: '操作',
            icon: Hammer,
            onClick() {
              currentNotifyId = record.id!;
              showOperationTable = true;
            },
          },
          {
            label: '查看仓库信息',
            icon: Home,
            onClick() {
              showWarehouseDialog = true;
            },
          },
          {
            label: '费用',
            icon: CurrencyEuro,
            onClick() {
              currentNotifyId = record.id!;
              showFeeDialog = true;
            },
          },
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
