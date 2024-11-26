<template>
  <n-card v-if="hasAuthPower('outMissionView')" :bordered="false" class="proCard">
    <filter-bar :form-fields="filters" @clear="updateFilter(null)" @submit="updateFilter">
      <n-button type="primary" @click="selectedHeader">
        <template #icon>
          <n-icon>
            <Box20Filled />
          </n-icon>
        </template>
        选择表头显示
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
      <n-date-picker v-model:value="dateRange" class="ml-2" clearable type="daterange" />
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
      v-model:show="showOutboundOrderDetail"
      :show-icon="false"
      preset="dialog"
      style="width: 90%; min-width: 600px; max-width: 800px"
      title="出库单"
    >
      <outbound-order
        :amz-id="AMZID"
        :data="currentData"
        :delivery-method="currentDeliveryMethod"
        :fba-code="FBACode"
        :pick-date="pickDate"
        :ref-code="RefCode"
        @saved="closeDetail"
      />
    </n-modal>
    <n-modal
      v-model:show="showShareCarModel"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="新建订车"
    >
      <new-carpool-management :merged-out-ids="checkedRows" @saved="saveShareCar" />
    </n-modal>
    <n-modal
      v-model:show="editOutboundForecast"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="编辑"
    >
      <edit-o-f :id="editId" @saved="saved" />
    </n-modal>
    <n-modal
      v-model:show="showLoadingCarListDialog"
      :show-icon="false"
      preset="dialog"
      style="width: 90%; min-width: 600px; max-width: 800px"
      title="装柜表"
    >
      <loading-car-list :id="currentId" :outbound-info="currentInfo" @save="reloadTable" />
    </n-modal>
    <n-modal
      v-model:show="showFeeDialog"
      :show-icon="false"
      preset="dialog"
      style="width: 90%; min-width: 600px; max-width: 800px"
      title="费用表"
    >
      <out-bound-fee-dialog :current-info="currentInfo" @save="reloadTable" />
    </n-modal>
    <n-modal
      v-model:show="showCurrentHeaderDataTable"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 800px; max-width: 800px"
      title="添加表头"
    >
      <selected-header-table
        :all-columns="operationColumns"
        :type="'operation'"
        @saved="reloadHeader"
      />
    </n-modal>
    <n-modal
      v-model:show="showDetailInfoDialog"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 800px; max-width: 800px"
      title="查看详情"
    >
      <detail-info-dialog :ids="currentIds" />
    </n-modal>
    <n-modal
      v-model:show="showLoadingCarDoc"
      :show-icon="false"
      preset="dialog"
      style="width: 90%; min-width: 600px; max-width: 1000px"
      title="装车单"
    >
      <loading-car-doc :notify-id="currentNotifyId!" @save="reloadTable" />
    </n-modal>
  </n-card>
  <no-power-page v-else />
</template>

