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
    />
    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      preset="card"
      title="新建入库计划"
      :style="{ maxWidth: notifyType === NotifyType.TrayOrBox ? '1600px' : '800px' }"
      style="width: 90%; min-width: 600px"
    >
      <container-forecast-index
        :current-model="currentModel"
        @saved="closeAddDialog"
        :type="notifyType"
      />
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
      <notify-fee-dialog :notify-id="currentNotifyId!" @save="reloadTable" />
    </n-modal>
    <n-modal
      v-model:show="showWarehouseDialog"
      :show-icon="false"
      preset="dialog"
      title="仓库信息"
      style="width: 90%; min-width: 600px; max-width: 800px"
    >
      <warehouse-info-dialog :notify-id="currentNotifyId!" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { Component, h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import {
    CashStatus,
    InBoundStatus,
    NotifyType,
    OutStatus,
  } from '@/api/dataLayer/modules/notify/notify-api';
  import { $ref } from 'vue/macros';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import Delete28Filled from '@vicons/fluent/es/Delete28Filled';
  import { Hammer } from '@vicons/ionicons5';
  import { CurrencyEuro } from '@vicons/carbon';
  import NotifyUnloadForm from '@/views/newViews/NotifyList/form/NotifyUnloadForm.vue';
  import WarehouseInfoDialog from '@/views/newViews/NotifyList/form/WarehouseInfoDialog.vue';
  import NotifyFeeDialog from '@/views/newViews/NotifyList/form/NotifyFeeDialog.vue';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import ContainerForecastIndex from '@/views/newNewViews/ContainerForecast/form/ContainerForecastIndex.vue';
  import DocumentEdit16Filled from '@vicons/fluent/es/DocumentEdit16Filled';
  import { NotifyDetailManager } from '@/api/dataLayer/modules/notify/notify-detail';

  let notifyType: NotifyType = $ref(NotifyType.Container);
  let currentModel: any | null = $ref(null);

  const showModal = ref(false);

  let showOperationTable = $ref(false);
  let currentNotifyId: string | null = $ref(null);
  let showWarehouseDialog = $ref(false);
  let showFeeDialog = $ref(false);
  let filterObj: any | null = $ref(null);

  const loadDataTable = async () => {
    const res = (await NotifyDetailManager.load(filterObj)).filter(
      (it) => it.inStatus !== InBoundStatus.All
    );
    console.log(res, 'res');
    return res;
  };

  const actionRef = ref();

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  async function startEdit(id) {
    currentModel = await NotifyDetailManager.getById(id);
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
        return getFileActionButton(label, key, NotifyDetailManager, reloadTable, record, icon);
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
                await NotifyDetailManager.remove(record.id);
                reloadTable();
              },
            },
            ifShow() {
              return (
                record['inStatus'] === InBoundStatus.Wait && record['outStatus'] !== OutStatus.All
              );
            },
          },
          {
            label: '修改',
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
          {
            label: '操作',
            icon: Hammer,
            onClick() {
              currentNotifyId = record.id!;
              showOperationTable = true;
            },
          },
          {
            label: '费用',
            icon: CurrencyEuro,
            highlight: () => {
              if (record?.cashStatus == CashStatus.Done) {
                return 'success';
              } else if (record?.cashStatus == CashStatus.WaitConfirm) {
                return 'warning';
              } else {
                return 'error';
              }
            },
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
