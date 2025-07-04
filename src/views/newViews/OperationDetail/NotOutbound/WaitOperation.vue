<template>
  <n-card v-if="hasAuthPower('outMissionView')" :bordered="false" class="proCard">
    <filter-bar
      v-model="filterItems"
      v-model:dateRange="dateRange"
      v-model:showAll="showAll"
      :columns="operationColumns"
      @clear="updateFilter(null)"
      @submit="updateFilter"
      @filter-change="updateFilterWithItems"
    />
    <div class="mt-2">
      <n-button class="action-button" size="small" type="info" @click="selectedHeader">
        <template #icon>
          <n-icon>
            <TableSettings20Regular />
          </n-icon>
        </template>
        选择表头显示
      </n-button>
      <n-button class="action-button" size="small" type="success" @click="downloadData">
        <template #icon>
          <n-icon>
            <ArrowDownload20Regular />
          </n-icon>
        </template>
        下载
      </n-button>
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
  import {
    ArrowDownload20Regular,
    ArrowUpload20Regular,
    Box20Filled,
    DocumentAdd20Regular,
    DocumentEdit20Regular,
    Image20Regular,
    Payment20Regular,
    TableSettings20Regular,
  } from '@vicons/fluent';
  import { computed, h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import {
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
  import { NButton, NIcon, NTooltip } from 'naive-ui';
  import { generateOptionFromArray, toastSuccess } from '@/store/utils/utils';
  import SelectedHeaderTable from '@/views/newViews/Missions/AlreadyWarehousing/SelectedHeaderTable.vue';
  import DetailInfoDialog from '@/views/newViews/OperationDetail/NotOutbound/DetailInfoDialog.vue';
  import { CarStatus } from '@/views/newViews/OutboundPlan/columns';
  import LoadingCarDoc from '@/views/newViews/OperationDetail/NotOutbound/LoadingCarDoc.vue';
  import { hasAuthPower } from '@/api/dataLayer/common/power';
  import NoPowerPage from '@/views/newViews/Common/NoPowerPage.vue';
  import { valueOfToday } from '@/api/dataLayer/common/Date';
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
  import * as XLSX from 'xlsx';

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
  let filterItems = $ref([]);
  const operationColumns = $ref([
    {
      title: 'ID',
      key: 'id',
    },
    timeTableColumn('realOutDate', '出库日期'),
    // {
    //   title: '出库日期',
    //   key: 'realOutDate',
    // },
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
    return generateOptionFromArray(operationColumns.filter((it) => it.key).map((it) => it.title));
  });

  async function reloadHeader() {
    currentColumns = [];
    currentHeader = (await getTableHeaderGroupItemList('operation'))
      ? JSON.parse((await getTableHeaderGroupItemList('operation'))?.headerItemJson)
      : [];
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
    currentList = allList.filter(
      (a) =>
        a.inStatus === CarStatus.Booked ||
        a.inStatus === '已装车' ||
        a.inStatus === CarStatus.NoNeed ||
        a.inStatus === '全部出库' ||
        a.inStatus === '已完成'
    );
    if (dateRange) {
      let startDate = dayjs(dateRange[0]).startOf('day').valueOf() ?? valueOfToday[0];
      let endDate = dayjs(dateRange[1]).endOf('day').valueOf() ?? valueOfToday[1];
      currentList = currentList.filter(
        (it) => it.reservationGetProductTime > startDate && it.reservationGetProductTime < endDate
      );
    }
    console.log(
      currentList.filter((it) => it.realOutDate),
      '321'
    );
    return currentList.sort(dateCompare('createTimestamp'));
  };

  async function downloadData() {
    let selectedList = [];
    selectedList = await loadDataTable();
    let headerTitle = operationColumns
      .filter((it) => it.title && it.title !== '详情')
      .map((it) => it.title);
    let data = [];
    data.unshift(headerTitle);
    selectedList.forEach((it) => {
      const res = [
        it.id ?? '',
        it.realOutDate ?? '',
        it.inventory.name ?? '',
        it.customer.customerName ?? '',
        it.pickUpDateTime ? dayjs(parseFloat(it.pickUpDateTime)).format('YYYY-MM-DD') : '',
        it.reservationGetProductTime
          ? dayjs(parseFloat(it.reservationGetProductTime)).format('YYYY-MM-DD')
          : '',
        it.inStatus ?? '',
        it.ref ?? '',
        it.isa ?? '',
        it.amzid ?? '',
        it.fcaddress ?? '',
        it.deliveryMethod ?? '',
        it.postcode ?? '',
        it.outOperatePerson ?? '',
      ];
      data.push(res);
    });
    // 创建一个工作簿
    const workbook = XLSX.utils.book_new();
    // 将数据转换为工作表
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    // 将工作表添加到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // 生成Excel文件
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    // 保存文件
    FileSaver.saveAs(blob, '出库看板.xlsx');
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

  function updateFilterWithItems(value) {
    filterObj = value;
    reloadTable();
  }

  function updateFilter(value) {
    if (value !== null) {
      if (optionOne && valueOne) {
        const keyOne = operationColumns.find((it) => it.title === optionOne).key;

        value[keyOne] = valueOne;
      }
      if (optionTwo && valueTwo) {
        const keyTwo = operationColumns.find((it) => it.title === optionTwo).key;
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
      filterItems = [];
      showAll = false;
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
    width: 200,
    render(record) {
      // Custom file action with icon
      const iconFileAction = (label, key, icon, power) => {
        return {
          icon: renderIconWithTooltip(icon, label),
          onClick: async () => {
            try {
              const upload = useUploadDialog();
              const files = await upload.upload(record[key]);
              if (files.checkPassed) {
                record[key] = files.files;
                await addOrUpdateWithRefOutboundForecast(record);
                toastSuccess('上传成功');
                reloadTable();
              }
            } catch (error) {
              console.error('上传失败:', error);
            }
          },
          ifShow: () => {
            return hasAuthPower(power);
          },
        };
      };

      return h(TableAction as any, {
        style: 'text',
        actions: [
          {
            icon: renderIconWithTooltip(DocumentEdit20Regular, '修改'),
            onClick() {
              startEditOF(record.id);
            },
            ifShow: () => {
              return hasAuthPower('outMissionEdit');
            },
          },
          iconFileAction(
            '上传装车单',
            'loadingCarDoc',
            ArrowUpload20Regular,
            'outMissionUploadFile'
          ),
          {
            icon: renderIconWithTooltip(DocumentAdd20Regular, '生成装车单'),
            onClick() {
              currentNotifyId = record.id!;
              showLoadingCarDoc = true;
            },
            ifShow: () => {
              return !record?.unloadingFile && hasAuthPower('outMissionCreatUpCarFile');
            },
          },
          {
            icon: renderIconWithTooltip(Box20Filled, '装车'),
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
            icon: renderIconWithTooltip(Image20Regular, '装车照片'),
            highlight: () => {
              return record?.['cmrfiles']?.length > 0 ? 'success' : 'error';
            },
            async onClick() {
              const upload = useUploadDialog();
              const files = await upload.upload(record['cmrfiles']);
              if (files.checkPassed) {
                record.CMRFiles = files.files;
                record.inStatus = '已完成';
                record.realOutDate = dayjs().valueOf();
                await addOrUpdateWithRefOutboundForecast(record);
                const taskList = await getTaskListByOutboundId(record.id);
                for (const item of taskList) {
                  item.cmrfiles = files.files;
                  item.inStatus = '已完成';
                  item.deliveryTime = dayjs().valueOf();
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
            icon: renderIconWithTooltip(Payment20Regular, '结算'),
            onClick() {
              currentInfo = record;
              showFeeDialog = true;
            },
            ifShow: () => {
              return hasAuthPower('outMissionSettle');
            },
          },
          {
            icon: renderIconWithTooltip(Box20Filled, '信息已变更'),
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

  // Helper function to render icon with tooltip
  const renderIconWithTooltip = (icon, tooltip) => {
    return () =>
      h(
        NTooltip,
        { trigger: 'hover', placement: 'top' },
        {
          trigger: () => h(NIcon, { size: 18, class: 'action-icon' }, { default: () => h(icon) }),
          default: () => tooltip,
        }
      );
  };
</script>

<style lang="less" scoped>
  .action-button {
    margin-right: 8px;
  }

  /* Styles for action icons */
  :deep(.action-icon) {
    margin: 0 4px;
    cursor: pointer;
    transition: all 0.2s;
  }

  :deep(.n-icon) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :deep(.n-tooltip) {
    max-width: 200px;
    word-break: keep-all;
  }
</style>
