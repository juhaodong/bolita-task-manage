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
          <n-button>
            <template #icon>
              <n-icon>
                <Box20Filled />
              </n-icon>
            </template>
            编辑
          </n-button>
          <n-button>
            <template #icon>
              <n-icon>
                <Box20Filled />
              </n-icon>
            </template>
            导出
          </n-button>
        </n-space>
      </template>
    </BasicTable>

    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 1200px"
      title="新建库存明细"
    >
      <new-inventory-detail />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import { Box20Filled } from '@vicons/fluent';
  import NewInventoryDetail from '@/views/newViews/InventoryDetail/NewInventoryDetail.vue';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { getReserveItems } from '@/api/dataLayer/modules/notify/notify-detail';
  import { NotifyManager, NotifyModel } from '@/api/dataLayer/modules/notify/notify-api';
  import DocumentEdit16Filled from '@vicons/fluent/es/DocumentEdit16Filled';
  import { $ref } from 'vue/macros';

  const showModal = ref(false);
  const loadDataTable = async () => {
    return await getReserveItems(filterObj);
  };
  let filterObj: any | null = $ref(null);

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  const actionRef = ref();

  function reloadTable() {
    actionRef.value.reload();
  }

  const actionColumn = reactive({
    title: '动作',
    key: 'action',
    width: 60,
    render(record: NotifyModel) {
      return h(TableAction as any, {
        style: 'button',
        actions: [
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
        ],
      });
    },
  });

  function addTable() {
    showModal.value = true;
  }
</script>

<style lang="less" scoped></style>
