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
      :scroll-x="3000"
    >
      <template #tableTitle>
        <n-space>
          <n-button @click="addTable()">
            <template #icon>
              <n-icon>
                <Box20Filled />
              </n-icon>
            </template>
            新增物流明细
          </n-button>
        </n-space>
      </template>
    </BasicTable>

    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 1200px"
      title="新增物流明细"
    >
      <new-logistics-details />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { Component, h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import { Box20Filled, Folder32Filled } from '@vicons/fluent';
  import NewLogisticsDetails from '@/views/newViews/LogisticsDetails/NewLogisticsDetails.vue';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { $ref } from 'vue/macros';
  import {
    NotifyManager,
    NotifyModel,
    notifyPath,
  } from '@/api/dataLayer/modules/notify/notify-api';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import Delete28Filled from '@vicons/fluent/es/Delete28Filled';
  import DocumentEdit16Filled from '@vicons/fluent/es/DocumentEdit16Filled';
  import { Hammer, Home } from '@vicons/ionicons5';
  import { CurrencyEuro } from '@vicons/carbon';
  import { LogisticDetailManager } from '@/api/dataLayer/modules/logistic/logistic';

  const showModal = ref(false);

  function addTable() {
    showModal.value = true;
  }
  let filterObj: any | null = $ref(null);

  const loadDataTable = async () => {
    console.log(await LogisticDetailManager.load(filterObj));
    return await LogisticDetailManager.load(filterObj);
  };

  const actionRef = ref();

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  function reloadTable() {
    actionRef.value.reload();
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
          {
            label: '修改',
            icon: DocumentEdit16Filled,
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
