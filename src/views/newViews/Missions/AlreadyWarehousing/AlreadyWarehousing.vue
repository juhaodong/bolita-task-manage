<template>
  <n-card :bordered="false" class="proCard">
    <div>
      <filter-bar :form-fields="filters" @clear="updateFilter(null)" @submit="updateFilter">
        <n-button type="primary" @click="addTable">
          <template #icon>
            <n-icon>
              <Box20Filled />
            </n-icon>
          </template>
          新建出库计划
        </n-button>
        <n-button type="primary" @click="selectedHeader">
          <template #icon>
            <n-icon>
              <Box20Filled />
            </n-icon>
          </template>
          选择表头显示
        </n-button>
        <n-button v-if="typeMission === '待审核'" type="primary" @click="checkDetailInfo">
          <template #icon>
            <n-icon>
              <Box20Filled />
            </n-icon>
          </template>
          审核
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
                v-model:checked-row-keys="checkedRows"
                :actionColumn="actionColumn"
                :columns="currentColumns"
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
        style="width: 90%; min-width: 800px; max-width: 800px"
        title="新建费用"
      >
        <new-total-fee :current-data="currentData" @saved="reloadTable" />
      </n-modal>
      <n-modal
        v-model:show="addNewTrayDialog"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 800px; max-width: 800px"
        title="添加托盘"
      >
        <new-tray-dialog :current-data="recordData" @saved="reloadTable" />
      </n-modal>
      <n-modal
        v-model:show="showCurrentHeaderDataTable"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 800px; max-width: 800px"
        title="添加表头"
      >
        <selected-header-table :all-columns="columns" @saved="reloadHeader" />
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
  import {
    InBoundDetailStatus,
    InBoundStatus,
    NotifyManager,
    OutPlanStatus,
  } from '@/api/dataLayer/modules/notify/notify-api';
  import { Box20Filled } from '@vicons/fluent';
  import NewOutboundPlan from '@/views/newViews/OutboundPlan/NewOutboundPlan.vue';
  import { dateCompare, OneYearMonthTab } from '@/api/dataLayer/common/MonthDatePick';
  import dayjs from 'dayjs';
  import EditMissionDetail from '@/views/newViews/Missions/AlreadyWarehousing/EditMissionDetail.vue';
  import NewTotalFee from '@/views/newViews/SettlementManage/NewTotalFee.vue';
  import { useUploadDialog } from '@/store/modules/uploadFileState';
  import NewTrayDialog from '@/views/newViews/Missions/AlreadyWarehousing/NewTrayDialog.vue';
  import SelectedHeaderTable from '@/views/newViews/Missions/AlreadyWarehousing/SelectedHeaderTable.vue';
  import { getTableHeader } from '@/api/dataLayer/common/TableHeader';

  const showModal = ref(false);
  let editDetailModel = ref(false);

  let filterObj: any | null = $ref(null);
  let addNewFeeDialog = $ref(false);
  let checkedRows = $ref([]);
  let currentModel: any | null = $ref(null);
  let typeTab = $ref(['待审核', '未入库', '已入库', '库内操作', '已出库']);
  let monthTab: any | null = $ref(null);
  let typeMission: any | null = $ref('');
  let selectedMonth: any | null = $ref('');
  let currentData: any | null = $ref('');
  let recordData: any | null = $ref('');
  let allList: any | null = $ref([]);
  let addNewTrayDialog = $ref(false);
  let showCurrentHeaderDataTable = $ref(false);
  let currentHeader = $ref([]);
  let currentColumns = $ref([]);
  const actionRef = ref();
  const props = defineProps<Prop>();
  interface Prop {
    belongsToId?: string;
  }

  async function startEdit(id) {
    currentModel = await NotifyDetailManager.getById(id);
    editDetailModel.value = true;
  }

  async function selectedHeader() {
    showCurrentHeaderDataTable = true;
    console.log(columns, 'columns');
  }

  async function startAddTray(id) {
    console.log(id, 'id');
    addNewTrayDialog = true;
  }

  function addTable() {
    showModal.value = true;
  }

  async function checkDetailInfo() {
    for (const rows of checkedRows) {
      const res = allList.find((it) => it.id === rows);
      if (res) {
        res.inStatus = InBoundStatus.Wait;
        res.checkedTime = dayjs().format('YYYY-MM-DD');
        await NotifyDetailManager.editInternal(res, rows);
        const containerForecastInfo = await NotifyManager.getById(res.notifyId);
        if (containerForecastInfo.inStatus === InBoundStatus.WaitCheck) {
          const allDetailList = allList
            .filter((x) => x.notifyId === res.notifyId)
            .filter(
              (b) =>
                b.inStatus === InBoundDetailStatus.WaitSubmit ||
                b.inStatus === InBoundDetailStatus.WaitCheck
            );
          if (allDetailList.length === 0) {
            containerForecastInfo.inStatus = InBoundStatus.Wait;
            await NotifyManager.editInternal(containerForecastInfo, containerForecastInfo.id);
          }
        }
      }
    }
    checkedRows = [];
    await reloadTable();
  }

  const loadDataTable = async () => {
    if (typeMission === '未入库') {
      allList = (await NotifyDetailManager.load(filterObj))
        .filter((it) => it.inStatus !== InBoundStatus.All)
        .filter((x) => dayjs(x.createTimestamp).format('YYYY-MM') === selectedMonth);
    } else if (typeMission === '待审核') {
      allList = (await NotifyDetailManager.load(filterObj))
        .filter(
          (it) =>
            it.inStatus === InBoundDetailStatus.WaitCheck ||
            it.inStatus === InBoundDetailStatus.WaitSubmit
        )
        .filter((x) => dayjs(x.createTimestamp).format('YYYY-MM') === selectedMonth);
    } else if (typeMission === '已入库') {
      allList = (await NotifyDetailManager.load(filterObj))
        .filter(
          (it) =>
            it.inStatus === InBoundStatus.All ||
            it.inStatus === OutPlanStatus.AlreadyPlan ||
            it.inStatus === OutPlanStatus.AlreadyBookingCar
        )
        .filter((x) => dayjs(x.createTimestamp).format('YYYY-MM') === selectedMonth);
    } else if (typeMission === '库内操作') {
      allList = (await NotifyDetailManager.load(filterObj))
        .filter(
          (it) =>
            it.inStatus === InBoundStatus.All ||
            it.inStatus === OutPlanStatus.AlreadyPlan ||
            it.inStatus === OutPlanStatus.AlreadyBookingCar
        )
        .filter((it) => it.changeOrderFiles === '是' || it.deliveryMethod === '留仓')
        .filter((x) => dayjs(x.createTimestamp).format('YYYY-MM') === selectedMonth);
    } else {
      allList = (await NotifyDetailManager.load(filterObj))
        .filter((it) => it.inStatus === OutPlanStatus.AlreadyOut)
        .filter((x) => dayjs(x.createTimestamp).format('YYYY-MM') === selectedMonth);
    }
    return allList.sort(dateCompare('createTimestamp'));
  };

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  function checkCashStatus(id) {
    currentData = allList.find((it) => it.id === id);
    addNewFeeDialog = true;
  }

  async function reloadHeader() {
    currentColumns = [];
    currentHeader = await getTableHeader('missions');
    currentHeader.forEach((item) => {
      const res = columns.find((it) => it.key === item.key);
      currentColumns.push(res);
    });
    const selectionType = columns.find((x) => x.type === 'selection');
    if (selectionType) {
      currentColumns.unshift(selectionType);
    }
    currentColumns = currentColumns.length > 0 ? currentColumns : columns;
    showCurrentHeaderDataTable = false;
  }

  async function reloadTable() {
    showModal.value = false;
    editDetailModel.value = false;
    addNewFeeDialog = false;
    addNewTrayDialog = false;
    showCurrentHeaderDataTable = false;
    actionRef.value[0].reload();
  }

  onMounted(async () => {
    await reloadHeader();
    monthTab = OneYearMonthTab();
    typeMission = '已入库';
    selectedMonth = monthTab[0];
    await reloadTable();
    if (props.belongsToId) {
      filterObj = { belongsToId: props.belongsToId };
    }
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
            // ifShow: () => {
            //   return typeMission === '已出库';
            // },
          },
          {
            label: '换单文件',
            highlight: () => {
              return record?.['changeOrder']?.length > 0 ? 'success' : 'error';
            },
            ifShow: () => {
              return record?.changeOrderFiles === '是';
            },
            async onClick() {
              const upload = useUploadDialog();
              const files = await upload.upload(record['changeOrder']);
              if (files.checkPassed) {
                const obj = {};
                obj['changeOrder'] = files.files;
                obj['inStatus'] = InBoundDetailStatus.WaitCheck;
                await NotifyDetailManager.editInternal(obj, record.id);
              }
              actionRef.value[0].reload();
            },
          },
          fileAction('提单文件', 'files'),
          fileAction('POD', 'POD'),
          fileAction('操作文件', 'operationFiles'),
          fileAction('问题图片', 'problemFiles'),
          {
            label: '添加托盘',
            onClick() {
              recordData = record;
              startAddTray(record.id);
            },
            highlight: () => {
              return record.detailTray ? 'success' : 'error';
            },
            ifShow: () => {
              return record.outboundMethod === '大件托盘' || record.outboundMethod === '标准托盘';
            },
          },
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
