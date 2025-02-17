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
        <n-button
          v-if="typeMission === '整柜任务看板' && hasAuthPower('missionOutboundAdd')"
          type="primary"
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
          type="primary"
          @click="checkDetailInfo"
        >
          <template #icon>
            <n-icon>
              <Box20Filled />
            </n-icon>
          </template>
          审核
        </n-button>
        <n-button
          v-if="typeMission === '报价看板' && hasAuthPower('missionPriceOffer')"
          type="primary"
          @click="showOfferPrice = true"
        >
          <template #icon>
            <n-icon>
              <Box20Filled />
            </n-icon>
          </template>
          报价
        </n-button>
        <n-button type="primary" @click="downloadData">
          <template #icon>
            <n-icon>
              <Box20Filled />
            </n-icon>
          </template>
          下载
        </n-button>
        <n-button type="primary" @click="merge">
          <template #icon>
            <n-icon>
              <Box20Filled />
            </n-icon>
          </template>
          合并
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
        <!--        <n-checkbox v-model:checked="showAll" class="ml-2" label="全部" size="large" />-->
      </div>
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
          <div v-if="hasPagePower">
            <BasicTable
              ref="actionRef"
              v-model:checked-row-keys="checkedRows"
              :actionColumn="actionColumn"
              :columns="currentColumns"
              :pagination="paginationReactive"
              :request="loadDataTable"
              :row-key="(row) => row.id"
              @update:page="handlePageChange"
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
    </div>
  </n-card>
</template>

