<template>
  <n-card v-if="hasAuthPower('inStorageView')" :bordered="false" class="proCard">
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
        <n-button type="primary" @click="finishedCancel">
          <template #icon>
            <n-icon>
              <Box20Filled />
            </n-icon>
          </template>
          操作完成
        </n-button>
        <n-button type="info" @click="downloadData">
          <template #icon>
            <n-icon>
              <Box20Filled />
            </n-icon>
          </template>
          下载
        </n-button>
      </filter-bar>
      <div class="mt-2" style="display: flex; align-items: center; justify-items: center">
        <n-card embedded size="small" style="max-width: 300px">
          <div style="display: flex">
            <n-select
              v-model:value="optionOne"
              :options="realOptions"
              placeholder="过滤项1"
              style="width: 130px"
            />
            <n-input
              v-model:value="valueOne"
              class="ml-2"
              placeholder="过滤值1"
              style="width: 130px"
              type="text"
            />
          </div>
        </n-card>
        <n-card class="ml-2" embedded size="small" style="max-width: 300px">
          <div style="display: flex">
            <n-select
              v-model:value="optionTwo"
              :options="realOptions"
              placeholder="过滤项2"
              style="width: 130px"
            />
            <n-input
              v-model:value="valueTwo"
              class="ml-2"
              placeholder="过滤值2"
              style="width: 130px"
              type="text"
            />
          </div>
        </n-card>
        <n-date-picker
          v-model:value="dateRange"
          :default-value="[dayjs().valueOf(), dayjs().valueOf()]"
          class="ml-2"
          clearable
          type="daterange"
        />
        <n-checkbox v-model:checked="showAll" class="ml-2" label="全部" size="large" />
      </div>
      <div class="my-2"></div>
      <BasicTable
        ref="actionRef"
        v-model:checked-row-keys="checkedRows"
        :actionColumn="actionColumn"
        :columns="currentColumns"
        :request="loadDataTable"
        :row-key="(row) => row.id"
      />
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
      <n-modal
        v-model:show="showConfirmDialog"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 400px; max-width: 400px"
        title="请确认"
      >
        <confirm-dialog :title="'您确定要执行这个操作吗？'" @saved="confirmCancel" />
      </n-modal>
    </div>
  </n-card>
  <no-power-page v-else />
</template>

