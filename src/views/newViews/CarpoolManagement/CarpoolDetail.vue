<template>
  <n-card v-if="hasAuthPower('carDetailView')" :bordered="false" class="proCard">
    <div>
      <filter-bar
        v-model="filterItems"
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
  import { h, onMounted, reactive, ref } from 'vue';
  import { BasicTable } from '@/components/Table';
  import {
    allDeliveryMethod,
    allInStatusList,
    allOutboundMethod,
  } from '@/views/newViews/Missions/AlreadyWarehousing/columns';
  import { $ref } from 'vue/macros';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { ArrowDownload20Regular, TableSettings20Regular } from '@vicons/fluent';
  import { NButton, NIcon, NInput } from 'naive-ui';
  import dayjs from 'dayjs';
  import EditMissionDetail from '@/views/newViews/Missions/AlreadyWarehousing/EditMissionDetail.vue';
  import SelectedHeaderTable from '@/views/newViews/Missions/AlreadyWarehousing/SelectedHeaderTable.vue';
  import { generateOptionFromArray } from '@/store/utils/utils';
  import { hasAuthPower } from '@/api/dataLayer/common/power';
  import NoPowerPage from '@/views/newViews/Common/NoPowerPage.vue';
  import FileSaver from 'file-saver';
  import {
    addOrUpdateTask,
    getTaskListByFilterWithPagination,
  } from '@/api/newDataLayer/TaskList/TaskList';
  import { getTableHeaderGroupItemList } from '@/api/newDataLayer/Header/HeaderGroup';
  import * as XLSX from 'xlsx';
  import { InBoundDetailStatus } from '@/api/dataLayer/modules/notify/notify-api';
  import {
    statusColumnEasy,
    statusColumnSelect,
    storageTimeWarnColumn,
    timeColumn,
    timeWarnList,
  } from '@/views/bolita-views/composable/useableColumns';
  import { asyncCustomerByFilter, asyncStorageByFilter } from '@/api/dataLayer/common/common';

  const showModal = ref(false);
  let editDetailModel = ref(false);

  let filterObj: any | null = $ref(null);
  let checkedRows = $ref([]);
  let currentModel: any | null = $ref(null);
  let allList: any | null = $ref([]);
  let currentHeader = $ref([]);
  let currentColumns = $ref([]);
  let showCurrentHeaderDataTable = $ref(false);
  let filterItems = $ref<Array<{ option: string; value: string }>>([]);
  const columns = [
    {
      type: 'selection',
      disabled: (row) => row.inStatus !== InBoundDetailStatus.WaitCheck,
    },
    {
      title: '时效',
      key: 'usefulTimeRange',
      component: 'NSelect',
      componentProps: {
        options: timeWarnList,
      },
    },
    asyncCustomerByFilter(),
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
      width: 300,
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
  ];

  const actionRef = ref();

  async function selectedHeader() {
    showCurrentHeaderDataTable = true;
  }

  async function downloadData() {
    let selectedList = [];
    selectedList = await loadDataTable();
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
            op: 'between',
            value: filterTwo[filterItem].value,
          }))
        : [];
      currentFilter = filterWithOutDate.concat(filterWithDate);
      console.log(filterByOutboundId, 'filterByOutboundId');
      if (filterByOutboundId) {
        currentFilter.push({
          field: 'outboundId',
          op: '==',
          value: filterByOutboundId.value,
        });
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
    const taskListHeader = await getTableHeaderGroupItemList('taskList');
    currentHeader = taskListHeader ? JSON.parse(taskListHeader?.headerItemJson) : [];
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
      filterItems.push({
        option: '订车Id',
        key: 'outboundId',
        value: res,
        display: res,
      });
      updateFilter(filterItems);
    } else {
      await reloadTable();
    }
  });

  // Helper function to render icon with tooltip
  // const renderIconWithTooltip = (icon, tooltip) => {
  //   return () =>
  //     h(
  //       NTooltip,
  //       { trigger: 'hover', placement: 'top' },
  //       {
  //         trigger: () => h(NIcon, { size: 18, class: 'action-icon' }, { default: () => h(icon) }),
  //         default: () => tooltip,
  //       }
  //     );
  // };
  //
  // const actionColumn = reactive({
  //   title: '可用动作',
  //   key: 'action',
  //   width: 120,
  //   render(record: any) {
  //     return h(TableAction as any, {
  //       style: 'text',
  //       actions: [
  //         {
  //           icon: renderIconWithTooltip(CheckmarkCircle20Regular, '审核'),
  //           async onClick() {
  //             console.log(record);
  //             let outboundInfo = await getOutboundForecastById(record.outboundId);
  //             outboundInfo.outboundDetailInfo = outboundInfo.outboundDetailInfo.filter(
  //               (it) => it !== record.id
  //             );
  //             if (!outboundInfo.waitPrice) {
  //               outboundInfo.inStatus = '待订车';
  //             }
  //             if (outboundInfo.waitPrice && !outboundInfo.waitCar) {
  //               outboundInfo.inStatus = '待订车';
  //             }
  //             if (outboundInfo.waitCar) {
  //               outboundInfo.inStatus = '已订车';
  //             }
  //             if (outboundInfo.outboundDetailInfo.length === 0) {
  //               outboundInfo.inStatus = '已取消';
  //             }
  //             record.outboundId = '';
  //             await NotifyDetailManager.editInternal(record, record.id);
  //             const currentList = await getDetailListById(outboundInfo.outboundDetailInfo);
  //             outboundInfo.totalOutOffer = safeSumBy(currentList, 'outPrice') ?? 0;
  //             outboundInfo.totalVolume = safeSumBy(currentList, 'volume') ?? 0;
  //             outboundInfo.totalWeight = safeSumBy(currentList, 'weight') ?? 0;
  //             outboundInfo.containerNum = safeSumBy(currentList, 'arrivedContainerNum') ?? 0;
  //             await updateOutboundForecast(outboundInfo.id, outboundInfo);
  //             toastSuccess('审核成功');
  //             await reloadTable();
  //           },
  //           ifShow: () => {
  //             return (
  //               (record.inStatus === '存仓' || record.inStatus === '库内操作') &&
  //               hasAuthPower('carDetailCheck')
  //             );
  //           },
  //         },
  //       ],
  //     });
  //   },
  // });
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
