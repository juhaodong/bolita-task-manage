<template>
  <div>
    <n-card v-if="hasAuthPower('forecastView')" :bordered="false" class="proCard">
      <single-filter-bar
        :form-fields="filters"
        @clear="updateFilter(null)"
        @submit="updateFilter"
      />
      <div class="mt-2">
        <n-button
          v-if="hasAuthPower('forecastAdd')"
          class="action-button"
          size="small"
          type="primary"
          @click="addTable(NotifyType.Container)"
        >
          新建预报
        </n-button>
        <n-button class="action-button" size="small" type="info" @click="selectedHeader">
          表头显示
        </n-button>
        <n-button class="action-button" size="small" type="success" @click="downloadData">
          下载
        </n-button>
        <n-button class="action-button" size="small" type="warning" @click="downloadFbaCode">
          下载FBA
        </n-button>
        <n-button
          :disabled="selectedNotifyList.length !== 1"
          class="action-button"
          size="small"
          @click="startEdit"
        >
          修改
        </n-button>
        <n-button
          :disabled="disableUnloading"
          class="action-button"
          size="small"
          @click="checkContainerStatus"
        >
          卸柜
        </n-button>
        <n-button
          :disabled="selectedNotifyList.length !== 1"
          class="action-button"
          size="small"
          @click="showUnloading"
        >
          生成卸柜单
        </n-button>
        <n-button
          :disabled="selectedNotifyList.length !== 1"
          class="action-button"
          size="small"
          @click="showUnloadingPic"
        >
          卸柜照片
        </n-button>
        <n-button
          :disabled="selectedNotifyList.length !== 1"
          class="action-button"
          size="small"
          @click="uploadUnloadingForm"
        >
          上传卸柜单
        </n-button>
        <n-button
          :disabled="selectedNotifyList.length !== 1"
          class="action-button"
          size="small"
          @click="downloadFile"
        >
          预报文件
        </n-button>
        <n-button
          :disabled="disableCancel"
          class="action-button"
          size="small"
          @click="cancelButton"
        >
          取消
        </n-button>
      </div>

      <BasicTable
        v-model:checked-row-keys="checkedRowKeys"
        ref="actionRef"
        @update:checked-row-keys="handleCheck"
        :columns="currentColumns"
        :pagination="paginationReactive"
        :request="loadDataTable"
        :row-key="(row) => row.id"
        @update:page="handlePageChange"
        @update:pageSize="handlePageSizeChange"
        @row-click="onRowClick"
      />
      <n-modal
        v-model:show="showModal"
        :show-icon="false"
        :style="{ maxWidth: notifyType === NotifyType.TrayOrBox ? '1600px' : '800px' }"
        class="modal-large"
        preset="card"
        :title="currentModel ? '编辑货柜预报' : '新建货柜预报'"
      >
        <container-forecast-index
          :current-model="currentModel"
          :type="notifyType"
          @saved="closeAddDialog"
        />
      </n-modal>
      <n-modal
        v-model:show="showOperationTable"
        :show-icon="false"
        class="modal-medium"
        preset="dialog"
        style="width: 800px"
        title="卸柜表"
      >
        <notify-unload-form :notify-id="currentNotifyId!" @save="reloadTable" />
      </n-modal>
      <n-modal
        v-model:show="showFeeDialog"
        :show-icon="false"
        class="modal-medium"
        preset="dialog"
        title="费用表"
      >
        <notify-fee-dialog :notify-id="currentNotifyId!" @save="reloadTable" />
      </n-modal>
      <n-modal
        v-model:show="showWarehouseDialog"
        :show-icon="false"
        class="modal-medium"
        preset="dialog"
        title="仓库信息"
      >
        <warehouse-info-dialog :notify-id="currentNotifyId!" />
      </n-modal>
      <n-modal
        v-model:show="showUnloadingList"
        :show-icon="false"
        class="modal-large"
        preset="dialog"
        style="width: 80%"
        title="卸柜单"
      >
        <unloading-list :notify-id="currentNotifyId!" @save="reloadTable" />
      </n-modal>
      <n-modal
        v-model:show="showCurrentHeaderDataTable"
        :show-icon="false"
        class="modal-medium"
        preset="card"
        style="width: 90%; min-width: 800px; max-width: 800px"
        title="添加表头"
      >
        <selected-header-table
          :all-columns="columns"
          :type="'containerForecast'"
          @saved="reloadHeader"
        />
      </n-modal>
      <n-modal
        v-model:show="showConfirmDialog"
        :show-icon="false"
        class="modal-small"
        preset="card"
        style="width: 600px"
        title="请确认"
      >
        <confirm-dialog :title="'您确定要取消吗？'" @saved="confirmCancel" />
      </n-modal>
      <n-modal
        v-model:show="showConfirmUnloading"
        :show-icon="false"
        class="modal-small"
        preset="card"
        style="width: 600px"
        title="请确认"
      >
        <confirm-dialog :title="'确认货柜到库？'" @saved="confirmUnloading" />
      </n-modal>
      <n-modal
        v-model:show="showNeedCheckDialog"
        :show-icon="false"
        class="modal-small"
        preset="card"
        style="width: 600px"
        title="请确认"
      >
        <confirm-dialog :title="'请先审核完所有任务！'" @saved="showNeedCheckDialog = false" />
      </n-modal>
      <n-modal
        v-model:show="showDetailInfoDialog"
        :show-icon="false"
        preset="card"
        style="width: 80%"
        :title="currentModel?.containerNo + '/' + currentModel?.inventory?.name"
      >
        <detail-group-task-dialog :notify-id="currentId" />
      </n-modal>
    </n-card>
    <no-power-page v-else />
  </div>
