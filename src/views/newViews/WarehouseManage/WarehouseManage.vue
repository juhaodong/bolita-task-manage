<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar
      v-if="finished"
      :form-fields="filters"
      :default-value-model="filterObj"
      @clear="updateFilter(null)"
      @submit="updateFilter"
    >
      <n-button type="primary" size="small" @click="showAdd">新建仓库</n-button>
    </filter-bar>
    <div class="my-2"></div>
    <BasicTable
      ref="actionRef"
      :action-column="actionColumn"
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      v-model:checked-row-keys="checkedRows"
    />
    <n-modal
      v-model:show="wuDialog.showDialog"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 800px; max-width: 800px"
      title="管理仓库用户"
    >
      <user-manage :belongs-to-id="wuDialog.editingId" />
    </n-modal>
    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="新建/编辑仓库"
    >
      <new-inventory :model="currentModel" @saved="reloadTable" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { $ref } from 'vue/macros';
  import DocumentEdit16Filled from '@vicons/fluent/es/DocumentEdit16Filled';
  import { InventoryManager } from '@/api/dataLayer/modules/user/user';
  import NewInventory from '@/views/newViews/WarehouseManage/WarehouseForm.vue';
  import { useEditOrganizationUserDialog } from '@/views/newViews/WarehouseManage/WarehouseUserDialog';
  import UserManage from '@/views/newViews/UserManage/UserManage.vue';

  let finished = $ref(false);

  const showModal = ref(false);
  let checkedRows = $ref([]);
  let currentModel: any | null = $ref(null);

  async function startEdit(id) {
    currentModel = await InventoryManager.getById(id);
    showModal.value = true;
  }

  const loadDataTable = async () => {
    return await InventoryManager.load(filterObj);
  };

  let filterObj: any | null = $ref(null);

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  function showAdd() {
    currentModel = null;
    showModal.value = true;
  }

  const actionRef = ref();

  function reloadTable() {
    actionRef.value.reload();
    showModal.value = false;
  }

  const wuDialog = useEditOrganizationUserDialog();
  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 60,
    render(record: any) {
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '修改',
            icon: DocumentEdit16Filled,
            onClick() {
              startEdit(record.id);
            },
          },
          {
            label: '用户',
            onClick() {
              wuDialog.startEdit(record.id);
            },
          },
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