<script lang="ts" setup>
  import { Component, computed, h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from '@/views/newViews/Missions/AlreadyWarehousing/columns';
  import { $ref } from 'vue/macros';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import {
    getDetailListById,
    NotifyDetailManager,
  } from '@/api/dataLayer/modules/notify/notify-detail';
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
  import { getUserCustomerList, hasAuthPower } from '@/api/dataLayer/common/power';
  import NoPowerPage from '@/views/newViews/Common/NoPowerPage.vue';
  import { generateOptionFromArray, safeSumBy } from '@/store/utils/utils';
  import { valueOfToday } from '@/api/dataLayer/common/Date';
  import ConfirmDialog from '@/views/newViews/Common/ConfirmDialog.vue';
  import { inStorageObj } from '@/views/newViews/Missions/AlreadyWarehousing/selectionType';
  import FileSaver from 'file-saver';

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
  let optionOne = $ref('');
  let optionTwo = $ref('');
  let valueOne = $ref('');
  let valueTwo = $ref('');
  let dateRange = $ref(valueOfToday);
  let showConfirmDialog = $ref(false);
  let cancelIds = $ref([]);
  let showAll = $ref(false);
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

  const realOptions = computed(() => {
    return generateOptionFromArray(columns.filter((it) => it.key).map((it) => it.title));
  });

  const loadDataTable = async () => {
    const customerId = await getUserCustomerList();
    let startDate = dayjs(dateRange[0]).startOf('day').valueOf() ?? valueOfToday[0];
    let endDate = dayjs(dateRange[1]).endOf('day').valueOf() ?? valueOfToday[1];
    allList = (await NotifyDetailManager.load(filterObj)).filter(
      (it) => it.inStatus === '存仓' || it.inStatus === '库内操作'
    );
    allList.forEach((it) => {
      if (it.storageTime) {
        const res = it.storageTime.pop();
        if (!res.totalStorageTime) {
          res.outBoundTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
          res.totalStorageTime = dayjs(res.outBoundTime).diff(res.storageTime, 'hour');
        }
        it.storageTime.push(res);
        const usefulTimeList = it.storageTime.filter((x) => x.totalStorageTime);
        it.stayTime = safeSumBy(usefulTimeList, 'totalStorageTime');
      } else {
        it.stayTime = '-';
      }
    });
    if (!showAll) {
      allList = allList.filter((a) => a.inStatus !== '已取消');
    }
    return allList
      .filter((x) => customerId.includes(x.customerId))
      .filter((it) => it.createTimestamp > startDate && it.createTimestamp < endDate)
      .sort(dateCompare('createTimestamp'));
  };

  async function downloadData() {
    let selectedList = [];
    selectedList = await loadDataTable();
    let headerTitle = columns
      .filter((it) => it.title)
      .map((it) => it.title)
      .join();
    let dataStrings = [];
    dataStrings.unshift(headerTitle);
    selectedList.forEach((it) => {
      const res = [
        it.customerName ?? '',
        it.containerId ?? '',
        it.ticketId ?? '',
        it.country ?? '',
        it.number ?? '',
        it.arrivedContainerNum ?? '',
        it.weight ?? '',
        it.volume ?? '',
        it.size ?? '',
        it.inStatus ?? '',
        it.warehouseId ?? '',
        it.stayTime ?? '',
        it.deliveryIdIn ?? '',
        it.normalNote ?? '',
        it.FBADeliveryCode ?? '',
        it.outboundMethod ?? '',
        it.deliveryMethod ?? '',
        it.operationRequire ?? '',
        it.operationNote ?? '',
        it.finalStatus ?? '',
        it.PO ?? '',
        it.FCAddress ?? '',
        it.postcode ?? '',
        it.inBoundDetailStatus ?? '',
        it.changeOrderFiles ?? '',
        it.transportationNote ?? '',
        it.trayNum ?? '',
        it.arrivedTrayNum ?? '',
        dayjs(it.planArriveDateTime).format('YYYY-MM-DD') ?? '',
        dayjs(it.currentDate[0]).format('YYYY-MM-DD') ?? '',
        it.deliveryTime ? dayjs(it.deliveryTime).format('YYYY-MM-DD') : '',
        it.Ref ?? '',
        it.note ?? '',
        it.sign ?? '',
        it.package ?? '',
        it.industrialTrayNum ?? '',
        it.productName ?? '',
        it.UNNumber ?? '',
        it.recipient ?? '',
        it.phone ?? '',
        it.email ?? '',
        it.needReserve ?? '',
        it.industrialNote ?? '',
      ];
      dataStrings.push(res.join());
    });
    dataStrings = dataStrings.join('\n');
    const blob = new Blob([dataStrings], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(
      blob,
      dayjs(dateRange[0]).startOf('day').format('YYYY-MM-DD') +
        '~' +
        dayjs(dateRange[1]).endOf('day').format('YYYY-MM-DD') +
        '库内操作' +
        '.csv'
    );
  }

  function updateFilter(value) {
    if (value !== null) {
      if (optionOne && valueOne) {
        const keyOne = columns.find((it) => it.title === optionOne).key;

        value[keyOne] = valueOne;
      }
      if (optionTwo && valueTwo) {
        const keyTwo = columns.find((it) => it.title === optionTwo).key;
        value[keyTwo] = valueTwo;
      }
      filterObj = value;
    } else {
      filterObj = null;
      optionOne = '';
      valueOne = '';
      optionTwo = '';
      valueTwo = '';
      dateRange = valueOfToday;
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
    currentColumns = currentColumns.length > 0 ? currentColumns : columns;
    currentColumns = [inStorageObj, ...currentColumns];
    showCurrentHeaderDataTable = false;
  }

  async function reloadTable() {
    showModal.value = false;
    editDetailModel.value = false;
    addNewFeeDialog = false;
    addNewTrayDialog = false;
    showCurrentHeaderDataTable = false;
    showConfirmDialog = false;
    await actionRef.value.reload();
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

  function finishedCancel() {
    cancelIds = checkedRows;
    showConfirmDialog = true;
  }

  async function confirmCancel() {
    const userInfo = useUserStore().info;
    const currentList = await getDetailListById(cancelIds);
    for (const currentItem of currentList) {
      let timeInfo = currentItem.timeLine;
      currentItem.operateInStorage = '否';
      timeInfo.unshift({
        operator: userInfo?.realName,
        detailTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        note: '完成库内操作',
      });
      if (currentItem.outboundMethod !== '存仓') {
        currentItem.inStatus = InBoundStatus.WaitOperate;
      } else {
        currentItem.inStatus = '存仓';
      }
      currentItem.timeLine = timeInfo;
      await NotifyDetailManager.editInternal(currentItem, currentItem.id);
    }
    await reloadTable();
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
            label: '操作已完成',
            highlight: () => {
              return 'info';
            },
            async onClick() {
              cancelIds = [];
              cancelIds.push(record.id);
              showConfirmDialog = true;
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
