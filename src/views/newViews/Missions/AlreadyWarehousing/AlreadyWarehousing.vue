<template>
  <n-card :bordered="false" class="proCard">
    <div>
      <single-filter-bar
        :form-fields="filters"
        @clear="updateFilter(null)"
        @submit="updateFilter"
      />
      <div class="mt-2">
        <n-button class="action-button" size="small" type="default" @click="downloadData">
          下载
        </n-button>
        <n-button
          :disabled="selectedTaskList.length !== 1"
          class="action-button"
          size="small"
          @click="startEdit"
        >
          修改
        </n-button>
        <n-button
          :disabled="selectedTaskList.length !== 1"
          class="action-button"
          size="small"
          @click="showFiles"
        >
          附件
        </n-button>
        <n-button
          :disabled="selectedTaskList.length !== 1"
          class="action-button"
          size="small"
          @click="showTimeLine"
        >
          时间线
        </n-button>
        <n-button
          :disabled="selectedTaskList.length !== 1"
          class="action-button"
          size="small"
          @click="showCancel"
        >
          取消
        </n-button>
      </div>
      <BasicTable
        ref="actionRef"
        v-model:checked-row-keys="checkedRows"
        @update:checked-row-keys="handleCheck"
        :columns="columns"
        :pagination="paginationReactive"
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
        <out-plan-by-task :model="selectedTaskList" @saved="reloadTable" />
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
        <new-tray-dialog :current-data="currentModel" @saved="reloadTable" />
      </n-modal>
      <n-modal
        v-model:show="showCurrentHeaderDataTable"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 800px; max-width: 800px"
        title="添加表头"
      >
        <selected-header-table :all-columns="columns" :type="'taskList'" @saved="reloadHeader" />
      </n-modal>
      <n-modal
        v-model:show="timeLineDialog"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 800px; max-width: 800px"
        title="时间线"
      >
        <time-line :info="currentInfo" />
      </n-modal>
      <n-modal
        v-model:show="showOfferPrice"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 800px; max-width: 800px"
        title="报价表"
      >
        <offer-price-dialog :ids="checkedRows" @saved="reloadTable" />
      </n-modal>
      <n-modal
        v-model:show="showMergeDialog"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 1000px; max-width: 1000px"
        title="合并"
      >
        <merge-dialog :info="selectedTaskList" @saved="reloadTable" />
      </n-modal>
      <n-modal
        v-model:show="showCheckDialog"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 600px; max-width: 600px"
        title="请确认"
      >
        <loading-frame :loading="checkLoading" :title="log" />
      </n-modal>
      <n-modal
        v-model:show="showSplitTaskDialog"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 600px; max-width: 600px"
        title="拆分"
      >
        <split-task-dialog :info="currentModel" @saved="reloadTable" />
      </n-modal>
      <n-modal
        v-model:show="showCancelDialog"
        :show-icon="false"
        class="modal-small"
        preset="card"
        style="width: 600px"
        title="请确认"
      >
        <confirm-dialog :title="'确认取消任务？'" @saved="cancelTask" />
      </n-modal>
      <n-modal
        v-model:show="showFeeDialog"
        :show-icon="false"
        class="modal-medium"
        preset="dialog"
        title="费用表"
      >
        <task-price-dialog :info="currentData" @save="reloadTable" />
      </n-modal>
      <n-modal
        v-model:show="showFilesDialog"
        :show-icon="false"
        class="modal-medium"
        preset="dialog"
        title="查看附件"
        style="width: 800px"
      >
        <task-files @cancel="showFilesDialog = false" :info="currentInfo" @save="reloadTable" />
      </n-modal>
    </div>
  </n-card>
</template>

