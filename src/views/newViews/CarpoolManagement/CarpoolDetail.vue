<template>
  <n-card v-if="hasAuthPower('carDetailView')" :bordered="false" class="proCard">
    <div>
      <filter-bar
        v-model="filterItems"
        v-model:dateRange="dateRange"
        v-model:showAll="showAll"
        :columns="columns"
        @clear="updateFilter(null)"
        @submit="updateFilter"
        @filter-change="updateFilterWithItems"
      />
      <div class="mt-2">
        <n-button class="action-button" size="small" type="primary" @click="selectedHeader">
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
  import { computed, h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns } from '@/views/newViews/Missions/AlreadyWarehousing/columns';
  import { $ref } from 'vue/macros';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import {
    getDetailListById,
    NotifyDetailManager,
  } from '@/api/dataLayer/modules/notify/notify-detail';
  import {
    ArrowDownload20Regular,
    CheckmarkCircle20Regular,
    TableSettings20Regular,
  } from '@vicons/fluent';
  import { NIcon, NTooltip } from 'naive-ui';
  import dayjs from 'dayjs';
  import EditMissionDetail from '@/views/newViews/Missions/AlreadyWarehousing/EditMissionDetail.vue';
  import SelectedHeaderTable from '@/views/newViews/Missions/AlreadyWarehousing/SelectedHeaderTable.vue';
  import { updateOutboundForecast } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';
  import { generateOptionFromArray, safeSumBy, toastSuccess } from '@/store/utils/utils';
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
  let filterItems = $ref<Array<{ option: string; value: string }>>([]);

  const actionRef = ref();
  async function selectedHeader() {
    showCurrentHeaderDataTable = true;
  }

  async function downloadData() {
    let selectedList = [];
    selectedList = await loadDataTable();
    let headerTitle = columns.filter((it) => it.title).map((it) => it.title);
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
      const filterByOutboundId = filterObj.find((it) => it.key === 'outboundId');
      const otherFilter = filterObj.filter((it) => it.key !== 'outboundId');
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
            op: filterTwo[filterItem].value ? 'like' : '!=',
            value: `%${filterTwo[filterItem].value || ''}%`,
          }))
        : [];
      currentFilter = filterWithOutDate.concat(filterWithDate);
      if (filterByOutboundId) {
        currentFilter.push({
          field: 'outboundId',
          op: '==',
          value: filterByOutboundId.value,
        });
      } else {
        currentFilter.push({
          field: 'outboundId',
          op: '!=',
          value: '',
        });
      }
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
    return fakeListStart.concat(allList.concat(fakeListEnd));
  };

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  function updateFilterWithItems(value) {
    filterObj = value;
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
    width: 120,
    render(record: any) {
      return h(TableAction as any, {
        style: 'text',
        actions: [
          {
            icon: renderIconWithTooltip(CheckmarkCircle20Regular, '审核'),
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
              toastSuccess('审核成功');
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
