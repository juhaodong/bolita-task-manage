<template>
  <n-card :bordered="false" class="proCard">
    <div>
      <filter-bar
        v-if="finished"
        :form-fields="filters"
        @clear="updateFilter(null)"
        @submit="updateFilter"
      >
        <n-button type="primary" @click="addTable">
          <template #icon>
            <n-icon>
              <Box20Filled />
            </n-icon>
          </template>
          新建出库计划
        </n-button>
      </filter-bar>
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
                :actionColumn="actionColumn"
                :columns="columns"
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
        style="width: 90%; min-width: 600px; max-width: 1200px"
        title="出库计划"
      >
        <new-outbound-plan @saved="reloadTable" />
      </n-modal>
      <n-modal
        v-model:show="editDetailModel"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 600px; max-width: 600px"
        title="编辑详情"
      >
        <edit-mission-detail :model="currentModel" @saved="reloadTable" />
      </n-modal>
      <n-modal
        v-model:show="addNewFeeDialog"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 600px; max-width: 600px"
        title="新建费用"
      >
        <new-total-fee :current-data="currentData" @saved="reloadTable" />
      </n-modal>
    </div>
  </n-card>
</template>

<script lang="ts" setup>
  import { Component, h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import { $ref } from 'vue/macros';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { NotifyDetailManager } from '@/api/dataLayer/modules/notify/notify-detail';
  import { InBoundStatus } from '@/api/dataLayer/modules/notify/notify-api';
  import { Box20Filled } from '@vicons/fluent';
  import NewOutboundPlan from '@/views/newViews/OutboundPlan/NewOutboundPlan.vue';
  import { OneYearMonthTab } from '@/api/dataLayer/common/MonthDatePick';
  import dayjs from 'dayjs';
  import EditMissionDetail from '@/views/newViews/Missions/AlreadyWarehousing/EditMissionDetail.vue';
  import NewTotalFee from '@/views/newViews/SettlementManage/NewTotalFee.vue';

  const showModal = ref(false);
  let editDetailModel = ref(false);

  let filterObj: any | null = $ref(null);
  let finished = $ref(false);
  let addNewFeeDialog = $ref(false);
  let currentModel: any | null = $ref(null);
  let typeTab = $ref(['未入库', '已入库']);
  let monthTab: any | null = $ref(null);
  let typeMission: any | null = $ref('');
  let selectedMonth: any | null = $ref('');
  let currentData: any | null = $ref('');
  let allList: any | null = $ref([]);
  const props = defineProps<Prop>();
  interface Prop {
    belongsToId?: string;
  }

  async function startEdit(id) {
    currentModel = await NotifyDetailManager.getById(id);
    editDetailModel.value = true;
  }

  function addTable() {
    showModal.value = true;
  }

  const loadDataTable = async () => {
    if (typeMission === '未入库') {
      allList = (await NotifyDetailManager.load(filterObj))
        .filter((it) => it.inStatus !== InBoundStatus.All)
        .filter((x) => dayjs(x.createTimestamp).format('YYYY-MM') === selectedMonth);
    } else {
      allList = (await NotifyDetailManager.load(filterObj))
        .filter((it) => it.inStatus === InBoundStatus.All)
        .filter((x) => dayjs(x.createTimestamp).format('YYYY-MM') === selectedMonth);
    }
    console.log(allList, 'allList');
    return allList;
  };
  const actionRef = ref();

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  function checkCashStatus(id) {
    currentData = allList.find((it) => it.id === id);
    console.log(currentData, 'data');
    addNewFeeDialog = true;
  }

  function reloadTable() {
    actionRef.value[0].reload();
    showModal.value = false;
    editDetailModel.value = false;
    addNewFeeDialog = false;
  }

  onMounted(async () => {
    monthTab = OneYearMonthTab();
    typeMission = '未入库';
    selectedMonth = monthTab[0];
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
        return getFileActionButton(label, key, NotifyDetailManager, reloadTable, record, icon);
      };
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '修改',
            onClick() {
              console.log(record.id, 'id');
              startEdit(record.id);
            },
          },
          {
            label: '结算',
            onClick() {
              checkCashStatus(record.id);
            },
            ifShow: () => {
              return typeMission === '已入库';
            },
          },
          fileAction('提单文件', 'files'),
          fileAction('POD', 'POD'),
          fileAction('操作文件', 'operationFiles'),
          fileAction('问题图片', 'problemFiles'),
          {
            label: '信息已变更',
            highlight: () => {
              return 'error';
            },
            async onClick() {
              record.alreadyChanged = 0;
              await NotifyDetailManager.editInternal(record, record.id);
            },
            ifShow: () => {
              return record.alreadyChanged;
            },
          },
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