<script lang="ts" setup>
  import { onMounted, reactive, ref } from 'vue';
  import { BasicTable } from '@/components/Table';
  import {
    allCarStatusList,
    allDeliveryMethod,
    allInStatusList,
    allOutboundMethod,
  } from './columns';
  import { $ref } from 'vue/macros';
  import {
    statusColumnSelect,
    statusColumnSelectByTask,
    timeColumn,
  } from '@/views/bolita-views/composable/useableColumns';
  import dayjs from 'dayjs';
  import EditMissionDetail from '@/views/newViews/Missions/AlreadyWarehousing/EditMissionDetail.vue';
  import NewTotalFee from '@/views/newViews/SettlementManage/NewTotalFee.vue';
  import NewTrayDialog from '@/views/newViews/Missions/AlreadyWarehousing/NewTrayDialog.vue';
  import SelectedHeaderTable from '@/views/newViews/Missions/AlreadyWarehousing/SelectedHeaderTable.vue';
  import TimeLine from '@/views/newViews/Missions/AlreadyWarehousing/TimeLine.vue';
  import { useUserStore } from '@/store/modules/user';
  import OfferPriceDialog from '@/views/newViews/Missions/AlreadyWarehousing/OfferPriceDialog.vue';
  import { getUserCustomerList } from '@/api/dataLayer/common/power';
  import { asyncCustomer, generateOptionFromArray } from '@/store/utils/utils';
  import FileSaver from 'file-saver';
  import {
    addOrUpdateTask,
    getTaskListByFilter,
    getTaskListByFilterWithPagination,
  } from '@/api/newDataLayer/TaskList/TaskList';
  import { addOrUpdateTaskTimeLine } from '@/api/newDataLayer/TimeLine/TimeLine';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import SplitTaskDialog from '@/views/newViews/Missions/AlreadyWarehousing/SplitTaskDialog.vue';
  import { NButton, useDialog, useMessage } from 'naive-ui';
  import * as XLSX from 'xlsx';
  import { allInStatusNotifyList } from '@/api/dataLayer/common/common';
  import ConfirmDialog from '@/views/newViews/Common/ConfirmDialog.vue';
  import {
    addOrUpdateWithRefOutboundForecast,
    getOutboundForecastById,
  } from '@/api/newDataLayer/OutboundForecast/OutboundForecast';
  import MergeDialog from '@/views/newViews/Missions/AlreadyWarehousing/MergeDialog.vue';
  import TaskPriceDialog from '@/views/newViews/Missions/AlreadyWarehousing/TaskPriceDialog.vue';
  import SingleFilterBar from '@/views/bolita-views/composable/SingleFilterBar.vue';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import { createPaginationPlaceholders } from '@/api/newDataLayer/Common/Common';
  import TaskFiles from '@/views/newViews/Missions/AlreadyWarehousing/TaskFiles.vue';
  import OutPlanByTask from '@/views/newViews/CarpoolManagement/OutPlanByTask.vue';

  const showModal = ref(false);
  let editDetailModel = ref(false);
  let filterObj: any | null = $ref(null);
  let addNewFeeDialog = $ref(false);
  let checkedRows = $ref([]);
  let currentModel: any | null = $ref(null);
  let currentData: any | null = $ref('');
  let allList: any | null = $ref([]);
  let addNewTrayDialog = $ref(false);
  let showCurrentHeaderDataTable = $ref(false);
  let currentInfo = $ref('');
  let timeLineDialog = $ref(false);
  let showOfferPrice = $ref(false);
  let showMergeDialog = $ref(false);
  let checkLoading = $ref(false);
  let showCheckDialog = $ref(false);
  let log = $ref('');
  let showSplitTaskDialog = $ref(false);
  let showFilesDialog = $ref(false);
  const dialog = useDialog();
  const filters: FormField[] = [
    asyncCustomer(),
    {
      label: '柜号',
      field: 'containerId',
    },
    {
      label: '票号',
      field: 'ticketId',
    },
    {
      label: 'ref',
      field: 'ref',
    },
    {
      label: '状态',
      field: 'inStatus',
      component: 'NSelect',
      componentProps: {
        options: generateOptionFromArray(allInStatusNotifyList),
      },
    },
    {
      label: '显示拆分',
      field: 'showAll',
      component: 'NCheckbox',
    },
  ];
  const columns = [
    {
      type: 'selection',
      fixed: 'left',
      width: 50,
    },
    {
      title: '客户',
      fixed: 'left',
      key: 'customer.customerName',
      width: 100,
    },
    {
      title: '柜号',
      fixed: 'left',
      key: 'containerId',
      width: 160,
    },
    {
      title: '票号',
      fixed: 'left',
      key: 'ticketId',
      width: 120,
    },
    {
      title: 'Ref',
      key: 'outboundForecast.ref',
      width: 120,
    },
    {
      title: '价格',
      key: 'suggestedPrice',
      width: 120,
    },
    {
      title: '滞留时间',
      key: 'storageTime',
      width: 100,
    },
    statusColumnSelect({
      title: '状态',
      key: 'inStatus',
      list: generateOptionFromArray(allInStatusList),
    }),
    statusColumnSelectByTask({
      title: '订车',
      key: 'outboundForecast.inStatus',
      list: generateOptionFromArray(allCarStatusList),
    }),
    {
      title: '总实重',
      key: 'weight',
    },
    {
      title: '总体积',
      key: 'volume',
    },
    {
      title: '尺寸',
      key: 'size',
    },
    {
      title: '包装',
      key: 'packing',
    },
    {
      title: '客户备注',
      key: 'normalNote',
      width: 96,
    },
    {
      title: 'FBA单号',
      key: 'fbaDeliveryCode',
      width: 100,
    },
    {
      title: '国家',
      key: 'country',
      width: 60,
    },
    {
      title: '邮编',
      key: 'postcode',
    },
    {
      title: 'FC',
      key: 'fcAddress',
    },
    {
      title: '送货地址',
      key: 'address',
      width: 100,
    },
    {
      title: '出库方式',
      key: 'outboundMethod',
      component: 'NSelect',
      componentProps: {
        options: generateOptionFromArray(allOutboundMethod),
      },
      width: 100,
    },
    {
      title: '物流渠道',
      key: 'deliveryMethod',
      component: 'NSelect',
      componentProps: {
        options: generateOptionFromArray(allDeliveryMethod),
      },
      width: 100,
    },
    {
      title: '库内操作',
      key: 'operateInStorage',
      width: 96,
    },
    {
      title: '换单',
      key: 'changeOrderFiles',
      component: 'NSelect',
      componentProps: {
        options: [
          { label: '是', value: '是' },
          { label: '否', value: '否' },
        ],
      },
    },
    {
      title: '尾板',
      key: 'tailgate',
      component: 'NSelect',
      componentProps: {
        options: [
          { label: '是', value: '是' },
          { label: '否', value: '否' },
        ],
      },
    },
    {
      title: '仓库',
      key: 'inventory.name',
      width: 100,
    },
    {
      title: '预报/实际件数',
      key: 'numberDisplay',
      width: 120,
    },
    {
      title: '预报/实际托数',
      key: 'trayDisplay',
      width: 120,
    },
    timeColumn('planArriveDateTime', '预期到仓日期'),
    timeColumn('arriveTime', '实际到仓日期'),
    {
      title: '实际发货时间',
      key: 'outboundForecast.outDate',
      width: 100,
    },
    {
      title: '出库件数',
      key: 'outContainerNum',
      width: 100,
    },
    {
      title: '出库托数',
      key: 'outTrayNum',
      width: 100,
    },
    {
      title: 'po',
      key: 'outboundForecast.po',
    },
    {
      title: '运单号',
      key: 'outboundForecast.waybillId',
    },
  ].map((it) => {
    it.ellipsis = {
      tooltip: true,
    };
    return it;
  });

  const actionRef = ref();
  const props = defineProps<Prop>();

  interface Prop {
    belongsToId?: string;
  }
  let selectedTaskList = $ref([]);
  let allTaskList = $ref([]);

  function showTimeLine() {
    currentInfo = selectedTaskList[0];
    timeLineDialog = true;
  }

  function showFiles() {
    currentInfo = selectedTaskList[0];
    showFilesDialog = true;
  }

  async function handleCheck(rowKeys) {
    checkedRows = rowKeys;
    const currentPageSelected = allTaskList.filter((item) => rowKeys.includes(item.id));
    // 合并到全局选中集合
    selectedTaskList = [
      ...selectedTaskList.filter(
        (item) => !allTaskList.some((pageItem) => pageItem.id === item.id)
      ),
      ...currentPageSelected,
    ];
  }

  let showCancelDialog = $ref(false);
  async function cancelTask() {
    currentInfo.inStatus = '已取消';
    await addOrUpdateTask(currentInfo);
    const userInfo = useUserStore().info;
    await addOrUpdateTaskTimeLine({
      useType: 'normal',
      bolitaTaskId: currentInfo.id,
      operator: userInfo?.realName,
      detailTime: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      note: '取消当前任务！',
    });
    if (currentInfo.outboundId) {
      const outboundInfo = await getOutboundForecastById(currentInfo.outboundId);
      outboundInfo.inStatus = '等待审核';
      await addOrUpdateWithRefOutboundForecast(outboundInfo);
    }
    showCancelDialog = false;
  }

  async function startEdit() {
    currentModel = selectedTaskList[0];
    currentModel.customerName = currentModel.customer.customerName;
    editDetailModel.value = true;
  }

  function showCancel() {
    currentInfo = selectedTaskList[0];
    showCancelDialog = true;
  }

  const message = useMessage();

  async function getAllTaskListByFilter() {
    await getCurrentFilter();

    // Get paginated data
    return await getTaskListByFilter(currentFilter);
  }

  async function downloadData() {
    let selectedList = [];
    selectedList = await getAllTaskListByFilter();
    // Create a 2D array for Excel data
    const data = [];
    const headers = columns.filter((it) => it.title).map((it) => it.title);
    data.push(headers);

    // Add data rows
    selectedList.forEach((item) => {
      const row = [];
      columns
        .filter((col) => col.title)
        .forEach((col) => {
          // Handle nested properties like 'customer.customerName'
          if (col.key && col.key.includes('.')) {
            const keys = col.key.split('.');
            let value = item;
            for (const key of keys) {
              value = value && value[key];
            }
            row.push(value || '');
          } else if (col.key) {
            // Handle date fields
            if (col.key === 'planArriveDateTime' && item[col.key]) {
              row.push(dayjs(item[col.key]).format('YYYY-MM-DD'));
            } else if (col.key === 'arriveTime' && item[col.key]) {
              row.push(dayjs(item[col.key]).format('YYYY-MM-DD'));
            } else if (col.key === 'deliveryTime' && item[col.key]) {
              row.push(dayjs(item[col.key]).format('YYYY-MM-DD'));
            } else if (col.key === 'outBoundTime' && item[col.key]) {
              row.push(dayjs(item[col.key]).format('YYYY-MM-DD HH:mm:ss'));
            } else if (col.key === 'currentDate' && item[col.key]) {
              row.push(dayjs(item[col.key][0]).format('YYYY-MM-DD'));
            } else {
              row.push(item[col.key] || '');
            }
          } else {
            row.push('');
          }
        });

      // Only add non-empty rows to the data array
      // Check if the row has at least one non-empty value
      const hasValue = row.some((value) => value !== '' && value !== null && value !== undefined);
      if (hasValue) {
        data.push(row);
      }
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
    FileSaver.saveAs(blob, '任务明细.xlsx');
  }

  const paginationReactive = reactive({
    defaultPage: 1,
    pageNumber: 0,
    pageSize: 10,
    defaultPageSize: 10,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    onChange: (page: number) => {
      paginationReactive.pageNumber = page - 1;
      reloadTable();
    },
    onUpdatePageSize: (pageSize: number) => {
      paginationReactive.pageSize = pageSize;
      paginationReactive.pageNumber = 0;
      reloadTable();
    },
  });
  let currentFilter = $ref([]);

  async function getCurrentFilter() {
    currentFilter = [];
    if (filterObj) {
      currentFilter = filterObj;
      const customerId = await getUserCustomerList();
      if (!filterObj['customer.id']) {
        currentFilter['customerIds'] = customerId;
      } else {
        currentFilter['customerIds'] = [filterObj['customer.id']];
      }
      delete currentFilter['customer.id'];
      if (filterObj['inStatus']) {
        currentFilter['inStatusIn'] = [filterObj['inStatus']];
        delete currentFilter.inStatus;
      } else {
        if (filterObj['showAll']) {
          currentFilter['inStatusIn'] = ['已拆分'];
        }
        currentFilter['inStatusNotIn'] = ['已拆分', '已取消'];
        delete currentFilter.inStatus;
      }
      if (currentFilter['containerId']) {
        currentFilter['containerIdLike'] = currentFilter['containerId'];
        delete currentFilter.containerId;
      }
      if (currentFilter['ticketId']) {
        const ticketIds = currentFilter['ticketId'].split(',');
        if (ticketIds.length > 1) {
          currentFilter['ticketIdIn'] = ticketIds;
        } else {
          currentFilter['ticketIdLike'] = currentFilter['ticketId'];
        }
        delete currentFilter.ticketId;
      }
    } else {
      currentFilter['inStatusNotIn'] = ['已拆分', '已取消'];
    }
  }

  const loadDataTable = async () => {
    await getCurrentFilter();
    const res = await getTaskListByFilterWithPagination(currentFilter, paginationReactive);
    allList = res.rows.map((it) => {
      it.numberDisplay = it.number + '/' + it.arrivedContainerNum;
      it.trayDisplay = it.trayNum + '/' + it.arrivedTrayNum;
      return it;
    });
    const totalCount = res.totalRowCount;
    // Create pagination placeholders
    const { fakeListStart, fakeListEnd } = createPaginationPlaceholders(
      paginationReactive.pageNumber,
      paginationReactive.pageSize,
      totalCount
    );
    allList.forEach((it) => {
      if (it.trayItems.length > 0) {
        it.trayDisplay = it.trayItems.map(
          (a) => a.trayType + '(' + a.size + ')' + '*' + a.amount + ' / '
        );
      }
      // todo 滞留时间
      if (it.outboundForecast?.outDate || !it.arriveTime) {
        it.storageTime = '/';
      } else {
        it.storageTime = dayjs().diff(dayjs(it.arriveTime), 'hour') ?? '/';
      }
    });
    allTaskList = [...fakeListStart, ...allList, ...fakeListEnd];
    return allTaskList;
  };

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  function reloadHeader() {
    reloadTable();
  }

  let showFeeDialog = $ref(false);

  async function reloadTable() {
    showModal.value = false;
    editDetailModel.value = false;
    addNewFeeDialog = false;
    addNewTrayDialog = false;
    showCurrentHeaderDataTable = false;
    showOfferPrice = false;
    checkLoading = false;
    showCheckDialog = false;
    showSplitTaskDialog = false;
    checkedRows = [];
    selectedTaskList = [];
    showMergeDialog = false;
    await actionRef.value.reload();
  }

  onMounted(async () => {
    await reloadTable();
  });
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
