<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar
      v-if="finished"
      :form-fields="filters"
      @clear="updateFilter(null)"
      @submit="updateFilter"
    >
      <n-button size="small" type="warning" @click="showAdd">
        <template #icon>
          <n-icon>
            <TruckDelivery />
          </n-icon>
        </template>
        新建取货
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
      v-model:show="showModal"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 1200px"
      title="取货计划"
    >
      <new-pick-up-plan :model="currentModel" @saved="reloadTable" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { Component, h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters, PickUpPlanManager } from './columns';
  import { NotifyManager } from '@/api/dataLayer/modules/notify/notify-api';
  import { $ref } from 'vue/macros';
  import { TruckDelivery } from '@vicons/tabler';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import Delete28Filled from '@vicons/fluent/es/Delete28Filled';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import NewPickUpPlan from '@/views/newNewViews/PickUp/NewPickUpPlan.vue';
  import DocumentEdit16Filled from '@vicons/fluent/es/DocumentEdit16Filled';

  const showModal = ref(false);

  let filterObj: any | null = $ref(null);
  let currentModel: any | null = $ref(null);
  let finished = $ref(false);
  const props = defineProps<Prop>();
  interface Prop {
    belongsToId?: string;
  }
  function showAdd() {
    currentModel = null;
    showModal.value = true;
  }

  async function startEdit(id) {
    currentModel = await PickUpPlanManager.getById(id);
    showModal.value = true;
  }

  const loadDataTable = async () => {
    const res = await PickUpPlanManager.load(filterObj);
    console.log(res, 'res');
    return res;
  };

  const actionRef = ref();

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  function reloadTable() {
    actionRef.value.reload();
    showModal.value = false;
  }

  onMounted(async () => {
    if (props.belongsToId) {
      filterObj = { belongsToId: props.belongsToId };
    }
    finished = true;
  });

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 120,
    render(record: any) {
      const fileAction = (label, key, icon?: Component) => {
        return getFileActionButton(label, key, NotifyManager, reloadTable, record, icon);
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
                await PickUpPlanManager.remove(record.id);
                reloadTable();
              },
            },
          },
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
