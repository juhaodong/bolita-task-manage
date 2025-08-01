<template>
  <n-card :bordered="false" class="proCard">
    <div>
      <filter-bar
        v-model="filterItems"
        :columns="columns"
        @clear="updateFilter(null)"
        @submit="updateFilter"
        @filter-change="updateFilterWithItems"
      />
      <div class="mt-2">
        <n-button class="action-button" size="small" type="info" @click="selectedHeader">
          <template #icon>
            <n-icon>
              <DocumentEdit20Regular />
            </n-icon>
          </template>
          选择表头显示
        </n-button>
        <n-button
          v-if="typeMission === '整柜任务看板' && hasAuthPower('missionOutboundAdd')"
          class="action-button"
          size="small"
          type="success"
          @click="addTable"
        >
          <template #icon>
            <n-icon>
              <Box20Filled />
            </n-icon>
          </template>
          新建出库计划
        </n-button>
        <n-button
          v-if="typeMission === '审核看板' && hasAuthPower('missionCheck')"
          class="action-button"
          size="small"
          type="primary"
          @click="checkDetailInfo"
        >
          <template #icon>
            <n-icon>
              <DocumentEdit20Regular />
            </n-icon>
          </template>
          审核
        </n-button>
        <n-button
          v-if="typeMission === '报价看板' && hasAuthPower('missionPriceOffer')"
          class="action-button"
          size="small"
          type="warning"
          @click="showOfferPrice = true"
        >
          <template #icon>
            <n-icon>
              <Payment20Regular />
            </n-icon>
          </template>
          报价
        </n-button>
        <n-button class="action-button" size="small" type="default" @click="downloadData">
          <template #icon>
            <n-icon>
              <ArrowDownload20Regular />
            </n-icon>
          </template>
          下载
        </n-button>
        <n-button class="action-button" size="small" type="error" @click="merge">
          <template #icon>
            <n-icon>
              <DocumentEdit20Regular />
            </n-icon>
          </template>
          合并
        </n-button>
      </div>

      <n-tabs
        v-model:value="typeMission"
        animated
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
          <div v-if="hasPagePower">
            <BasicTable
              ref="actionRef"
              v-model:checked-row-keys="checkedRows"
              :actionColumn="actionColumn"
              :columns="currentColumns"
              :pagination="paginationReactive"
              :request="loadDataTable"
              :row-key="(row) => row.id"
            />
          </div>
          <no-power-page v-else />
        </n-tab-pane>
      </n-tabs>
      <n-modal
        v-model:show="showModal"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 600px; max-width: 1200px"
        title="出库计划"
      >
        <new-outbound-plan :model="checkedRows" @saved="reloadTable" />
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
        <selected-header-table :all-columns="columns" :type="'taskList'" @saved="reloadHeader" />
      </n-modal>
      <n-modal
        v-model:show="showTimeLine"
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
        v-model:show="mergeDialog"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 1000px; max-width: 1000px"
        title="合并"
      >
        <merge-dialog @save="reloadTable" />
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
        v-model:show="splitTaskDialog"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 600px; max-width: 600px"
        title="拆分"
      >
        <split-task-dialog :info="currentInfo" @saved="reloadTable" />
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
    </div>
  </n-card>
</template>

