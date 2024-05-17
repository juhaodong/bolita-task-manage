<template>
  <n-card :bordered="false" class="proCard">
    <div>
      <filter-bar :form-fields="filters" @clear="updateFilter(null)" @submit="updateFilter">
        <n-button type="primary" @click="selectedHeader">
          <template #icon>
            <n-icon>
              <Box20Filled />
            </n-icon>
          </template>
          选择表头显示
        </n-button>
      </filter-bar>
      <div class="my-2"></div>
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
        <selected-header-table :all-columns="columns" :type="'mission'" @saved="reloadHeader" />
      </n-modal>
      <n-modal
        v-model:show="showTimeLine"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 800px; max-width: 800px"
        title="时间线"
      >
        <time-line :ids="currentId" />
      </n-modal>
    </div>
  </n-card>
</template>

<script lang="ts" setup>
  import { Component, h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from '@/views/newViews/Missions/AlreadyWarehousing/columns';
  import { $ref } from 'vue/macros';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { NotifyDetailManager } from '@/api/dataLayer/modules/notify/notify-detail';
  import { InBoundDetailStatus, InBoundStatus } from '@/api/dataLayer/modules/notify/notify-api';
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
  import TimeLine from '@/views/newViews/Missions/AlreadyWarehousing/TimeLine.vue';
  import { useUserStore } from '@/store/modules/user';
  import { hasAuthPower } from '@/api/dataLayer/common/power';

  const showModal = ref(false);
  let editDetailModel = ref(false);

  let filterObj: any | null = $ref(null);
  let addNewFeeDialog = $ref(false);
  let checkedRows = $ref([]);
  let currentModel: any | null = $ref(null);
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
  let currentId = $ref('');
  let showTimeLine = $ref(false);
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

  const loadDataTable = async () => {
    allList = (await NotifyDetailManager.load(filterObj))
      .filter((it) => it.inStatus === '存仓' || it.inStatus === '库内操作')
      .filter((x) => dayjs(x.createTimestamp).format('YYYY-MM') === selectedMonth);
    allList.forEach((it) => {
      const today = dayjs().format('YYYY-MM-DD');
      if (it.inStatus === '全部出库' || it.inStatus === '等待审核' || it.inStatus === '等待入库') {
        it.stayTime = '-';
      } else {
        it.stayTime = dayjs(today).diff(it.arriveTime, 'day') + 1;
      }
    });
    return allList.sort(dateCompare('createTimestamp'));
  };

  function updateFilter(value) {
    if (value !== null) {
      let { filterTitle, filterKey, ...NewObj } = value;
      if (value['filterTitle'] && value['filterKey']) {
        const res = columns.find((it) => it.title === value['filterTitle']).key;
        NewObj[res] = value['filterKey'];
      }
      filterObj = NewObj;
    } else {
      filterObj = null;
    }
    reloadTable();
  }

  function checkCashStatus(id) {
    currentData = allList.find((it) => it.id === id);
    addNewFeeDialog = true;
  }

  async function reloadHeader() {
    currentColumns = [];
    currentHeader = await getTableHeader('mission');
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
    await actionRef.value[0].reload();
  }

  function getQueryString(name) {
    return (
      decodeURIComponent(
        (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) || [
          '',
          '',
        ])[1].replace(/\+/g, '%20')
      ) || null
    );
  }

  onMounted(async () => {
    await reloadHeader();
    monthTab = OneYearMonthTab();
    typeMission = '整柜任务看板';
    selectedMonth = monthTab[0];
    const res = getQueryString('containerId');
    if (res) {
      updateFilter({ containerId: res });
    } else {
      await reloadTable();
    }
    if (props.belongsToId) {
      filterObj = { belongsToId: props.belongsToId };
    }
  });

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 120,
    render(record: any) {
      const fileAction = (label, key, icon?: Component, power) => {
        return getFileActionButton(
          label,
          key,
          NotifyDetailManager,
          reloadTable,
          record,
          icon,
          power
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
            ifShow: () => {
              return hasAuthPower('inStorageEdit');
            },
          },
          {
            label: '结算',
            onClick() {
              checkCashStatus(record.id);
            },
            ifShow: () => {
              return hasAuthPower('inStorageSettle');
            },
          },
          {
            label: '时间线',
            onClick() {
              currentId = record.id;
              showTimeLine = true;
            },
            ifShow: () => {
              return hasAuthPower('inStorageTimeLine');
            },
          },
          {
            label: '换单文件',
            highlight: () => {
              return record?.['changeOrder']?.length > 0 ? 'success' : 'error';
            },
            ifShow: () => {
              return record?.changeOrderFiles === '是' && hasAuthPower('inStorageChangeFiles');
            },
            async onClick() {
              const upload = useUploadDialog();
              const files = await upload.upload(record['changeOrder']);
              if (files.checkPassed) {
                const obj = {};
                obj['changeOrder'] = files.files;
                if (!record.arriveTime) {
                  obj['inStatus'] = InBoundDetailStatus.WaitCheck;
                }
                await NotifyDetailManager.editInternal(obj, record.id);
              }
              actionRef.value[0].reload();
            },
          },
          fileAction('POD', 'POD', '', 'inStoragePOD'),
          fileAction('操作文件', 'operationFiles', '', 'inStorageOperationFile'),
          fileAction('问题图片', 'problemFiles', '', 'inStorageProblemPic'),
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
              return (
                (record.outboundMethod === '大件托盘' || record.outboundMethod === '标准托盘') &&
                hasAuthPower('inStorageAddTray')
              );
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
          {
            label: '转库外',
            highlight: () => {
              return 'info';
            },
            async onClick() {
              const userInfo = useUserStore().info;
              let timeInfo = record.timeLine;
              record.operateInStorage = '否';
              timeInfo.unshift({
                operator: userInfo?.realName,
                detailTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                note: '完成库内操作',
              });
              if (record.outboundMethod !== '存仓') {
                record.inStatus = InBoundStatus.All;
              }
              record.timeLine = timeInfo;
              await NotifyDetailManager.editInternal(record, record.id);
              await reloadTable();
            },
            ifShow: () => {
              return record.operateInStorage === '是' && hasAuthPower('inStorageTurnToOut');
            },
          },
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