</template>

<script lang="ts" setup>
  import { h, onMounted, reactive, ref } from 'vue';
  import { DataTableColumns, NButton } from 'naive-ui';
  import { BasicTable } from '@/components/Table';
  import { columns } from './columns';
  import { InBoundStatus, NotifyType } from '@/api/dataLayer/modules/notify/notify-api';
  import { $ref } from 'vue/macros';
  import {
    asyncCustomer,
    generateOptionFromArray,
    generateOptionFromTimeArray,
    handleRequest,
    toastSuccess,
  } from '@/store/utils/utils';
  import NotifyUnloadForm from '@/views/newViews/ContainerForecast/form/NotifyUnloadForm.vue';
  import NotifyFeeDialog from '@/views/newViews/ContainerForecast/form/NotifyFeeDialog.vue';
  import WarehouseInfoDialog from '@/views/newViews/ContainerForecast/form/WarehouseInfoDialog.vue';
  import ContainerForecastIndex from '@/views/newViews/ContainerForecast/form/ContainerForecastIndex.vue';
  import dayjs from 'dayjs';
  import UnloadingList from '@/views/newViews/ContainerForecast/form/UnloadingList.vue';
  import SelectedHeaderTable from '@/views/newViews/Missions/AlreadyWarehousing/SelectedHeaderTable.vue';
  import { getUserCustomerList, hasAuthPower } from '@/api/dataLayer/common/power';
  import NoPowerPage from '@/views/newViews/Common/NoPowerPage.vue';
  import ConfirmDialog from '@/views/newViews/Common/ConfirmDialog.vue';
  import FileSaver from 'file-saver';
  import {
    addOrUpdateNotify,
    deleteNotify,
    getNotifyListByFilter,
    getNotifyListByFilterWithPagination,
  } from '@/api/newDataLayer/Notify/Notify';
  import { getTableHeaderGroupItemList } from '@/api/newDataLayer/Header/HeaderGroup';
  import { addOrUpdateTask, getTaskListByNotifyId } from '@/api/newDataLayer/TaskList/TaskList';
  import { addOrUpdateTaskTimeLine } from '@/api/newDataLayer/TimeLine/TimeLine';
  import { useUserStore } from '@/store/modules/user';
  import {
    asyncCustomerWarehouseFormField,
    currentBaseImageUrl,
  } from '@/api/dataLayer/fieldDefination/common';
  import { useUploadDialog } from '@/store/modules/uploadFileState';
  import * as XLSX from 'xlsx';
  import {
    deleteInventoryLog,
    getInventoryUseLogListByNotifyId,
  } from '@/api/newDataLayer/Warehouse/UseLog';
  import SingleFilterBar from '@/views/bolita-views/composable/SingleFilterBar.vue';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import { allInStatusNotifyList } from '@/api/dataLayer/common/common';
  import { statusColumnSelect, timeColumn } from '@/views/bolita-views/composable/useableColumns';
  import { timeArrays } from '@/api/newDataLayer/Common/Common';
  import DetailGroupTaskDialog from '@/views/newViews/ContainerForecast/form/DetailGroupTaskDialog.vue';

  let notifyType: NotifyType = $ref(NotifyType.Container);
  let currentModel: any | null = $ref(null);
  let showCurrentHeaderDataTable = $ref(false);
  const showModal = ref(false);
  let showOperationTable = $ref(false);
  let currentNotifyId: string | null = $ref(null);
  let showWarehouseDialog = $ref(false);
  let showFeeDialog = $ref(false);
  let filterObj: any | null = $ref(null);
  let showUnloadingList = $ref(false);
  let currentHeader = $ref([]);
  let currentColumns = $ref([]);
  let dateRange = $ref(null);
  let showConfirmDialog = $ref(false);
  let cancelRecord = $ref('');
  let currentRecord = $ref({});
  let showAll = $ref(false);
  let showConfirmUnloading = $ref(false);
  let showNeedCheckDialog = $ref(false);
  let showDetailInfoDialog = $ref(false);
  let currentId = $ref([]);
  let dialogLoading = $ref(false);
  let selectedRow = $ref(null);
  let checkedRowKeys = $ref([]);

  const columns: DataTableColumns<any> = [
    {
      type: 'selection',
      fixed: 'left',
    },
    timeColumn('planArriveDateTime', '预计入库日期'),
    {
      title: '预计时间',
      key: 'inHouseTime',
      component: 'NSelect',
      componentProps: {
        options: generateOptionFromTimeArray(timeArrays),
      },
    },
    {
      title: '柜号',
      key: 'containerNo',
      width: 160,
      render(row) {
        return h(
          NButton,
          {
            size: 'small',
            text: true,
            type: 'primary',
            onClick: async () => {
              currentId = row.id;
              showDetailInfoDialog = true;
              currentModel = row;
            },
          },
          { default: () => row?.containerNo }
        );
      },
    },
    {
      title: '客户',
      key: 'customer.customerName',
    },
    {
      title: '仓库',
      key: 'inventory.name',
    },
    {
      title: '数量',
      key: 'arrivedCount',
    },
    statusColumnSelect({
      title: '状态',
      key: 'inStatus',
      list: generateOptionFromArray(allInStatusNotifyList),
    }),
    {
      title: '操作人',
      key: 'unloadPerson',
    },
    {
      title: '用户名',
      key: 'salesName',
    },
    {
      title: '备注',
      key: 'note',
    },
  ];

  const filters: FormField[] = [
    asyncCustomer(),
    {
      label: '柜号',
      field: 'containerNo',
    },
    {
      label: '状态',
      field: 'inStatus',
      component: 'NSelect',
      componentProps: {
        options: generateOptionFromArray(allInStatusNotifyList),
      },
    },
    asyncCustomerWarehouseFormField(),
    {
      field: 'planArriveDateTime',
      component: 'NDatePicker',
      label: '入库日期',
      componentProps: {
        type: 'daterange',
        clearable: true,
      },
    },
  ];

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

  function addTable(type: NotifyType) {
    notifyType = type;
    currentModel = null;
    showModal.value = true;
  }

  onMounted(async () => {
    await reloadHeader();
  });

  async function confirmUnloading() {
    try {
      // Get current user info
      const userInfo = useUserStore().info;

      // Update notify status and arrival time
      currentRecord.inStatus = '等待卸柜';
      currentRecord.arrivedInventoryTime = dayjs().valueOf();

      // Save notify changes
      const res = await addOrUpdateNotify(currentRecord);

      // Get and update all related tasks
      const list = await getTaskListByNotifyId(currentRecord.id);

      // Process each task in parallel
      const taskUpdates = list.map(async (item) => {
        // Update task status
        item.inStatus = '等待卸柜';
        await addOrUpdateTask(item);

        // Add timeline entry
        await addOrUpdateTaskTimeLine({
          useType: 'normal',
          bolitaTaskId: item.id,
          operator: userInfo?.realName,
          detailTime: dayjs().valueOf(),
          note: '仓库接收,等待卸柜',
        });
      });

      // Wait for all task updates to complete
      await Promise.all(taskUpdates);

      // Handle response and reload table
      await handleRequest(res, () => {
        toastSuccess('操作成功');
        reloadTable();
      });

      // Close confirmation dialog
      showConfirmUnloading = false;
    } catch (error) {
      console.error('操作失败:', error);
    }
  }

  let currentFilter = $ref([]);
  let notifyList = $ref([]);

  async function getCurrentFilter() {
    if (filterObj) {
      const filterOne = filterObj.filter((it) => it?.component !== 'NDatePicker');
      const filterTwo = filterObj.filter((it) => it?.component === 'NDatePicker');
      const filterWithOutDate = filterOne
        ? filterOne.map((filterItem) => ({
            field: filterItem.key,
            op: filterItem.value ? 'like' : '!=',
            value: `%${filterItem.value || ''}%`,
          }))
        : [];
      const filterWithDate = filterTwo
        ? filterTwo.map((filterItem) => ({
            field: filterItem.key,
            op: 'between',
            value: filterItem.value,
          }))
        : [];
      currentFilter = filterWithOutDate.concat(filterWithDate);
    }
    // Get customer list
    const customerId = await getUserCustomerList();

    // Add customer filter
    currentFilter.push({ field: 'customer.id', op: 'in', value: customerId });
  }

  const loadDataTable = async () => {
    // Build filter criteria
    await getCurrentFilter();

    // Get paginated data
    const res = await getNotifyListByFilterWithPagination(currentFilter, paginationReactive);
    let allList = res.content;
    const totalCount = res.page.totalElements;

    // Format count display
    allList.forEach((item) => {
      if (item.totalCount) {
        item.arrivedCount = `${item.arrivedCount}(${item.totalCount})`;
      }
    });

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

    // Sort and return results with fake items for pagination
    notifyList = fakeListStart.concat(allList.concat(fakeListEnd));
    return notifyList;
  };

  const actionRef = ref();

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  async function confirmCancel() {
    try {
      // Get current user info
      if (cancelRecord.inStatus === '等待审核') {
        await deleteNotify(cancelRecord.id);
        toastSuccess('取消成功');
        reloadTable();
      } else {
        const userInfo = useUserStore().info;

        // Update notify status
        cancelRecord.inStatus = '已取消';
        const res = await addOrUpdateNotify(cancelRecord);

        // Get and update all related tasks
        const list = await getTaskListByNotifyId(cancelRecord.id);

        const logId = (await getInventoryUseLogListByNotifyId(cancelRecord.id))[0]?.id;
        if (logId) {
          await deleteInventoryLog(logId);
        }
        // Process each task
        const taskUpdates = list.map(async (item) => {
          // Update task status
          item.inStatus = '已取消';
          await addOrUpdateTask(item);

          // Add timeline entry
          await addOrUpdateTaskTimeLine({
            useType: 'normal',
            bolitaTaskId: item.id,
            operator: userInfo?.realName,
            detailTime: dayjs().valueOf(),
            note: '取消',
          });
        });

        // Wait for all task updates to complete
        await Promise.all(taskUpdates);
        // Handle response and reload table
        await handleRequest(res, () => {
          toastSuccess('取消成功');
          reloadTable();
        });
      }

      // Close confirmation dialog
      showConfirmDialog = false;
    } catch (error) {
      console.error('取消失败:', error);
    }
  }

  async function downloadFbaCode() {
    window.open(
      currentBaseImageUrl + 'https://aaden-storage.s3.eu-central-1.amazonaws.com/FbaCode.xlsx'
    );
  }

  async function getAllNotifyByFilter() {
    await getCurrentFilter();

    // Get paginated data
    return await getNotifyListByFilter(currentFilter);
  }

  async function downloadData() {
    try {
      // Get filtered data
      const selectedList = await getAllNotifyByFilter();

      // Create a 2D array for Excel data
      const data = [];

      // Create header row from column titles (only include columns with titles)
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
              } else {
                row.push(item[col.key] || '');
              }
            } else {
              row.push('');
            }
          });
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
      FileSaver.saveAs(blob, '到货预报.xlsx');

      toastSuccess('下载成功');
    } catch (error) {
      console.error('下载失败:', error);
    }
  }

  async function reloadHeader() {
    try {
      // Reset columns
      currentColumns = [];

      // Get header configuration
      const headerConfig = await getTableHeaderGroupItemList('containerForecast');

      // Parse header items or use empty array if not found
      currentHeader = headerConfig ? JSON.parse(headerConfig.headerItemJson || '[]') : [];

      // Map header items to columns
      if (currentHeader.length > 0) {
        currentHeader.forEach((item) => {
          const matchedColumn = columns.find((col) => col.key === item.itemKey);
          if (matchedColumn) {
            currentColumns.push(matchedColumn);
          }
        });
      }

      // Add selection column if exists
      const selectionType = columns.find((col) => col.type === 'selection');
      if (selectionType) {
        currentColumns.unshift(selectionType);
      }

      // Use default columns if no custom columns defined
      if (currentColumns.length === 0) {
        currentColumns = [...columns];
      }
      currentColumns = currentColumns.filter((it) => it);
      // Make all columns resizable
      currentColumns.forEach((item) => {
        item.resizable = true;
      });

      // Close header selection dialog
      showCurrentHeaderDataTable = false;
    } catch (error) {
      console.error('加载表头失败:', error);
      currentColumns = [...columns]; // Fallback to default columns
    }
  }

  let selectedNotifyList = $ref([]);

  async function handleCheck(rowKeys) {
    checkedRowKeys = rowKeys;
    const currentPageSelected = notifyList.filter((item) => rowKeys.includes(item.id));
    // 合并到全局选中集合
    selectedNotifyList = [
      ...selectedNotifyList.filter(
        (item) => !notifyList.some((pageItem) => pageItem.id === item.id)
      ),
      ...currentPageSelected,
    ];
  }

  async function startEdit() {
    if (selectedNotifyList.length === 1) {
      currentModel = selectedNotifyList[0];
      showModal.value = true;
    }
  }

  function cancelButton() {
    cancelRecord = selectedNotifyList[0];
    showConfirmDialog = true;
  }

  const disableCancel = $computed(() => {
    return (
      selectedNotifyList.length !== 1 ||
      (userPowerType === '客户' && selectedNotifyList[0].inStatus !== '等待审核')
    );
  });

  function downloadFile() {
    currentModel = selectedNotifyList[0];
    const files = currentModel.files.split(',');
    window.open(files[0]);
  }

  function showUnloading() {
    currentNotifyId = selectedNotifyList[0].id;
    showUnloadingList = true;
  }

  async function showUnloadingPic() {
    currentModel = selectedNotifyList[0];
    const upload = useUploadDialog();
    const files = await upload.upload(currentModel['unloadingPic']);
    if (files.checkPassed) {
      currentModel.unloadingPic = files.files;
      await addOrUpdateNotify(currentModel);
    }
    await actionRef.value.reload();
  }

  async function uploadUnloadingForm() {
    currentModel = selectedNotifyList[0];
    const upload = useUploadDialog();
    const files = await upload.upload(currentModel['unloadingFile']);
    if (files.checkPassed) {
      currentModel.unloadingFile = files.files;
      await addOrUpdateNotify(currentModel);
    }
    await actionRef.value.reload();
  }

  async function checkContainerStatus() {
    if (selectedNotifyList[0]?.inStatus === InBoundStatus.Wait) {
      currentRecord = selectedNotifyList[0];
      showConfirmUnloading = true;
    } else if (selectedNotifyList[0]?.inStatus === InBoundStatus.WaitUnloading) {
      currentNotifyId = selectedNotifyList[0].id!;
      showOperationTable = true;
    } else if (selectedNotifyList[0]?.inStatus === InBoundStatus.WaitCheck) {
      showNeedCheckDialog = true;
    }
  }

  const disableUnloading = $computed(() => {
    return (
      selectedNotifyList.length !== 1 ||
      ![InBoundStatus.Wait, InBoundStatus.WaitUnloading, InBoundStatus.WaitCheck].includes(
        selectedNotifyList[0]?.inStatus
      )
    );
  });

  async function selectedHeader() {
    showCurrentHeaderDataTable = true;
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

  function reloadTable() {
    actionRef.value.reload();
    showOperationTable = false;
    showFeeDialog = false;
    showConfirmDialog = false;
    showConfirmUnloading = false;
  }

  async function closeAddDialog() {
    reloadTable();
    showModal.value = false;
  }

  function onRowClick(rowData) {
    selectedRow = rowData;
  }

  const userPowerType = $computed(() => {
    const userInfo = useUserStore().info;
    return userInfo?.userType;
  });
</script>

<style lang="less" scoped>
  .action-button {
    margin-right: 8px;
  }

  .action-wrapper {
    display: flex;
    align-items: center;
    background-color: #f5f7fa;
    padding: 4px 12px;
    border-radius: 4px;
    margin-left: 8px;
  }

  .action-title {
    font-weight: bold;
    margin-right: 12px;
    color: #606266;
    font-size: 14px;
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
  }

  /* Styles for action icons */
  :deep(.action-icon) {
    margin: 0 4px;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: none !important;
  }

  :deep(.n-icon) {
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: none !important;
  }

  :deep(.action-wrapper .n-button) {
    box-shadow: none !important;
  }

  :deep(.n-tooltip) {
    max-width: 200px;
    word-break: keep-all;
  }
</style>
