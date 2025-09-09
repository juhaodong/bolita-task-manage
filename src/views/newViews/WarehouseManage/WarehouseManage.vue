<template>
  <n-card :bordered="false" class="proCard">
    <single-filter-bar :form-fields="filters" @clear="updateFilter(null)" @submit="updateFilter" />
    <n-button class="action-button" size="small" @click="newAdd"> 新增 </n-button>
    <n-button class="action-button" size="small" @click="editInventory"> 修改 </n-button>
    <n-button class="action-button" size="small" @click="editInventoryUser"> 用户 </n-button>
    <div class="my-2"></div>
    <BasicTable
      ref="actionRef"
      v-model:checked-row-keys="checkedRows"
      :action-column="actionColumn"
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
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
  import { ref } from 'vue';
  import { BasicTable } from '@/components/Table';
  import { columns, filters } from './columns';
  import { $ref } from 'vue/macros';
  import NewInventory from '@/views/newViews/WarehouseManage/WarehouseForm.vue';
  import { useEditOrganizationUserDialog } from '@/views/newViews/WarehouseManage/WarehouseUserDialog';
  import UserManage from '@/views/newViews/UserManage/UserManage.vue';
  import { getInventoryById, getInventoryList } from '@/api/newDataLayer/Warehouse/Warehouse';
  import SingleFilterBar from '@/views/bolita-views/composable/SingleFilterBar.vue';
  import { NButton } from 'naive-ui';

  let finished = $ref(false);

  const showModal = ref(false);
  let checkedRows = $ref([]);
  let currentModel: any | null = $ref(null);

  async function startEdit(id) {
    currentModel = await getInventoryById(id);
    currentModel.useTimeSpan = currentModel.useTimeSpan.split(',');
    showModal.value = true;
  }

  const loadDataTable = async () => {
    const res = await getInventoryList();
    return res;
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
</script>

<style lang="less" scoped>
  .action-button {
    margin-right: 8px;
  }
</style>
