<template>
  <n-card v-if="hasAuthPower('carDetailView')" :bordered="false" class="proCard">
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
      </div>
      <div class="my-2"></div>
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
        v-model:show="editDetailModel"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 600px; max-width: 600px"
        title="编辑详情"
      >
        <edit-mission-detail :model="currentModel" @saved="reloadTable" />
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
  import { Box20Filled } from '@vicons/fluent';
  import dayjs from 'dayjs';
  import EditMissionDetail from '@/views/newViews/Missions/AlreadyWarehousing/EditMissionDetail.vue';
  import SelectedHeaderTable from '@/views/newViews/Missions/AlreadyWarehousing/SelectedHeaderTable.vue';
  import { updateOutboundForecast } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';
  import { generateOptionFromArray, safeSumBy } from '@/store/utils/utils';
  import { hasAuthPower } from '@/api/dataLayer/common/power';
  import NoPowerPage from '@/views/newViews/Common/NoPowerPage.vue';
  import FileSaver from 'file-saver';
  import { getTaskListByFilterWithPagination } from '@/api/newDataLayer/TaskList/TaskList';
  import { getOutboundForecastById } from '@/api/newDataLayer/OutboundForecast/OutboundForecast';
  import { getTableHeaderGroupItemList } from '@/api/newDataLayer/Header/HeaderGroup';
  import * as XLSX from 'xlsx';

  const showModal = ref(false);
  let editDetailModel = ref(false);

  let filterObj: any | null = $ref(null);
  let checkedRows = $ref([]);
  let currentModel: any | null = $ref(null);
  let monthTab: any | null = $ref(null);
  let selectedMonth: any | null = $ref('');
  let allList: any | null = $ref([]);
  let currentHeader = $ref([]);
  let currentColumns = $ref([]);
  let showCurrentHeaderDataTable = $ref(false);
  let optionOne = $ref('');
  let optionTwo = $ref('');
  let valueOne = $ref('');
  let valueTwo = $ref('');
  let dateRange = $ref(null);
  let showAll = $ref(false);

  const actionRef = ref();
  async function selectedHeader() {
    showCurrentHeaderDataTable = true;
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
    FileSaver.saveAs(blob, '订车明细.xlsx');
  }
  const realOptions = computed(() => {
    return generateOptionFromArray(columns.filter((it) => it.key).map((it) => it.title));
  });

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
      if (!res.includes('outboundId')) {
        currentFilter.push({
          field: 'outboundId',
          op: '!=',
          value: '',
        });
      }
      for (const filterItem of res) {
        if (filterItem === 'outboundId') {
          currentFilter.push({
            field: filterItem,
            op: '==',
            value: filterObj[filterItem],
          });
        } else {
          currentFilter.push({
            field: filterItem,
            op: filterObj[filterItem] ? 'like' : '!=',
            value: '%' + filterObj[filterItem] + '%' ?? '',
          });
        }
      }
    } else {
      currentFilter.push({
        field: 'outboundId',
        op: '!=',
        value: '',
      });
    }
    const result = await getTaskListByFilterWithPagination(currentFilter, paginationReactive);
    allList = result.content;
    const totalCount = result.page.totalElements;
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
      fakeListEnd = Array(
        totalCount - paginationReactive.pageSize * (paginationReactive.pageNumber + 1)
      )
        .fill(null)
        .map((it, index) => {
          return { key: index };
        });
    }
    if (dateRange) {
      let startDate = dayjs(dateRange[0]).startOf('day').valueOf() ?? valueOfToday[0];
      let endDate = dayjs(dateRange[1]).endOf('day').valueOf() ?? valueOfToday[1];
      allList = allList.filter(
        (it) => it.createTimestamp > startDate && it.createTimestamp < endDate
      );
    }
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

  async function reloadHeader() {
    currentColumns = [];
    currentHeader = (await getTableHeaderGroupItemList('taskList'))
      ? JSON.parse((await getTableHeaderGroupItemList('taskList'))?.headerItemJson)
      : [];
    currentHeader.forEach((item) => {
      const res = columns.find((it) => it.key === item.itemKey);
      currentColumns.push(res);
    });
    if (currentColumns.length > 0) {
      const selectionType = columns.find((x) => x.type === 'selection');
      if (selectionType) {
        currentColumns.unshift(selectionType);
      }
    }
    currentColumns = currentColumns.length > 0 ? currentColumns : columns;
    currentColumns.forEach((item) => {
      item.resizable = true;
    });
    showCurrentHeaderDataTable = false;
  }

  async function reloadTable() {
    showModal.value = false;
    editDetailModel.value = false;
    showCurrentHeaderDataTable = false;
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

  onMounted(async () => {
    await reloadHeader();
    const res = getQueryString('id');
    if (res) {
      setTimeout(() => {
        updateFilter({ outboundId: res });
      }, 500);
    } else {
      await reloadTable();
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
            label: '审核',
            async onClick() {
              let outboundInfo = await getOutboundForecastById(record.outboundId);
              outboundInfo.outboundDetailInfo = outboundInfo.outboundDetailInfo.filter(
                (it) => it !== record.id
              );
              if (!outboundInfo.waitPrice) {
                outboundInfo.inStatus = '待订车';
              }
              if (outboundInfo.waitPrice && !outboundInfo.waitCar) {
                outboundInfo.inStatus = '待订车';
              }
              if (outboundInfo.waitCar) {
                outboundInfo.inStatus = '已订车';
              }
              if (outboundInfo.outboundDetailInfo.length === 0) {
                outboundInfo.inStatus = '已取消';
              }
              record.outboundId = '';
              await NotifyDetailManager.editInternal(record, record.id);
              const currentList = await getDetailListById(outboundInfo.outboundDetailInfo);
              outboundInfo.totalOutOffer = safeSumBy(currentList, 'outPrice') ?? 0;
              outboundInfo.totalVolume = safeSumBy(currentList, 'volume') ?? 0;
              outboundInfo.totalWeight = safeSumBy(currentList, 'weight') ?? 0;
              outboundInfo.containerNum = safeSumBy(currentList, 'arrivedContainerNum') ?? 0;
              await updateOutboundForecast(outboundInfo.id, outboundInfo);
              await reloadTable();
            },
            ifShow: () => {
              return (
                (record.inStatus === '存仓' || record.inStatus === '库内操作') &&
                hasAuthPower('carDetailCheck')
              );
            },
          },
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
