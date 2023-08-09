<template>
  <n-card :bordered="false" class="proCard">
    <div class="my-2"></div>
    <BasicTable
      ref="actionRef"
      v-model:checked-row-keys="checkedRows"
      :action-column="actionColumn"
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
            新增
          </n-button>
        </n-space>
      </template>
    </BasicTable>

    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 1200px"
      title="新增"
    >
      <new-inventory :model="currentModel" @saved="reloadTable" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns } from './columns';
  import DocumentEdit16Filled from '@vicons/fluent/es/DocumentEdit16Filled';
  import { $ref } from 'vue/macros';
  import NewInventory from '@/views/newViews/InventoryManage/NewInventory.vue';

  const actionRef = ref();
  const showModal = ref(false);
  let checkedRows = $ref([]);

  function reloadTable() {
    actionRef.value.reload();
    showModal.value = false;
  }

  function addTable() {
    showModal.value = true;
  }

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 60,
    render() {
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '修改角色',
            icon: DocumentEdit16Filled,
          },
          {
            label: '修改密码',
            icon: DocumentEdit16Filled,
          },
          {
            label: '重置密码',
            icon: DocumentEdit16Filled,
          },
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
import { OutBoundDetailManager } from '@/api/dataLayer/modules/OutBoundPlan/outBoundPlan';
