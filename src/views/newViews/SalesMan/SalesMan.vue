<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar
      v-if="finished"
      :default-value-model="filterObj"
      :form-fields="filters"
      @clear="updateFilter(null)"
      @submit="updateFilter"
    >
      <n-button size="small" type="primary" @click="showAdd">新建业务员</n-button>
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
      v-model:show="showModal"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="新建/编辑业务员"
    >
      <new-sales-man :model="currentModel" :warehouse-list="warehouseList" @saved="reloadTable" />
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
  import { SalesManManager, WarehouseManager } from '@/api/dataLayer/modules/user/user';
  import NewSalesMan from '@/views/newViews/SalesMan/NewSalesMan.vue';

  interface Prop {
    belongsToId?: string;
  }

  let finished = $ref(false);
  let warehouseList = $ref([]);
  const props = defineProps<Prop>();
  onMounted(async () => {
    warehouseList = (await WarehouseManager.load()).map((it) => it.id);
    console.log(warehouseList, 'list');
    if (props.belongsToId) {
      filterObj = { belongsToId: props.belongsToId };
    }
    finished = true;
  });
  const showModal = ref(false);
  let checkedRows = $ref([]);
  let currentModel: any | null = $ref(null);

  async function startEdit(id) {
    currentModel = await SalesManManager.getById(id);
    showModal.value = true;
  }

  const loadDataTable = async () => {
    const res = await SalesManManager.load(filterObj);

    return res;
  };

  let filterObj: any | null = $ref(null);

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  function showAdd() {
    currentModel = null;
    if (props.belongsToId) {
      currentModel = { belongsToId: props.belongsToId };
    }
    showModal.value = true;
  }

  const actionRef = ref();

  function reloadTable() {
    actionRef.value.reload();
    showModal.value = false;
  }

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
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
