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
            placeholder="过滤项1"
            style="width: 130px"
            v-model:value="optionOne"
            :options="realOptions"
          />
          <n-input
            class="ml-2"
            style="width: 130px"
            v-model:value="valueOne"
            type="text"
            placeholder="过滤值1"
          />
        </div>
      </n-card>
      <n-card class="ml-2" embedded size="small" style="max-width: 300px">
        <div style="display: flex">
          <n-select
            placeholder="过滤项2"
            style="width: 130px"
            v-model:value="optionTwo"
            :options="realOptions"
          />
          <n-input
            class="ml-2"
            style="width: 130px"
            v-model:value="valueTwo"
            type="text"
            placeholder="过滤值2"
          />
        </div>
      </n-card>
      <n-date-picker
        :default-value="[dayjs().valueOf(), dayjs().valueOf()]"
        class="ml-2"
        v-model:value="dateRange"
        type="daterange"
        clearable
      />
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
      title="装车单"
      style="width: 90%; min-width: 600px; max-width: 1000px"
    >
      <loading-car-doc @save="reloadTable" :notify-id="currentNotifyId!" />
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
    getFileActionButton,
    statusColumnEasy,
    timeTableColumn,
  } from '@/views/bolita-views/composable/useableColumns';
  import { $ref } from 'vue/macros';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { usePermission } from '@/hooks/web/usePermission';
  import { OutBoundDetailManager } from '@/api/dataLayer/modules/OutBoundPlan/outboundDetail';
  import NewCarpoolManagement from '@/views/newViews/CarpoolManagement/dialog/NewCarpoolManagement.vue';
  import {
    getOutboundForecast,
    updateOutboundForecast,
  } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';
  import { dateCompare, OneYearMonthTab } from '@/api/dataLayer/common/MonthDatePick';
  import dayjs from 'dayjs';
  import OutboundOrder from '@/views/newViews/OutboundForecast/OutboundOrder.vue';
  import { groupBy } from 'lodash';
  import {
    randomContainColorList,
    randomCustomerColorList,
  } from '@/api/dataLayer/common/ColorList';
  import EditOF from '@/views/newViews/OperationDetail/NotOutbound/EditOF.vue';
  import LoadingCarList from '@/views/newViews/OperationDetail/NotOutbound/LoadingCarList.vue';
  import OutBoundFeeDialog from '@/views/newViews/OperationDetail/NotOutbound/OutBoundFeeDialog.vue';
  import { NButton } from 'naive-ui';
  import { columns } from '@/views/newViews/Missions/AlreadyWarehousing/columns';
  import SelectedHeaderTable from '@/views/newViews/Missions/AlreadyWarehousing/SelectedHeaderTable.vue';
  import { getTableHeader } from '@/api/dataLayer/common/TableHeader';
  import DetailInfoDialog from '@/views/newViews/OperationDetail/NotOutbound/DetailInfoDialog.vue';
  import { CarStatus } from '@/views/newViews/OutboundPlan/columns';
  import { OutStatus } from '@/api/dataLayer/modules/notify/notify-api';
  import {
    getDetailListById,
    NotifyDetailManager,
  } from '@/api/dataLayer/modules/notify/notify-detail';
  import { useUploadDialog } from '@/store/modules/uploadFileState';
  import LoadingCarDoc from '@/views/newViews/OperationDetail/NotOutbound/LoadingCarDoc.vue';
  import { useUserStore } from '@/store/modules/user';
  import { hasAuthPower } from '@/api/dataLayer/common/power';
  import NoPowerPage from '@/views/newViews/Common/NoPowerPage.vue';
  import { valueOfToday } from '@/api/dataLayer/common/Date';
  import { generateOptionFromArray } from '@/store/utils/utils';

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
  let dateRange = $ref(valueOfToday);
  import FileSaver from 'file-saver';
  const operationColumns = $ref([
    {
      title: 'ID',
      key: 'id',
    },
    {
      title: '出库日期',
      key: 'realOutDate',
    },
    timeTableColumn('pickUpDateTime', '预计取货时间'),
    timeTableColumn('reservationGetProductTime', '预约送货时间'),
    {
      title: 'Halle',
      key: 'warehouseId',
    },
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
              console.log(row, 'row');
              currentIds = row.outboundDetailInfo;
              console.log(currentIds, 'currentIds');
              showDetailInfoDialog = true;
            },
          },
          { default: () => '查看' }
        );
      },
    },
    {
      title: 'Ref',
      key: 'REF',
    },
    {
      title: 'ISA',
      key: 'ISA',
    },
    {
      title: 'AMZ-Sendungs ID',
      key: 'AMZID',
    },
    {
      title: 'Kunden',
      key: 'customerId',
    },
    {
      title: 'FC/送货地址',
      key: 'FCAddress',
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
    currentHeader = await getTableHeader('operation');
    currentHeader.forEach((item) => {
      const res = operationColumns.find((it) => it.key === item.key);
      currentColumns.push(res);
    });
    currentColumns = currentColumns.length > 0 ? currentColumns : operationColumns;
    showCurrentHeaderDataTable = false;
  }
  const loadDataTable = async () => {
    let startDate = dayjs(dateRange[0]).startOf('day').valueOf() ?? valueOfToday[0];
    let endDate = dayjs(dateRange[1]).endOf('day').valueOf() ?? valueOfToday[1];
    let allList = await getOutboundForecast(filterObj);
    currentList = allList.filter(
      (a) =>
        a.inStatus === CarStatus.Booked ||
        a.inStatus === '已装车' ||
        a.inStatus === CarStatus.NoNeed ||
        a.inStatus === '全部出库'
    );
    return currentList
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
        '出库看板' +
        '.csv'
    );
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

  async function checkOutboundOrder(id) {
    const res = currentList.find((it) => it.id === id);
    currentData = res.outboundDetailInfo;
    const customerColor = groupBy(currentData, 'customerName');
    const containColor = groupBy(currentData, 'containerId');
    let customerIndex = 0;
    let containIndex = 0;
    for (const item in customerColor) {
      const customerColorIndex = customerIndex % randomCustomerColorList.length;
      customerColor[item].forEach(
        (x) => (x.customerColor = randomCustomerColorList[customerColorIndex])
      );
      customerIndex = customerIndex + 1;
    }
    for (const item in containColor) {
      const containColorIndex = containIndex % randomContainColorList.length;
      containColor[item].forEach(
        (x) => (x.containColor = randomContainColorList[containColorIndex])
      );
      containIndex = containIndex + 1;
    }
    currentDeliveryMethod = res.deliveryDetail;
    AMZID = res.AMZID;
    pickDate = dayjs(res.reservationGetProductTime).format('YYYY-MM-DD');
    FBACode = res.FBACode;
    RefCode = res.REF;
    showOutboundOrderDetail = true;
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

  async function saveShareCar() {
    reloadTable();
    checkedRows = [];
  }

  onMounted(async () => {
    await reloadHeader();
    monthTab = OneYearMonthTab();
    typeMission = '出库任务看板';
    selectedMonth = monthTab[0];
  });

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 120,
    render(record) {
      const fileAction = (label, key, icon?: Component, editable = false) => {
        return getFileActionButton(
          label,
          key,
          OutBoundDetailManager,
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
            label: '上传装车单',
            highlight: () => {
              return record?.['loadingCarDoc']?.length > 0 ? 'success' : 'error';
            },
            async onClick() {
              const upload = useUploadDialog();
              const files = await upload.upload(record['loadingCarDoc']);
              if (files.checkPassed) {
                const obj = {};
                obj['loadingCarDoc'] = files.files;
                obj['inStatus'] = OutStatus.All;
                obj['realOutDate'] = dayjs().format('YYYY-MM-DD');
                await updateOutboundForecast(record.id, obj);
                const userInfo = useUserStore().info;
                const taskList = await getDetailListById(record.outboundDetailInfo);
                for (const task of taskList) {
                  let timeLineInfo = task.timeLine;
                  timeLineInfo.unshift({
                    operator: userInfo?.realName,
                    detailTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                    note: '已出库',
                  });
                  task.loadingCarDoc = files.files;
                  task.inStatus = OutStatus.All;
                  task.realOutDate = dayjs().format('YYYY-MM-DD');
                  task.timeLine = timeLineInfo;
                  await NotifyDetailManager.editInternal(task, task.id);
                }
              }
              await actionRef.value[0].reload();
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
          {
            label: '修改',
            onClick() {
              startEditOF(record.id);
            },
            ifShow: () => {
              return hasAuthPower('outMissionEdit');
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