<script lang="ts" setup>
  import { computed, h, onMounted, reactive, ref, watch } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { allDeliveryMethod, allInStatusList, allOutboundMethod } from './columns';
  import { $ref } from 'vue/macros';
  import {
    statusColumnEasy,
    statusColumnSelect,
    storageTimeWarnColumn,
    timeColumn,
    timeWarnColumn,
    timeWarnList,
  } from '@/views/bolita-views/composable/useableColumns';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { InBoundDetailStatus, InBoundStatus } from '@/api/dataLayer/modules/notify/notify-api';
  import {
    ArrowDownload20Regular,
    Box20Filled,
    Clock20Regular,
    Delete20Regular,
    Document20Regular,
    DocumentEdit20Regular,
    DrawImage20Regular,
    Image20Regular,
    Payment20Regular,
    Tag20Regular,
    Warning20Regular,
    SplitVertical20Regular,
  } from '@vicons/fluent';
  import NewOutboundPlan from '@/views/newViews/OutboundPlan/NewOutboundPlan.vue';
  import dayjs from 'dayjs';
  import EditMissionDetail from '@/views/newViews/Missions/AlreadyWarehousing/EditMissionDetail.vue';
  import NewTotalFee from '@/views/newViews/SettlementManage/NewTotalFee.vue';
  import { useUploadDialog } from '@/store/modules/uploadFileState';
  import NewTrayDialog from '@/views/newViews/Missions/AlreadyWarehousing/NewTrayDialog.vue';
  import SelectedHeaderTable from '@/views/newViews/Missions/AlreadyWarehousing/SelectedHeaderTable.vue';
  import TimeLine from '@/views/newViews/Missions/AlreadyWarehousing/TimeLine.vue';
  import { useUserStore } from '@/store/modules/user';
  import {
    checkedObj,
    offerObj,
    planObj,
  } from '@/views/newViews/Missions/AlreadyWarehousing/selectionType';
  import OfferPriceDialog from '@/views/newViews/Missions/AlreadyWarehousing/OfferPriceDialog.vue';
  import { getUserCustomerList, hasAuthPower } from '@/api/dataLayer/common/power';
  import NoPowerPage from '@/views/newViews/Common/NoPowerPage.vue';
  import { generateOptionFromArray } from '@/store/utils/utils';
  import FileSaver from 'file-saver';
  import MergeDialog from '@/views/newViews/Missions/AlreadyWarehousing/MergeDialog.vue';
  import {
    addOrUpdateTask,
    getTaskListByFilterWithPagination,
    getTaskListById,
  } from '@/api/newDataLayer/TaskList/TaskList';
  import { getTableHeaderGroupItemList } from '@/api/newDataLayer/Header/HeaderGroup';
  import { addOrUpdateTaskTimeLine } from '@/api/newDataLayer/TimeLine/TimeLine';
  import { addOrUpdateNotify, getNotifyById } from '@/api/newDataLayer/Notify/Notify';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import SplitTaskDialog from '@/views/newViews/Missions/AlreadyWarehousing/SplitTaskDialog.vue';
  import { NButton, NIcon, NInput, NTooltip, useDialog } from 'naive-ui';
  import * as XLSX from 'xlsx';
  import { asyncCustomerByFilter, asyncStorageByFilter } from '@/api/dataLayer/common/common';
  import ConfirmDialog from '@/views/newViews/Common/ConfirmDialog.vue';
  import {
    addOrUpdateOutboundForecast,
    addOrUpdateWithRefOutboundForecast,
    getOutboundForecastById,
  } from '@/api/newDataLayer/OutboundForecast/OutboundForecast';

  const showModal = ref(false);
  let editDetailModel = ref(false);
  let filterItems: any | null = $ref(null);
  let filterObj: any | null = $ref(null);
  let addNewFeeDialog = $ref(false);
  let checkedRows = $ref([]);
  let currentModel: any | null = $ref(null);
  let typeTab = $ref(['整柜任务看板', '审核看板', '存仓看板']);
  let typeMission = ref('');
  let currentData: any | null = $ref('');
  let recordData: any | null = $ref('');
  let allList: any | null = $ref([]);
  let addNewTrayDialog = $ref(false);
  let showCurrentHeaderDataTable = $ref(false);
  let currentHeader = $ref([]);
  let currentColumns = $ref([]);
  let currentInfo = $ref('');
  let showTimeLine = $ref(false);
  let currentWithOutSelection = $ref([]);
  let showOfferPrice = $ref(false);
  let mergeDialog = $ref(false);
  let checkLoading = $ref(false);
  let showCheckDialog = $ref(false);
  let log = $ref('');
  let splitTaskDialog = $ref(false);
  const dialog = useDialog();
  const columns = [
    {
      type: 'selection',
      disabled: (row) => row.inStatus !== InBoundDetailStatus.WaitCheck,
    },
    asyncCustomerByFilter(),
    {
      title: '时效',
      fixed: 'left',
      key: 'usefulTimeRange',
      component: 'NSelect',
      componentProps: {
        options: timeWarnList,
      },
    },
    {
      title: '柜号',
      fixed: 'left',
      key: 'containerId',
    },
    {
      title: '票号',
      fixed: 'left',
      key: 'ticketId',
    },
    {
      title: '国家',
      key: 'country',
    },
    {
      title: '预报件数',
      key: 'number',
    },
    {
      title: '实际件数',
      key: 'arrivedContainerNum',
    },
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
    statusColumnSelect({
      title: '状态',
      key: 'inStatus',
      list: generateOptionFromArray(allInStatusList),
    }),
    asyncStorageByFilter(),
    storageTimeWarnColumn('stayTime', '留仓时间'),
    {
      title: '运单号',
      key: 'deliveryIdIn',
    },
    {
      title: '客户备注',
      key: 'normalNote',
    },
    {
      title: 'FBA单号',
      key: 'FBADeliveryCode',
    },
    {
      title: '出库方式',
      key: 'outboundMethod',
      component: 'NSelect',
      componentProps: {
        options: generateOptionFromArray(allOutboundMethod),
      },
    },
    {
      title: '物流渠道',
      key: 'deliveryMethod',
      component: 'NSelect',
      componentProps: {
        options: generateOptionFromArray(allDeliveryMethod),
      },
    },
    {
      title: '操作要求',
      key: 'operationRequire',
    },
    {
      title: '操作备注',
      key: 'operationNote',
    },
    statusColumnEasy({
      title: '结算状态',
      key: 'finalStatus',
    }),
    {
      title: 'PO',
      key: 'PO',
    },
    {
      title: 'FC/送货地址',
      key: 'fcaddress',
    },
    {
      title: '邮编',
      key: 'postcode',
    },
    statusColumnEasy({
      title: '审核状态',
      key: 'inBoundDetailStatus',
    }),
    {
      title: '换单文件',
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
      title: '送货备注',
      key: 'transportationNote',
    },
    {
      title: '预报托数',
      key: 'trayNum',
    },
    {
      title: '托盘规格',
      key: 'trayDisplay',
    },
    {
      title: '实际托数',
      key: 'arrivedTrayNum',
    },
    timeColumn('planArriveDateTime', '预期到仓日期'),
    timeColumn('arriveTime', '实际到仓日期'),
    timeColumn('deliveryTime', '发货时间'),
    timeColumn('outBoundTime', '预计取货时间'),
    {
      title: 'Ref',
      key: 'ref',
    },
    // {
    //   title: '仓库备注',
    //   key: 'note',
    // },
    {
      title: '仓库备注',
      key: 'note',
      render(row) {
        return h(
          NButton,
          {
            text: true,
            onClick: () => {
              dialog.create({
                title: '请输入仓库备注',
                content: () =>
                  h(NInput, {
                    value: row.note,
                    onUpdateValue: (value) => {
                      row.note = value;
                    },
                    placeholder: '请输入备注',
                  }),
                positiveText: '确定',
                negativeText: '取消',
                onPositiveClick: async () => {
                  await addOrUpdateTask(row);
                },
                onNegativeClick: () => {},
              });
            },
          },
          { default: () => (row.note ? row.note : '暂无备注') }
        );
      },
    },
    {
      title: '库位',
      key: 'warehouseLocation',
    },
    {
      title: '分拣标识',
      key: 'sign',
    },
    {
      title: '包装',
      key: 'package',
    },
    {
      title: '托数',
      key: 'industrialTrayNum',
    },
    {
      title: '品名',
      key: 'productName',
    },
    {
      title: 'UN号',
      key: 'UNNumber',
    },
    {
      title: '收件人',
      key: 'recipient',
    },
    {
      title: '电话',
      key: 'phone',
    },
    {
      title: '邮箱',
      key: 'email',
    },
    {
      title: '是否需要预约',
      key: 'needReserve',
    },
    {
      title: '工业品备注',
      key: 'industrialNote',
    },
  ].map((it) => {
    it.width = 200;
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

  const realOptions = computed(() => {
    return generateOptionFromArray(columns.filter((it) => it.key).map((it) => it.title));
  });

  const hasPagePower = computed(() => {
    if (typeMission.value === '整柜任务看板') {
      return hasAuthPower('missionAllView');
    } else if (typeMission.value === '审核看板') {
      return hasAuthPower('missionCheckView');
    } else if (typeMission.value === '报价看板') {
      return hasAuthPower('missionOfferView');
    } else if (typeMission.value === '存仓看板') {
      return hasAuthPower('missionStorageView');
    }
  });

  let showCancelDialog = $ref(false);
  async function cancelTask() {
    currentInfo.inStatus = '已取消';
    await addOrUpdateTask(currentInfo);
    const userInfo = useUserStore().info;
    await addOrUpdateTaskTimeLine({
      useType: 'normal',
      bolitaTaskId: currentInfo.id,
      operator: userInfo?.realName,
      detailTime: dayjs().valueOf(),
      note: '取消当前任务！',
    });
    if (currentInfo.outboundId) {
      const outboundInfo = await getOutboundForecastById(currentInfo.outboundId);
      outboundInfo.inStatus = '等待审核';
      await addOrUpdateWithRefOutboundForecast(outboundInfo);
    }
    showCancelDialog = false;
  }

  async function startEdit(id) {
    currentModel = await getTaskListById(id);
    currentModel.customerId = currentModel.customer.id;
    currentModel.inventoryId = currentModel.inventory.id;
    editDetailModel.value = true;
  }

  async function selectedHeader() {
    showCurrentHeaderDataTable = true;
  }

  async function startAddTray(id) {
    addNewTrayDialog = true;
  }

  function addTable() {
    showModal.value = true;
  }

  function merge() {
    mergeDialog = true;
  }

  function updateFilterWithItems(value) {
    filterObj = value;
    reloadTable();
  }

  async function downloadData() {
    let selectedList = [];
    selectedList = await loadDataTable();
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

  async function checkDetailInfo() {
    checkLoading = true;
    showCheckDialog = true;
    let i = 0;
    for (const rows of checkedRows) {
      i = i + 1;
      log = '正在审核' + '第' + i + '票货物,共' + checkedRows.length + '票' + `<br>`;
      const res = allList.find((it) => it.id === rows);
      if (res) {
        res.inStatus = InBoundStatus.Wait;
        const userInfo = useUserStore().info;
        await addOrUpdateTaskTimeLine({
          useType: 'normal',
          bolitaTaskId: res.id,
          operator: userInfo?.realName,
          detailTime: dayjs().valueOf(),
          note: '进行了审核',
        });
        res.customerId = res.customer.id;
        res.inventoryId = res.inventory.id;
        await addOrUpdateTask(res);
        const containerForecastInfo = await getNotifyById(res.notifyId);
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
            containerForecastInfo.customerId = containerForecastInfo.customer.id;
            containerForecastInfo.inventoryId = containerForecastInfo.inventory.id;
            await addOrUpdateNotify(containerForecastInfo);
          }
        }
      }
    }
    checkedRows = [];
    await reloadTable();
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

  const loadDataTable = async () => {
    let currentFilter = [];
    if (filterObj) {
      const otherFilter = filterObj.filter((it) => it?.key !== 'usefulTimeRange');
      const filterOne = otherFilter.filter((it) => it?.component?.name !== 'DatePicker');
      const filterTwo = otherFilter.filter((it) => it?.component?.name === 'DatePicker');
      const filterWithOutDate = filterOne
        ? Object.keys(filterOne).map((filterItem) => ({
            field: filterOne[filterItem].key,
            op: filterOne[filterItem].value ? 'like' : '!=',
            value: `%${filterOne[filterItem].value || ''}%`,
          }))
        : [];
      const filterWithDate = filterTwo
        ? Object.keys(filterTwo).map((filterItem) => ({
            field: filterTwo[filterItem].key,
            op: 'between',
            value: filterTwo[filterItem].value,
          }))
        : [];
      currentFilter = filterWithOutDate.concat(filterWithDate);
      const usefulTimeFilter = filterObj.find((it) => it?.key === 'usefulTimeRange');
      if (usefulTimeFilter) {
        if (usefulTimeFilter.value === '红色') {
          currentFilter.push({
            field: 'usefulTimeRange',
            op: '>=',
            value: 15,
          });
        } else if (usefulTimeFilter.value === '黄色') {
          currentFilter.push({
            field: 'usefulTimeRange',
            op: '>=',
            value: 7,
          });
          currentFilter.push({
            field: 'usefulTimeRange',
            op: '<',
            value: 15,
          });
        } else {
          currentFilter.push({
            field: 'usefulTimeRange',
            op: '<',
            value: 7,
          });
        }
      }
    }
    if (typeMission.value === '整柜任务看板') {
    } else if (typeMission.value === '存仓看板') {
      currentFilter.push({ field: 'inStatus', op: 'in', value: ['存仓'] });
    } else if (typeMission.value === '审核看板') {
      currentFilter.push({
        field: 'inStatus',
        op: 'in',
        value: ['等待提交', '等待审核'],
      });
    } else if (typeMission.value === '报价看板') {
      currentFilter.push({ field: 'needOfferPrice', op: '==', value: '1' });
    }

    const ownedCustomerIds = await getUserCustomerList();
    currentFilter.push({ field: 'customer.id', op: 'in', value: ownedCustomerIds });
    const res = await getTaskListByFilterWithPagination(currentFilter, paginationReactive);
    allList = res.content;
    const totalCount = res.page.totalElements;
    let fakeListStart = [];
    let fakeListEnd = [];
    if (paginationReactive.pageNumber > 0) {
      fakeListStart = Array(paginationReactive.pageNumber * paginationReactive.pageSize)
        .fill(null)
        .map((it, index) => {
          return { key: index };
        });
    }
    if (paginationReactive.pageSize < totalCount) {
      if (totalCount - paginationReactive.pageSize * (paginationReactive.pageNumber + 1) > 0) {
        fakeListEnd = Array(
          totalCount - paginationReactive.pageSize * (paginationReactive.pageNumber + 1)
        )
          .fill(null)
          .map((it, index) => {
            return { key: index };
          });
      }
    }
    allList.forEach((it) => {
      if (it.trayItems.length > 0) {
        it.trayDisplay = it.trayItems.map(
          (a) => a.trayType + '(' + a.size + ')' + '*' + a.amount + ' / '
        );
      }
      const storageTime = it.timelines.filter((x) => x.useType === 'storage');
      let stayTime = '';
      if (storageTime) {
        for (let i = 0; i < storageTime.length - 1; i += 2) {
          stayTime =
            stayTime +
            dayjs(storageTime[i].detailTime).diff(dayjs(storageTime[i + 1].detailTime), 'day');
        }
        const timeListLength = storageTime.length;
        if (timeListLength % 2 !== 0) {
          stayTime =
            stayTime + dayjs().diff(dayjs(storageTime[timeListLength - 1].detailTime), 'day');
        }
        it.stayTime = stayTime;
      } else {
        it.stayTime = '-';
      }
    });
    return fakeListStart.concat(allList.concat(fakeListEnd));
  };

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  function checkCashStatus(id) {
    currentData = allList.find((it) => it.id === id);
    addNewFeeDialog = true;
  }

  watch(
    typeMission,
    async (value, oldValue) => {
      if (value !== oldValue && value && oldValue) {
        await reloadHeader();
      }
    },
    { deep: true }
  );

  async function reloadHeader() {
    currentWithOutSelection = [];
    currentHeader = [];
    const taskListHeader = await getTableHeaderGroupItemList('taskList');
    currentHeader = taskListHeader ? JSON.parse(taskListHeader?.headerItemJson) : [];
    currentHeader.forEach((item) => {
      const res = columns.find((it) => it.key === item.itemKey);
      currentWithOutSelection.push(res);
    });
    currentWithOutSelection =
      currentWithOutSelection.length > 0 ? currentWithOutSelection : columns;

    const userInfo = useUserStore().info;
    if (typeMission.value === '整柜任务看板') {
      currentColumns = [planObj, ...currentWithOutSelection];
      if (userInfo.userType !== '客户') {
        currentColumns.unshift(timeWarnColumn());
      }
    } else if (typeMission.value === '审核看板') {
      currentColumns = [checkedObj, ...currentWithOutSelection];
    } else if (typeMission.value === '报价看板') {
      currentColumns = [offerObj, ...currentWithOutSelection];
    } else {
      currentColumns = [...currentWithOutSelection];
    }
    currentColumns = currentColumns.filter((it) => it);

    // Sort columns with fixed property to the leftmost side
    const fixedColumns = currentColumns.filter((col) => col.fixed === 'left');
    const nonFixedColumns = currentColumns.filter((col) => col.fixed !== 'left');
    currentColumns = [...fixedColumns, ...nonFixedColumns];

    currentColumns.forEach((item) => {
      item.width = 200;
      item.resizable = true;
    });
    showCurrentHeaderDataTable = false;
  }

  async function reloadTable() {
    showModal.value = false;
    editDetailModel.value = false;
    addNewFeeDialog = false;
    addNewTrayDialog = false;
    showCurrentHeaderDataTable = false;
    showOfferPrice = false;
    checkLoading = false;
    showCheckDialog = false;
    splitTaskDialog = false;
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
    typeMission.value = '整柜任务看板';
    await reloadHeader();
    const res = getQueryString('containerNo');
    if (res) {
      filterItems.push({
        option: '柜号',
        key: 'containerId',
        value: res,
        display: res,
      });
      updateFilter(filterItems);
    } else {
      await reloadTable();
    }
  });

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

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    fixed: 'left',
    width: 160,
    render(record: any) {
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
                await addOrUpdateTask(record);
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
              startEdit(record.id);
            },
            highlight: () => {
              if (record.alreadyChanged === 1) {
                return 'error';
              } else {
                return 'success';
              }
            },
            ifShow: () => {
              return hasAuthPower('missionEdit') && !['已装车', '已出库'].includes(record.inStatus);
            },
          },
          {
            icon: renderIconWithTooltip(Payment20Regular, '结算'),
            onClick() {
              checkCashStatus(record.id);
            },
            ifShow: () => {
              return hasAuthPower('missionSettle');
            },
          },
          {
            icon: renderIconWithTooltip(SplitVertical20Regular, '拆分'),
            onClick() {
              currentInfo = record;
              splitTaskDialog = true;
            },
            ifShow: () => {
              return hasAuthPower('missionEdit');
            },
          },
          // {
          //   icon: renderIconWithTooltip(Document20Regular, '请报价'),
          //   onClick() {
          //     checkCashStatus(record.id);
          //   },
          //   highlight: () => {
          //     return 'info';
          //   },
          //   ifShow: () => {
          //     return record?.['needOfferPrice'] === '1' && hasAuthPower('missionPriceOffer');
          //   },
          // },
          {
            icon: renderIconWithTooltip(Clock20Regular, '时间线'),
            onClick() {
              currentInfo = record;
              showTimeLine = true;
            },
            ifShow: () => {
              return hasAuthPower('missionTimeline');
            },
          },
          {
            icon: renderIconWithTooltip(Document20Regular, '换单文件'),
            highlight: () => {
              return record?.['changeOrder']?.length > 0 ? 'success' : 'error';
            },
            ifShow: () => {
              return record?.changeOrderFiles === '是' && hasAuthPower('missionChangeFile');
            },
            async onClick() {
              const upload = useUploadDialog();
              const files = await upload.upload(record['changeOrder']);
              const userInfo = useUserStore().info;
              if (files.checkPassed) {
                record['changeOrder'] = files.files;
                if (!record.arriveTime) {
                  record['inStatus'] = InBoundDetailStatus.WaitCheck;
                }
                await addOrUpdateTaskTimeLine({
                  useType: 'normal',
                  bolitaTaskId: record.id,
                  operator: userInfo?.realName,
                  detailTime: dayjs().valueOf(),
                  note: '提交了换单文件',
                });
                record.customerId = record.customer.id;
                record.inventoryId = record.inventory.id;
                await addOrUpdateTask(record);
              }
              actionRef.value[0].reload();
            },
          },
          {
            icon: renderIconWithTooltip(Tag20Regular, '托盘标签'),
            highlight: () => {
              return record?.['trayFiles']?.length > 0 ? 'success' : 'error';
            },
            ifShow: () => {
              return (
                record?.deliveryMethod === 'FBA卡车派送' &&
                record?.outboundMethod === '标准托盘' &&
                hasAuthPower('missionTrayTag')
              );
            },
            async onClick() {
              const upload = useUploadDialog();
              const files = await upload.upload(record['trayFiles']);
              const userInfo = useUserStore().info;
              if (files.checkPassed) {
                record['trayFiles'] = files.files;
                await addOrUpdateTaskTimeLine({
                  useType: 'normal',
                  bolitaTaskId: record.id,
                  operator: userInfo?.realName,
                  detailTime: dayjs().valueOf(),
                  note: '提交了托盘标签',
                });
                record.customerId = record.customer.id;
                record.inventoryId = record.inventory.id;
                await addOrUpdateTask(record);
              }
              actionRef.value[0].reload();
            },
          },
          iconFileAction('POD', 'POD', DrawImage20Regular, 'missionPOD'),
          iconFileAction('操作文件', 'operationFiles', Document20Regular, 'missionOperationFile'),
          iconFileAction('问题图片', 'problemFiles', Image20Regular, 'missionProblemPic'),
          {
            icon: renderIconWithTooltip(Tag20Regular, '添加托盘'),
            onClick() {
              recordData = record;
              startAddTray(record.id);
            },
            highlight: () => {
              return record.trayItems.length > 0 ? 'success' : 'error';
            },
            ifShow: () => {
              return (
                (record.outboundMethod === '大件托盘' || record.outboundMethod === '标准托盘') &&
                hasAuthPower('missionAddTray')
              );
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
                record.cmrfiles = files.files;
                await addOrUpdateTask(record);
              }
              await actionRef.value[0].reload();
            },
            ifShow: () => {
              return hasAuthPower('outMissionUploadFile');
            },
          },
          {
            icon: renderIconWithTooltip(Warning20Regular, '信息已变更'),
            highlight: () => {
              return 'error';
            },
            async onClick() {
              record.alreadyChanged = 0;
              record.customerId = record.customer.id;
              record.inventoryId = record.inventory.id;
              await addOrUpdateTask(record);
              const userInfo = useUserStore().info;
              await addOrUpdateTaskTimeLine({
                useType: 'normal',
                bolitaTaskId: record.id,
                operator: userInfo?.realName,
                detailTime: dayjs().valueOf(),
                note: '修改过的信息已经被确认！',
              });
              await reloadTable();
            },
            ifShow: () => {
              return record.alreadyChanged;
            },
          },
          {
            icon: renderIconWithTooltip(Delete20Regular, '取消'),
            async onClick() {
              currentInfo = record;
              showCancelDialog = true;
            },
          },
        ],
      });
    },
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
