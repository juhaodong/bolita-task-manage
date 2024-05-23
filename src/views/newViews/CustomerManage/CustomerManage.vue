<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar
      v-if="finished"
      :default-value-model="filterObj"
      :form-fields="filters"
      @clear="updateFilter(null)"
      @submit="updateFilter"
    >
      <n-button size="small" type="info" @click="showAdd">新建客户</n-button>
    </filter-bar>
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
      title="管理客户用户"
    >
      <user-manage :belongs-to-id="wuDialog.editingId" />
    </n-modal>

    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="新建/编辑客户"
    >
      <new-customer :model="currentModel" :sales-man-list="salesManList" @saved="reloadTable" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { $ref } from 'vue/macros';
  import DocumentEdit16Filled from '@vicons/fluent/es/DocumentEdit16Filled';
  import { CustomerManager, SalesManManager } from '@/api/dataLayer/modules/user/user';
  import NewCustomer from '@/views/newViews/CustomerManage/NewCustomer.vue';
  import { useEditOrganizationUserDialog } from '@/views/newViews/WarehouseManage/WarehouseUserDialog';
  import UserManage from '@/views/newViews/UserManage/UserManage.vue';

  interface Prop {
    outId?: string;
  }

  let finished = $ref(false);
  let salesManList = $ref([]);
  const props = defineProps<Prop>();
  onMounted(async () => {
    salesManList = (await SalesManManager.load()).map((it) => it.realName);
    console.log(salesManList, 'list');
    if (props.outId) {
      filterObj = { outId: props.outId };
    }
    finished = true;
  });
  const showModal = ref(false);
  let checkedRows = $ref([]);
  let currentModel: any | null = $ref(null);

  async function startEdit(id) {
    currentModel = await CustomerManager.getById(id);
    console.log(currentModel);
    showModal.value = true;
  }

  const loadDataTable = async () => {
    const res = await CustomerManager.load(filterObj);
    console.log(res, 'res');
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
          // {
          //   label: '用户',
          //   onClick() {
          //     wuDialog.startEdit(record.id);
          //   },
          // },
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
