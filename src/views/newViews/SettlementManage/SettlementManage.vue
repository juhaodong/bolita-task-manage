<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar
      v-if="finished"
      :form-fields="filters"
      :default-value-model="filterObj"
      @clear="updateFilter(null)"
      @submit="updateFilter"
    >
      <n-button :disabled="checkedRows.length == 0" @click="merge()">
        <template #icon>
          <n-icon>
            <Box20Filled />
          </n-icon>
        </template>
        合并对账
      </n-button>
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
      v-model:show="showModal"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="新建/编辑用户"
    >
      <new-settlement :model="currentModel" @saved="reloadTable" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { Component, h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { $ref } from 'vue/macros';
  import DocumentEdit16Filled from '@vicons/fluent/es/DocumentEdit16Filled';
  import { CashManager, FinanceManager } from '@/api/dataLayer/modules/cash/cash';
  import NewSettlement from '@/views/newViews/SettlementManage/NewSettlement.vue';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import { Box20Filled, Folder32Filled } from '@vicons/fluent';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { safeSumBy } from '@/store/utils/utils';

  interface Prop {
    outId?: string;
  }

  let finished = $ref(false);
  const props = defineProps<Prop>();
  onMounted(() => {
    if (props.outId) {
      filterObj = { outId: props.outId };
    }
    finished = true;
  });
  const showModal = ref(false);
  let checkedRows = $ref([]);
  let currentModel: any | null = $ref(null);

  async function startEdit(id) {
    currentModel = await CashManager.getById(id);
    showModal.value = true;
  }

  const loadDataTable = async () => {
    return await CashManager.load(filterObj);
  };

  let filterObj: any | null = $ref(null);

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  const actionRef = ref();

  function reloadTable() {
    actionRef.value.reload();
    showModal.value = false;
  }

  async function merge() {
    await safeScope(async () => {
      const currentList: any[] = [];
      for (const checkedRow of checkedRows) {
        currentList.push(await CashManager.getById(checkedRow));
      }
      const totalPrice = safeSumBy(currentList, 'subtotal');
      console.log(currentList);
      const id = await FinanceManager.addInternal({
        systemSettlementPrice: totalPrice,
        customerId: currentList[0].customerId,
      });
      await CashManager.massiveUpdate(
        checkedRows.map((it) => ({
          id: it,
          financeId: id,
        }))
      );
      reloadTable();
      checkedRows = [];
    });
  }

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 60,
    render(record: any) {
      const fileAction = (label, key, icon?: Component, editable = false) => {
        return getFileActionButton(label, key, CashManager, reloadTable, record, icon, editable);
      };
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
          fileAction('附件', 'files', Folder32Filled, true),
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