<script lang="ts" setup>
  import { Box20Filled } from '@vicons/fluent';
  import { Component, computed, h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { filters } from './columns';
  import {
    getFileActionButtonByOutForecast,
    statusColumnEasy,
    timeTableColumn,
  } from '@/views/bolita-views/composable/useableColumns';
  import { $ref } from 'vue/macros';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import NewCarpoolManagement from '@/views/newViews/CarpoolManagement/dialog/NewCarpoolManagement.vue';
  import { dateCompare } from '@/api/dataLayer/common/MonthDatePick';
  import dayjs from 'dayjs';
  import OutboundOrder from '@/views/newViews/OutboundForecast/OutboundOrder.vue';
  import EditOF from '@/views/newViews/OperationDetail/NotOutbound/EditOF.vue';
  import LoadingCarList from '@/views/newViews/OperationDetail/NotOutbound/LoadingCarList.vue';
  import OutBoundFeeDialog from '@/views/newViews/OperationDetail/NotOutbound/OutBoundFeeDialog.vue';
  import { NButton } from 'naive-ui';
  import { columns } from '@/views/newViews/Missions/AlreadyWarehousing/columns';
  import SelectedHeaderTable from '@/views/newViews/Missions/AlreadyWarehousing/SelectedHeaderTable.vue';
  import DetailInfoDialog from '@/views/newViews/OperationDetail/NotOutbound/DetailInfoDialog.vue';
  import { CarStatus } from '@/views/newViews/OutboundPlan/columns';
  import LoadingCarDoc from '@/views/newViews/OperationDetail/NotOutbound/LoadingCarDoc.vue';
  import { hasAuthPower } from '@/api/dataLayer/common/power';
  import NoPowerPage from '@/views/newViews/Common/NoPowerPage.vue';
  import { valueOfToday } from '@/api/dataLayer/common/Date';
  import { generateOptionFromArray } from '@/store/utils/utils';
  import FileSaver from 'file-saver';
  import { getTableHeaderGroupItemList } from '@/api/newDataLayer/Header/HeaderGroup';
  import {
    addOrUpdateWithRefOutboundForecast,
    getOutboundForecastListByFilter,
  } from '@/api/newDataLayer/OutboundForecast/OutboundForecast';
  import { useUploadDialog } from '@/store/modules/uploadFileState';
  import { addOrUpdateTask, getTaskListByOutboundId } from '@/api/newDataLayer/TaskList/TaskList';
  import { addOrUpdateTaskTimeLine } from '@/api/newDataLayer/TimeLine/TimeLine';
  import { useUserStore } from '@/store/modules/user';

  const showModal = ref(false);
  let showShareCarModel = $ref(false);
  let checkedRows = $ref([]);
  let monthTab: any | null = $ref(null);
  let typeMission: any | null = $ref('');
  let selectedMonth: any | null = $ref('');
  let showOutboundOrderDetail = $ref(false);
  let editOutboundForecast = $ref(false);
  let currentDeliveryMethod = $ref('');
  let currentData = $ref('');
  let RefCode = $ref('');
  let FBACode = $ref('');
  let pickDate = $ref('');
  let AMZID = $ref('');
  let editId = $ref('');
  let allList = $ref([]);
  let currentId = $ref([]);
  let showLoadingCarListDialog = $ref(false);
  let currentList = $ref([]);
  let currentInfo = $ref([]);
  let showFeeDialog = $ref(false);
  let showDetailInfoDialog = $ref(false);
  let currentIds = $ref([]);
  let currentNotifyId: string | null = $ref(null);
  let showLoadingCarDoc = $ref(false);
  let optionOne = $ref('');
  let optionTwo = $ref('');
  let valueOne = $ref('');
  let valueTwo = $ref('');
  let dateRange = $ref(null);
  let showAll = $ref(false);
  const operationColumns = $ref([
    {
      title: 'ID',
      key: 'id',
    },
    {
      title: '出库日期',
      key: 'realOutDate',
    },
    {
      title: '仓库',
      key: 'inventory.name',
    },
    {
      title: 'Kunden',
      key: 'customer.customerName',
    },
    timeTableColumn('pickUpDateTime', '预计取货时间'),
    timeTableColumn('reservationGetProductTime', '预约送货时间'),
    statusColumnEasy({
      title: '状态',
      key: 'inStatus',
    }),
    {
      title: '详情',
      key: 'actions',
      render(row) {
        return h(
          NButton,
          {
            strong: true,
            tertiary: true,
            size: 'small',
            onClick: () => {
              currentIds = row.outboundDetailInfo;
              showDetailInfoDialog = true;
            },
          },
          { default: () => '查看' }
        );
      },
    },
    {
      title: 'Ref',
      key: 'ref',
    },
    {
      title: 'ISA',
      key: 'isa',
    },
    {
      title: 'AMZ-Sendungs ID',
      key: 'amzid',
    },
    {
      title: 'FC/送货地址',
      key: 'fcaddress',
    },
    {
      title: '物流方式',
      key: 'deliveryMethod',
    },
    {
      title: '邮编',
      key: 'postcode',
    },
    // statusColumnEasy({
    //   title: '订车状态',
    //   key: 'carStatus',
    // }),
    {
      title: '操作人',
      key: 'outOperatePerson',
    },
  ]);
  let currentHeader = $ref([]);
  let currentColumns = $ref([]);
  let showCurrentHeaderDataTable = $ref(false);
  const actionRef = ref();
  let filterObj: any | null = $ref(null);

  const realOptions = computed(() => {
    return generateOptionFromArray(columns.filter((it) => it.key).map((it) => it.title));
  });

  async function reloadHeader() {
    currentColumns = [];
    currentHeader = JSON.parse(
      (await getTableHeaderGroupItemList('operation'))?.headerItemJson ?? []
    );
    currentHeader.forEach((item) => {
      const res = operationColumns.find((it) => it.key === item.itemKey);
      currentColumns.push(res);
    });
    currentColumns = currentColumns.length > 0 ? currentColumns : operationColumns;
    currentColumns.forEach((item) => {
      item.resizable = true;
    });
    showCurrentHeaderDataTable = false;
  }
  const loadDataTable = async () => {
    let currentFilter = [];
    if (filterObj) {
      const res = Object.keys(filterObj);

      for (const filterItem of res) {
        currentFilter.push({
          field: filterItem,
          op: filterObj[filterItem] ? 'like' : '!=',
          value: '%' + filterObj[filterItem] + '%' ?? '',
        });
      }
    }
    let allList = await getOutboundForecastListByFilter(currentFilter);
    console.log(allList, 'list');
    currentList = allList.filter(
      (a) =>
        a.inStatus === CarStatus.Booked ||
        a.inStatus === '已装车' ||
        a.inStatus === CarStatus.NoNeed ||
        a.inStatus === '全部出库' ||
        a.inStatus === '已完成'
    );
    if (!showAll) {
      currentList = currentList.filter((a) => a.inStatus !== '已取消');
    }
    if (dateRange) {
      let startDate = dayjs(dateRange[0]).startOf('day').valueOf() ?? valueOfToday[0];
      let endDate = dayjs(dateRange[1]).endOf('day').valueOf() ?? valueOfToday[1];
      currentList = currentList.filter(
        (it) => it.createTimestamp > startDate && it.createTimestamp < endDate
      );
    }
    return currentList.sort(dateCompare('createTimestamp'));
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
    FileSaver.saveAs(blob, '出库看板' + '.csv');
  }
  let currentModel = $ref(null);
  function startEditOF(id) {
    editId = id;
    editOutboundForecast = true;
  }
  function startShareCar() {
    showShareCarModel = true;
  }
  function saved() {
    reloadTable();
  }

  async function selectedHeader() {
    showCurrentHeaderDataTable = true;
  }
  function reloadTable() {
    showModal.value = false;
    showShareCarModel = false;
    editOutboundForecast = false;
    showLoadingCarListDialog = false;
    showFeeDialog = false;
    actionRef.value.reload();
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
      dateRange = null;
    }
    reloadTable();
  }

  async function saveShareCar() {
    reloadTable();
    checkedRows = [];
  }

  onMounted(async () => {
    await reloadHeader();
    typeMission = '出库任务看板';
  });

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 120,
    render(record) {
      const fileAction = (label, key, icon?: Component, power) => {
        return getFileActionButtonByOutForecast(label, key, reloadTable, record, icon, power);
      };
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '上传装车单',
            highlight: () => {
              return record?.['loadingCarDoc']?.length > 0 ? 'success' : 'error';
            },
            async onClick() {
              const upload = useUploadDialog();
              const files = await upload.upload(record['loadingCarDoc']);
              if (files.checkPassed) {
                record.loadingCarDoc = files.files;
                await addOrUpdateWithRefOutboundForecast(record);
                // const obj = {};
                // obj['loadingCarDoc'] = files.files;
                // obj['inStatus'] = OutStatus.All;
                // obj['realOutDate'] = dayjs().format('YYYY-MM-DD');
                // await updateOutboundForecast(record.id, obj);
                // const userInfo = useUserStore().info;
                // const taskList = await getDetailListById(record.outboundDetailInfo);
                // for (const task of taskList) {
                //   let timeLineInfo = task.timeLine;
                //   timeLineInfo.unshift({
                //     operator: userInfo?.realName,
                //     detailTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                //     note: '已出库',
                //   });
                //   task.loadingCarDoc = files.files;
                //   task.inStatus = OutStatus.All;
                //   task.realOutDate = dayjs().format('YYYY-MM-DD');
                //   task.timeLine = timeLineInfo;
                //   await NotifyDetailManager.editInternal(task, task.id);
                // }
              }
              await actionRef.value.reload();
            },
            ifShow: () => {
              return hasAuthPower('outMissionUploadFile');
            },
          },
          {
            label: '装车',
            onClick() {
              currentInfo = record;
              currentId = record?.outboundDetailInfo;
              showLoadingCarListDialog = true;
            },
            ifShow: () => {
              return hasAuthPower('outMissionUpCar');
            },
          },
          {
            label: '生成装车单',
            onClick() {
              currentNotifyId = record.id!;
              showLoadingCarDoc = true;
            },
            ifShow: () => {
              return !record?.unloadingFile && hasAuthPower('outMissionCreatUpCarFile');
            },
          },
          fileAction('POD', 'PODFiles', '', 'orderCarPOD'),
          {
            label: 'CMR',
            highlight: () => {
              return record?.['cmrfiles']?.length > 0 ? 'success' : 'error';
            },
            async onClick() {
              const upload = useUploadDialog();
              const files = await upload.upload(record['cmrfiles']);
              if (files.checkPassed) {
                record.CMRFiles = files.files;
                record.inStatus = '已完成';
                await addOrUpdateWithRefOutboundForecast(record);
                const taskList = await getTaskListByOutboundId(record.id);
                for (const item of taskList) {
                  item.cmrfiles = files.files;
                  item.inStatus = '已完成';
                  await addOrUpdateTask(item);
                  const userInfo = useUserStore().info;
                  await addOrUpdateTaskTimeLine({
                    useType: 'normal',
                    bolitaTaskId: item.id,
                    operator: userInfo?.realName,
                    detailTime: dayjs().valueOf(),
                    note: '已装车，已完成',
                  });
                }
              }
              await actionRef.value.reload();
            },
            ifShow: () => {
              return hasAuthPower('outMissionUploadFile');
            },
          },
          {
            label: '结算',
            onClick() {
              currentInfo = record;
              showFeeDialog = true;
            },
            ifShow: () => {
              return hasAuthPower('outMissionSettle');
            },
          },
          {
            label: '信息已变更',
            highlight: () => {
              return 'error';
            },
            ifShow: () => {
              return record.alreadyChanged;
            },
          },
        ],
      });
    },
  });

  function addTable() {
    showModal.value = true;
  }
</script>

<style lang="less" scoped></style>