<script lang="ts" setup>
  import { Component, computed, h, onMounted, reactive, ref, watch } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import { $ref } from 'vue/macros';
  import {
    getFileActionButton,
    statusColumnEasy,
    storageTimeWarnColumn,
    timeColumn,
    timeWarnColumn,
  } from '@/views/bolita-views/composable/useableColumns';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { InBoundDetailStatus, InBoundStatus } from '@/api/dataLayer/modules/notify/notify-api';
  import { Box20Filled } from '@vicons/fluent';
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
  import { NButton, NInput, useDialog } from 'naive-ui';
  import * as XLSX from 'xlsx';

  const showModal = ref(false);
  let editDetailModel = ref(false);

  let filterObj: any | null = $ref(null);
  let addNewFeeDialog = $ref(false);
  let checkedRows = $ref([]);
  let currentModel: any | null = $ref(null);
  let typeTab = $ref(['整柜任务看板', '审核看板', '存仓看板']);
  let typeMission = ref('');
  let selectedMonth: any | null = $ref('');
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
  let optionOne = $ref('');
  let optionTwo = $ref('');
  let valueOne = $ref('');
  let valueTwo = $ref('');
  let dateRange = $ref(null);
  let showAll = $ref(false);
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
    {
      title: '客户ID',
      key: 'customer.customerName',
    },
    {
      title: '柜号',
      key: 'containerId',
    },
    {
      title: '票号',
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
    statusColumnEasy({
      title: '状态',
      key: 'inStatus',
    }),
    {
      title: '仓库',
      key: 'inventory.name',
    },
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
    },
    {
      title: '物流渠道',
      key: 'deliveryMethod',
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
  ];

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

  async function downloadData() {
    let selectedList = [];
    selectedList = await loadDataTable();
    let headerTitle = columns.filter((it) => it.title).map((it) => it.title);
    let data = [];
    data.unshift(headerTitle);
    selectedList.forEach((it) => {
      const res = [
        it.customer?.customerName ?? '', //客户
        it.containerId ?? '', //柜号
        it.ticketId ?? '', //票号
        it.country ?? '', //国家
        it.number ?? '', //预报件数
        it.arrivedContainerNum ?? '', // 实际件数
        it.weight ?? '', //总实重
        it.volume ?? '', //总体积
        it.size ?? '', //尺寸
        it.inStatus ?? '', //状态
        it.inventory?.name ?? '', //仓库
        it.stayTime ?? '', //留仓时间
        it.deliveryIdIn ?? '', //运单号
        it.normalNote ?? '', //客户备注
        it.FBADeliveryCode ?? '', //FBA单号
        it.outboundMethod ?? '', //出库方式
        it.deliveryMethod ?? '', //物流渠道
        it.operationRequire ?? '', //操作要求
        it.operationNote ?? '', //操作备注
        it.finalStatus ?? '', //结算状态
        it.PO ?? '', //PO
        it.FCAddress ?? '', //FC/送货地址
        it.postcode ?? '', //邮编
        it.inBoundDetailStatus ?? '', //审核状态
        it.changeOrderFiles ?? '', //换单文件
        it.transportationNote ?? '', //送货备注
        it.trayNum ?? '', //预报托数
        it.trayDisplay ?? '', //托盘规格
        it.arrivedTrayNum ?? '', //实际托数
        it.planArriveDateTime ? dayjs(it.planArriveDateTime).format('YYYY-MM-DD') : '', //预期到仓日期
        it.currentDate ? dayjs(it.currentDate[0]).format('YYYY-MM-DD') : '', //实际到仓日期
        it.deliveryTime ? dayjs(it.deliveryTime).format('YYYY-MM-DD') : '', //发货时间
        it.outBoundTime ? dayjs(it.outBoundTime).format('YYYY-MM-DD HH:ss:mm') : '', //预计取货时间
        it.Ref ?? '', //REF
        it.note ?? '', //仓库备注
        it.warehouseLocation ?? '', //库位
        it.sign ?? '', //分拣标识
        it.package ?? '', //包装
        it.industrialTrayNum ?? '', //托数
        it.productName ?? '', //品名
        it.UNNumber ?? '', //UN号
        it.recipient ?? '', //收件人
        it.phone ?? '', //电话
        it.email ?? '', //邮箱
        it.needReserve ?? '', //是否需要预约
        it.industrialNote ?? '', //工业品备注
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
      const res = Object.keys(filterObj);
      for (const filterItem of res) {
        if (filterItem === 'usefulTimeRange') {
          console.log(filterObj[filterItem]);
          if (filterObj[filterItem] === '红色') {
            currentFilter.push({
              field: filterItem,
              op: '>=',
              value: 15,
            });
          } else if (filterObj[filterItem] === '黄色') {
            currentFilter.push({
              field: filterItem,
              op: '>=',
              value: 7,
            });
            currentFilter.push({
              field: filterItem,
              op: '<',
              value: 15,
            });
          } else {
            currentFilter.push({
              field: filterItem,
              op: '<',
              value: 7,
            });
          }
        } else {
          currentFilter.push({
            field: filterItem,
            op: filterObj[filterItem] ? 'like' : '!=',
            value: '%' + filterObj[filterItem] + '%' ?? '',
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
    // if (!showAll) {
    //   const oldValue = currentFilter.find((it) => it.field === 'inStatus')?.value;
    //   console.log(oldValue, 'old');
    //   const currentValue = oldValue ? oldValue.push('已取消') : ['已取消'];
    //   console.log(currentValue, 'value');
    //   currentFilter = currentFilter.filter((it) => it.field !== 'inStatus');
    //   currentFilter.push({
    //     field: 'inStatus',
    //     op: 'in',
    //     value: currentValue,
    //   });
    // }
    if (dateRange) {
      currentFilter.push({ field: 'planArriveDateTime', op: '>=', value: dateRange[0] });
      currentFilter.push({ field: 'planArriveDateTime', op: '<=', value: dateRange[1] });
      // let startDate = dayjs(dateRange[0]).startOf('day').valueOf() ?? valueOfToday[0];
      // let endDate = dayjs(dateRange[1]).endOf('day').valueOf() ?? valueOfToday[1];
      // allList = allList.filter(
      //   (it) => it.createTimestamp > startDate && it.createTimestamp < endDate
      // );
    }
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
      Object.keys(filterObj).forEach((key) => {
        if (key === 'fcaddress') {
          filterObj['FCAddress'] = filterObj[key];
          delete filterObj[key];
        }
      });
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

  function checkCashStatus(id) {
    currentData = allList.find((it) => it.id === id);
    addNewFeeDialog = true;
  }

  watch(
    typeMission,
    async (value, oldValue) => {
      if (value !== oldValue) {
        await reloadHeader();
      }
    },
    { immediate: true, deep: true }
  );

  async function reloadHeader() {
    currentWithOutSelection = [];
    currentHeader = [];
    currentHeader = (await getTableHeaderGroupItemList('taskList'))
      ? JSON.parse((await getTableHeaderGroupItemList('taskList'))?.headerItemJson)
      : [];
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
    currentColumns.forEach((item) => {
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
    await reloadHeader();
    typeMission.value = '整柜任务看板';
    const res = getQueryString('containerNo');
    if (res) {
      updateFilter({ containerId: res });
    } else {
      await reloadTable();
    }
  });

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 120,
    render(record: any) {
      const fileAction = (label, key, icon?: Component, power) => {
        return getFileActionButton(label, key, addOrUpdateTask, reloadTable, record, icon, power);
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
              return hasAuthPower('missionEdit');
            },
          },
          {
            label: '结算',
            onClick() {
              checkCashStatus(record.id);
            },
            ifShow: () => {
              return hasAuthPower('missionSettle');
            },
          },
          {
            label: '拆分',
            onClick() {
              currentInfo = record;
              splitTaskDialog = true;
            },
            ifShow: () => {
              return hasAuthPower('missionEdit');
            },
          },
          // {
          //   label: '请报价',
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
            label: '时间线',
            onClick() {
              currentInfo = record;
              showTimeLine = true;
            },
            ifShow: () => {
              return hasAuthPower('missionTimeline');
            },
          },
          {
            label: '换单文件',
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
            label: '托盘标签',
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
          fileAction('POD', 'POD', '', 'missionPOD'),
          fileAction('操作文件', 'operationFiles', '', 'missionOperationFile'),
          fileAction('问题图片', 'problemFiles', '', 'missionProblemPic'),
          {
            label: '添加托盘',
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
            label: '装车照片',
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
              await actionRef.value.reload();
            },
            ifShow: () => {
              return hasAuthPower('outMissionUploadFile');
            },
          },
          {
            label: '信息已变更',
            highlight: () => {
              return 'error';
            },
            async onClick() {
              record.alreadyChanged = 0;
              record.customerId = record.customer.id;
              record.inventoryId = record.inventory.id;
              await addOrUpdateTask(record);
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
