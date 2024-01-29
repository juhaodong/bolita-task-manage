<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar
      v-if="finished"
      :default-value-model="filterObj"
      :form-fields="filters"
      @clear="updateFilter(null)"
      @submit="updateFilter"
    />
    <div class="my-2"></div>
    <n-tabs
      v-model:value="typeMission"
      animated
      class="card-tabs"
      pane-style="padding-left: 4px; padding-right: 4px; box-sizing: border-box;"
      pane-wrapper-style="margin: 0 -4px"
      size="large"
    >
      <n-tab-pane
        v-for="currentType in typeTab"
        :key="currentType"
        :name="currentType"
        :tab="currentType"
      >
        <n-tabs v-model:value="selectedMonth" tab-style="min-width: 80px;" type="card">
          <n-tab-pane
            v-for="currentMonth in monthTab"
            :key="currentMonth"
            :name="currentMonth"
            :tab="currentMonth"
          >
            <BasicTable
              ref="actionRef"
              v-model:checked-row-keys="checkedRows"
              :action-column="typeMission === '货柜对账' ? actionColumn : actionColumnContainer"
              :columns="typeMission === '货柜对账' ? columns : columnsContainer"
              :request="loadDataTable"
              :row-key="(row) => row.id"
            />
          </n-tab-pane>
        </n-tabs>
      </n-tab-pane>
    </n-tabs>

    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="新建/编辑用户"
    >
      <new-reconciliation :model="currentModel" :type-mission="typeMission" @saved="reloadTable" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { Component, h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, columnsContainer, filters } from './columns';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { $ref } from 'vue/macros';
  import { FinanceContainerManager, FinanceManager } from '@/api/dataLayer/modules/cash/cash';
  import NewReconciliation from '@/views/newViews/ReconciliationManage/NewReconciliation.vue';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import { Folder32Filled } from '@vicons/fluent';
  import { dateCompare, OneYearMonthTab } from '@/api/dataLayer/common/MonthDatePick';
  import dayjs from 'dayjs';

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
  let typeTab = $ref(['货柜对账', '卸柜对账']);
  let monthTab: any | null = $ref(null);
  let typeMission: any | null = $ref('');
  let selectedMonth: any | null = $ref('');
  let currentModel: any | null = $ref(null);
  let allList: any | null = $ref([]);

  async function startEdit(id) {
    if (typeMission === '货柜对账') {
      currentModel = await FinanceManager.getById(id);
    } else {
      currentModel = await FinanceContainerManager.getById(id);
    }
    showModal.value = true;
  }

  const loadDataTable = async () => {
    if (typeMission === '货柜对账') {
      allList = (await FinanceManager.load(filterObj)).filter(
        (x) => dayjs(x.createTimestamp).format('YYYY-MM') === selectedMonth
      );
    } else {
      allList = (await FinanceContainerManager.load(filterObj)).filter(
        (x) => dayjs(x.createTimestamp).format('YYYY-MM') === selectedMonth
      );
    }
    console.log(allList, 'list');
    return allList.sort(dateCompare('createTimestamp'));
  };

  let filterObj: any | null = $ref(null);

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }
  onMounted(async () => {
    monthTab = OneYearMonthTab();
    typeMission = '货柜对账';
    selectedMonth = monthTab[0];
    finished = true;
  });

  function showAdd() {
    currentModel = null;
    showModal.value = true;
  }
  const actionRef = ref();

  function reloadTable() {
    actionRef.value[0].reload();
    showModal.value = false;
  }

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 60,
    render(record: any) {
      const fileAction = (label, key, icon?: Component, editable = false) => {
        return getFileActionButton(label, key, FinanceManager, reloadTable, record, icon, editable);
      };
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '修改',
            onClick() {
              startEdit(record.id);
            },
          },
          fileAction('附件', 'files', Folder32Filled, true),
        ],
      });
    },
  });

  const actionColumnContainer = reactive({
    title: '可用动作',
    key: 'action',
    width: 60,
    render(record: any) {
      const fileAction = (label, key, icon?: Component, editable = false) => {
        return getFileActionButton(
          label,
          key,
          FinanceContainerManager,
          reloadTable,
          record,
          icon,
          editable
        );
      };
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '修改',
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
