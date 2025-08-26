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
        <!--        <n-button class="action-button" size="small" type="info" @click="selectedHeader">-->
        <!--          表头显示-->
        <!--        </n-button>-->
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
        :columns="columns"
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
  // Vue core imports
  import { h, onMounted, reactive, ref } from 'vue';
  import { $ref } from 'vue/macros';

  // Third-party libraries
  import dayjs from 'dayjs';
  import FileSaver from 'file-saver';
  import * as XLSX from 'xlsx';

  // UI components
  import { DataTableColumns, NButton } from 'naive-ui';
  import { BasicTable } from '@/components/Table';
  import SingleFilterBar from '@/views/bolita-views/composable/SingleFilterBar.vue';

  // Form components
  import NotifyUnloadForm from '@/views/newViews/ContainerForecast/form/NotifyUnloadForm.vue';
  import NotifyFeeDialog from '@/views/newViews/ContainerForecast/form/NotifyFeeDialog.vue';
  import WarehouseInfoDialog from '@/views/newViews/ContainerForecast/form/WarehouseInfoDialog.vue';
  import ContainerForecastIndex from '@/views/newViews/ContainerForecast/form/ContainerForecastIndex.vue';
  import UnloadingList from '@/views/newViews/ContainerForecast/form/UnloadingList.vue';
  import SelectedHeaderTable from '@/views/newViews/Missions/AlreadyWarehousing/SelectedHeaderTable.vue';
  import NoPowerPage from '@/views/newViews/Common/NoPowerPage.vue';
  import ConfirmDialog from '@/views/newViews/Common/ConfirmDialog.vue';
  import DetailGroupTaskDialog from '@/views/newViews/ContainerForecast/form/DetailGroupTaskDialog.vue';

  // Data and API
  import { InBoundStatus, NotifyType } from '@/api/dataLayer/modules/notify/notify-api';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import { allInStatusNotifyList } from '@/api/dataLayer/common/common';
  import { statusColumnSelect, timeColumn } from '@/views/bolita-views/composable/useableColumns';
  import { createPaginationPlaceholders, timeArrays } from '@/api/newDataLayer/Common/Common';
  import {
    asyncCustomer,
    generateOptionFromArray,
    generateOptionFromTimeArray,
    handleRequest,
    toastSuccess,
  } from '@/store/utils/utils';
  import { getUserCustomerList, hasAuthPower } from '@/api/dataLayer/common/power';
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
  import {
    deleteInventoryLog,
    getInventoryUseLogListByNotifyId,
  } from '@/api/newDataLayer/Warehouse/UseLog';

  // Table state
  const actionRef = ref();
  let currentColumns = $ref([]);
  let currentHeader = $ref([]);
  let checkedRowKeys = $ref([]);
  let selectedNotifyList = $ref([]);
  let notifyList = $ref([]);

  // Modal visibility state
  const showModal = ref(false);
  let showCurrentHeaderDataTable = $ref(false);
  let showOperationTable = $ref(false);
  let showWarehouseDialog = $ref(false);
  let showFeeDialog = $ref(false);
  let showUnloadingList = $ref(false);
  let showConfirmDialog = $ref(false);
  let showConfirmUnloading = $ref(false);
  let showNeedCheckDialog = $ref(false);
  let showDetailInfoDialog = $ref(false);

  // Form and data state
  let notifyType: NotifyType = $ref(NotifyType.Container);
  let currentModel: any | null = $ref(null);
  let currentNotifyId: string | null = $ref(null);
  let currentId = $ref([]);
  let cancelRecord = $ref('');
  let currentRecord = $ref({});

  // Filter state
  let filterObj: any | null = $ref(null);
  let currentFilter = $ref([]);

  const columns: DataTableColumns<any> = [
    {
      type: 'selection',
      fixed: 'left',
      key: 'selection',
      width: 50,
    },
    {
      title: '柜号',
      key: 'containerNo',
      fixed: 'left',
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
      fixed: 'left',
      key: 'customer.customerName',
    },
    timeColumn('planArriveDateTime', '预计入库日期'),
    {
      title: '预计时间',
      key: 'inHouseTime',
      component: 'NSelect',
      width: 160,
      componentProps: {
        options: generateOptionFromTimeArray(timeArrays),
      },
    },

    {
      title: '仓库',
      key: 'inventory.name',
    },
    {
      title: '数量',
      key: 'arrivedCount',
      width: 160,
    },
    statusColumnSelect({
      title: '状态',
      key: 'inStatus',
      list: generateOptionFromArray(allInStatusNotifyList),
    }),
    {
      title: '卸柜人',
      key: 'unloadPerson',
    },
    {
      title: '创建人',
      key: 'salesName',
    },
    {
      title: '最后修改',
      key: 'lastModifierName',
      width: 100,
    },
    {
      title: '备注',
      key: 'note',
      width: 160,
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

  /**
   * Opens the dialog to add a new container forecast
   * @param {NotifyType} type - The type of notification to create
   */
  function addTable(type: NotifyType) {
    notifyType = type;
    currentModel = null;
    showModal.value = true;
  }

  // Initialize component when mounted
  onMounted(async () => {
    await reloadHeader();
  });

  /**
   * Confirms container unloading process
   * Updates the notification status and all related tasks
   * Creates timeline entries for tracking
   */
  async function confirmUnloading() {
    try {
      // Get current user info
      const userInfo = useUserStore().info;

      // Update notify status and arrival time
      currentRecord.inStatus = '等待卸柜';
      currentRecord.arrivedInventoryTime = dayjs().format('YYYY-MM-DDTHH:mm:ss');

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
          detailTime: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
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

  /**
   * Build the complete filter criteria from user inputs and system requirements
   */
  async function getCurrentFilter() {
    // Reset current filter
    currentFilter = [];

    if (filterObj) {
      currentFilter = filterObj;
      const customerId = await getUserCustomerList();
      if (!filterObj['customer.id']) {
        currentFilter['customerIds'] = customerId;
      } else {
        currentFilter['customerIds'] = [filterObj['customer.id']];
      }
      if (filterObj['inventory.id']) {
        currentFilter['inventoryIds'] = [filterObj['inventory.id']];
      }
      if (filterObj['planArriveDateTime']) {
        currentFilter['minPlanArriveDateTime'] =
          dayjs(filterObj['planArriveDateTime'][0]).format('YYYY-MM-DD') + 'T00:00:00';
        currentFilter['maxPlanArriveDateTime'] =
          dayjs(filterObj['planArriveDateTime'][1]).format('YYYY-MM-DD') + 'T23:59:59';
      }
    }
    console.log(currentFilter, 'currentFilter');
  }

  /**
   * Loads data for the table with pagination support
   * @returns Array of data items for display
   */
  const loadDataTable = async () => {
    // Build filter criteria
    await getCurrentFilter();

    // Get paginated data
    const res = await getNotifyListByFilterWithPagination(currentFilter, paginationReactive);
    const allList = res.rows;
    const totalCount = res.totalRowCount;

    // Process data if needed

    // Create pagination placeholders
    const { fakeListStart, fakeListEnd } = createPaginationPlaceholders(
      paginationReactive.pageNumber,
      paginationReactive.pageSize,
      totalCount
    );

    // Combine real data with placeholders
    notifyList = [...fakeListStart, ...allList, ...fakeListEnd];
    return notifyList;
  };

  function updateFilter(value) {
    filterObj = value;
    console.log(filterObj, 'filterObj');
    reloadTable();
  }

  /**
   * Confirms cancellation of a container forecast
   * Handles different cancellation flows based on current status
   * Updates all related tasks and inventory logs
   */
  async function confirmCancel() {
    try {
      // For items in review status, simply delete the notification
      if (cancelRecord.inStatus === '等待审核') {
        await deleteNotify(cancelRecord.id);
        toastSuccess('取消成功');
        reloadTable();
      }
      // For other statuses, mark as cancelled and update related records
      else {
        const userInfo = useUserStore().info;

        // Update notify status
        cancelRecord.inStatus = '已取消';
        const res = await addOrUpdateNotify(cancelRecord);

        // Get and update all related tasks
        const list = await getTaskListByNotifyId(cancelRecord.id);

        // Clean up inventory logs
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
            detailTime: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
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

  /**
   * Extracts a value from an object using a dot-notation path
   * @param {Object} obj - The source object
   * @param {string} path - Dot-notation path (e.g., 'customer.name')
   * @returns {*} The extracted value or empty string if not found
   */
  function getNestedValue(obj, path) {
    if (!path) return '';

    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
      value = value && value[key];
      if (value === undefined || value === null) return '';
    }

    return value;
  }

  /**
   * Prepares data for Excel export
   * @param {Array} dataList - List of data objects
   * @param {Array} columnDefs - Column definitions
   * @returns {Array} 2D array ready for Excel export
   */
  function prepareExcelData(dataList, columnDefs) {
    // Create a 2D array for Excel data
    const data = [];

    // Create header row from column titles (only include columns with titles)
    const columnsWithTitles = columnDefs.filter((col) => col.title);
    const headers = columnsWithTitles.map((col) => col.title);
    data.push(headers);

    // Add data rows
    dataList.forEach((item) => {
      const row = [];

      columnsWithTitles.forEach((col) => {
        if (!col.key) {
          row.push('');
          return;
        }

        // Handle nested properties like 'customer.customerName'
        if (col.key.includes('.')) {
          row.push(getNestedValue(item, col.key));
        }
        // Handle date fields
        else if (col.key === 'planArriveDateTime' && item[col.key]) {
          row.push(dayjs(item[col.key]).format('YYYY-MM-DD'));
        }
        // Handle regular fields
        else {
          row.push(item[col.key] || '');
        }
      });

      // Only add rows that have at least one non-empty value
      const hasValue = row.some((value) => value !== '' && value !== null && value !== undefined);
      if (hasValue) {
        data.push(row);
      }
    });

    return data;
  }

  /**
   * Downloads table data as Excel file
   */
  async function downloadData() {
    try {
      // Get filtered data
      const selectedList = await getAllNotifyByFilter();

      // Prepare data for Excel
      const excelData = prepareExcelData(selectedList, columns);

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(excelData);

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

  /**
   * Loads and configures table headers based on saved configuration
   * Handles fallback to default columns if configuration is missing or invalid
   */
  async function reloadHeader() {
    try {
      // Reset columns
      currentColumns = [];

      // Get header configuration from backend
      const headerConfig = await getTableHeaderGroupItemList('containerForecast');

      // Parse header items or use empty array if not found
      currentHeader = headerConfig ? JSON.parse(headerConfig.headerItemJson || '[]') : [];

      // Map header items to columns if configuration exists
      if (currentHeader.length > 0) {
        currentHeader.forEach((item) => {
          const matchedColumn = columns.find((col) => col.key === item.itemKey);
          if (matchedColumn) {
            currentColumns.push(matchedColumn);
          }
        });
      }

      // Add selection column if exists (always show at the beginning)
      const selectionType = columns.find((col) => col.type === 'selection');
      if (selectionType) {
        currentColumns.unshift(selectionType);
      }

      // Use default columns if no custom columns defined or if configuration is invalid
      if (currentColumns.length === 0) {
        currentColumns = [...columns];
      }

      // Remove any undefined columns
      currentColumns = currentColumns.filter((it) => it);

      // Make all columns resizable for better user experience
      currentColumns.forEach((item) => {
        item.resizable = true;
      });

      // Close header selection dialog if open
      showCurrentHeaderDataTable = false;
    } catch (error) {
      console.error('加载表头失败:', error);
      // Fallback to default columns in case of error
      currentColumns = [...columns];
    }
  }

  // selectedNotifyList is already declared in the grouped variables section

  /**
   * Handles row selection in the table
   * Maintains selection state across pagination
   * @param {Array} rowKeys - Array of selected row keys
   */
  async function handleCheck(rowKeys) {
    // Update the checked keys in the table
    checkedRowKeys = rowKeys;

    // Get the selected items from the current page
    const currentPageSelected = notifyList.filter((item) => rowKeys.includes(item.id));

    // Merge with global selection, removing any items from current page that are no longer selected
    selectedNotifyList = [
      // Keep previously selected items that are not on the current page
      ...selectedNotifyList.filter(
        (item) => !notifyList.some((pageItem) => pageItem.id === item.id)
      ),
      // Add newly selected items from current page
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

  /**
   * Handles file upload for a specific field in the current model
   * @param {string} fieldName - The field name to update with uploaded files
   * @returns {Promise<void>}
   */
  async function handleFileUpload(fieldName) {
    if (selectedNotifyList.length !== 1) return;

    currentModel = selectedNotifyList[0];
    const upload = useUploadDialog();
    const files = await upload.upload(currentModel[fieldName]);

    if (files.checkPassed) {
      currentModel[fieldName] = files.files;
      await addOrUpdateNotify(currentModel);
    }

    await actionRef.value.reload();
  }

  /**
   * Shows dialog to upload unloading pictures
   */
  async function showUnloadingPic() {
    await handleFileUpload('unloadingPic');
  }

  /**
   * Shows dialog to upload unloading form
   */
  async function uploadUnloadingForm() {
    await handleFileUpload('unloadingFile');
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

  // This function was redundant with updateFilter and has been removed

  function handlePageChange(page: number) {
    paginationReactive.pageNumber = page - 1;
    reloadTable();
  }

  function handlePageSizeChange(pageSize: number) {
    paginationReactive.pageSize = pageSize;
    paginationReactive.pageNumber = 0;
    reloadTable();
  }

  /**
   * Reloads the table data and resets dialog states
   * Called after operations that modify data to refresh the view
   */
  function reloadTable() {
    // Reload table data
    actionRef.value.reload();

    // Reset all operation dialogs
    showOperationTable = false;
    showFeeDialog = false;
    showConfirmDialog = false;
    showConfirmUnloading = false;
    checkedRowKeys = [];
    selectedNotifyList = [];
  }

  async function closeAddDialog() {
    reloadTable();
    showModal.value = false;
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
