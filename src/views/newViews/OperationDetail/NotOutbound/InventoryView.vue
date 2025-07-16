<template>
  <n-card v-if="hasAuthPower('inStorageView')" :bordered="false" class="proCard">
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
        <n-button class="action-button" size="small" type="primary" @click="finishedCancel">
          <template #icon>
            <n-icon>
              <Box20Filled />
            </n-icon>
          </template>
          操作完成
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
        @update:pageSize="handlePageSizeChange"
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
        <selected-header-table :all-columns="columns" :type="'taskList'" @saved="reloadHeader" />
      </n-modal>
      <n-modal
        v-model:show="showTimeLine"
        :show-icon="false"
        preset="card"
        style="width: 800px"
        title="时间线"
      >
        <time-line :info="currentInfo" />
      </n-modal>
      <n-modal
        v-model:show="showConfirmDialog"
        :show-icon="false"
        preset="card"
        style="width: 800px"
        title="请确认"
      >
        <confirm-dialog :title="'您确定要执行这个操作吗？'" @saved="confirmFinish" />
      </n-modal>
    </div>
  </n-card>
  <no-power-page v-else />
</template>

<script lang="ts" setup>
  import { computed, h, onMounted, reactive, ref } from 'vue';
  import { NButton, NIcon, NInput, NTooltip } from 'naive-ui';
  import { BasicTable, TableAction } from '@/components/Table';
  import {
    allDeliveryMethod,
    allInStatusList,
    allOutboundMethod,
  } from '@/views/newViews/Missions/AlreadyWarehousing/columns';
  import { $ref } from 'vue/macros';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { NotifyDetailManager } from '@/api/dataLayer/modules/notify/notify-detail';
  import { InBoundDetailStatus, InBoundStatus } from '@/api/dataLayer/modules/notify/notify-api';
  import {
    ArrowDownload20Regular,
    Box20Filled, Clock20Regular,
    Document20Regular,
    DocumentEdit20Regular,
    Image20Regular,
    TableSettings20Regular
  } from "@vicons/fluent";
  import NewOutboundPlan from '@/views/newViews/OutboundPlan/NewOutboundPlan.vue';
  import dayjs from 'dayjs';
  import EditMissionDetail from '@/views/newViews/Missions/AlreadyWarehousing/EditMissionDetail.vue';
  import NewTotalFee from '@/views/newViews/SettlementManage/NewTotalFee.vue';
  import NewTrayDialog from '@/views/newViews/Missions/AlreadyWarehousing/NewTrayDialog.vue';
  import SelectedHeaderTable from '@/views/newViews/Missions/AlreadyWarehousing/SelectedHeaderTable.vue';
  import TimeLine from '@/views/newViews/Missions/AlreadyWarehousing/TimeLine.vue';
  import { useUserStore } from '@/store/modules/user';
  import { getUserCustomerList, hasAuthPower } from '@/api/dataLayer/common/power';
  import NoPowerPage from '@/views/newViews/Common/NoPowerPage.vue';
  import { generateOptionFromArray, toastSuccess } from '@/store/utils/utils';
  import ConfirmDialog from '@/views/newViews/Common/ConfirmDialog.vue';
  import { inStorageObj } from '@/views/newViews/Missions/AlreadyWarehousing/selectionType';
  import FileSaver from 'file-saver';
  import {
    addOrUpdateTask,
    getTaskListByFilterWithPagination,
    getTaskListByIds,
  } from '@/api/newDataLayer/TaskList/TaskList';
  import { addOrUpdateTaskTimeLine } from '@/api/newDataLayer/TimeLine/TimeLine';
  import { getTableHeaderGroupItemList } from '@/api/newDataLayer/Header/HeaderGroup';
  import { useUploadDialog } from '@/store/modules/uploadFileState';
  import * as XLSX from 'xlsx';
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
  let addNewFeeDialog = $ref(false);
  let checkedRows = $ref([]);
  let currentModel: any | null = $ref(null);
  let currentData: any | null = $ref('');
  let recordData: any | null = $ref('');
  let allList: any | null = $ref([]);
  let addNewTrayDialog = $ref(false);
  let showCurrentHeaderDataTable = $ref(false);
  let currentHeader = $ref([]);
  let currentColumns = $ref([]);
  let showTimeLine = $ref(false);
  let currentInfo = $ref('');
  let dateRange = $ref(null);
  let showConfirmDialog = $ref(false);
  let cancelIds = $ref([]);
  let showAll = $ref(false);
  let filterItems = $ref<Array<{ option: string; value: string }>>([]);
  const actionRef = ref();
  const props = defineProps<Prop>();
  const columns = [
    {
      type: 'selection',
      disabled: (row) => row.inStatus !== '入库待操作',
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
  interface Prop {
    belongsToId?: string;
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
      // reloadTable() is called by handlePageChange, no need to call it here
    },
    onUpdatePageSize: (pageSize: number) => {
      paginationReactive.pageSize = pageSize;
      paginationReactive.pageNumber = 0;
      // Let the BasicTable component handle the data fetching
    },
  });

  async function startEdit(id) {
    currentModel = await NotifyDetailManager.getById(id);
    editDetailModel.value = true;
  }

  async function selectedHeader() {
    showCurrentHeaderDataTable = true;
  }

  async function startAddTray(id) {
    addNewTrayDialog = true;
  }

  const realOptions = computed(() => {
    return generateOptionFromArray(columns.filter((it) => it.key).map((it) => it.title));
  });

  const loadDataTable = async () => {
    let currentFilter = [];
    if (filterObj) {
      const filterOne = filterObj.filter((it) => it?.component?.name !== 'DatePicker');
      const filterTwo = filterObj.filter((it) => it?.component?.name === 'DatePicker');
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
    }
    // currentFilter.push({
    //   field: 'inStatus',
    //   op: 'in',
    //   value: ['入库待操作'],
    // });
    currentFilter.push({
      field: 'operateInStorage',
      op: '==',
      value: '是'
    })
    const customerId = await getUserCustomerList();
    currentFilter.push({ field: 'customer.id', op: 'in', value: customerId });

    // Get paginated data
    const res = await getTaskListByFilterWithPagination(currentFilter, paginationReactive);
    allList = res.content;
    const totalCount = res.page.totalElements;

    // Create fake list items for pagination display
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

    // Process each item to calculate stay time
    allList.forEach((it) => {
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

    // Return combined list with fake items for pagination
    return fakeListStart.concat(allList.concat(fakeListEnd));
  };

  async function downloadData() {
    try {
      // Get filtered data
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

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(data);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

      // Save file
      FileSaver.saveAs(blob, '库内操作看板.xlsx');

      toastSuccess('下载成功');
    } catch (error) {
      console.error('下载失败:', error);
    }
  }

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  function updateFilterWithItems(value) {
    filterObj = value;
    reloadTable();
  }

  function handlePageChange(page: number) {
    paginationReactive.pageNumber = page - 1;
    reloadTable();
  }

  function handlePageSizeChange(pageSize: number) {
    paginationReactive.pageSize = pageSize;
    paginationReactive.pageNumber = 0;
    reloadTable();
  }

  function checkCashStatus(id) {
    currentData = allList.find((it) => it.id === id);
    addNewFeeDialog = true;
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
    currentColumns = currentColumns.length > 0 ? currentColumns : columns;
    currentColumns = [inStorageObj, ...currentColumns];
    currentColumns = currentColumns.filter((it) => it);
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

  async function confirmFinish() {
    const userInfo = useUserStore().info;
    const currentList = await getTaskListByIds(cancelIds);
    for (const currentItem of currentList) {
      if (currentItem.outboundMethod !== '存仓') {
        currentItem.inStatus = '入库待出库';
      } else {
        currentItem.inStatus = '存仓';
      }
      currentItem.customerId = currentItem.customer.id;
      currentItem.inventoryId = currentItem.inventory.id;
      await addOrUpdateTaskTimeLine({
        useType: 'normal',
        bolitaTaskId: currentItem.id,
        operator: userInfo?.realName,
        detailTime: dayjs().valueOf(),
        note: '完成库内操作',
      });
      await addOrUpdateTask(currentItem);
    }
    await reloadTable();
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

  onMounted(async () => {
    await reloadHeader();
    const res = getQueryString('containerId');
    if (res) {
      updateFilter({ containerId: res });
    } else {
      await reloadTable();
    }
  });

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 100,
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
            icon: renderIconWithTooltip(Box20Filled, '操作已完成'),
            highlight: () => {
              return 'info';
            },
            async onClick() {
              cancelIds = [];
              cancelIds.push(record.id);
              showConfirmDialog = true;
            },
            ifShow: () => {
              return record.inStatus === '入库待操作' && hasAuthPower('inStorageTurnToOut');
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
              actionRef.value.reload();
            },
          },
          iconFileAction('POD', 'POD', Document20Regular, 'missionPOD'),
          iconFileAction(
            '操作文件',
            'operationFiles',
            DocumentEdit20Regular,
            'missionOperationFile'
          ),
          iconFileAction('问题图片', 'problemFiles', Image20Regular, 'missionProblemPic'),
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
        ],
      });
    },
  });
</script>

<style lang="less" scoped>
  .action-button {
    margin-right: 8px;
  }

  .filter-container {
    display: flex;
    align-items: center;
    margin-top: 8px;
    flex-wrap: wrap;
  }

  .filter-card {
    max-width: 300px;
  }

  .filter-row {
    display: flex;
    align-items: center;
  }

  .modal-small {
    width: 90%;
    min-width: 400px;
    max-width: 400px;
  }

  .modal-medium {
    width: 90%;
    min-width: 600px;
    max-width: 800px;
  }

  .modal-large {
    width: 90%;
    min-width: 600px;
    max-width: 1200px;
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
