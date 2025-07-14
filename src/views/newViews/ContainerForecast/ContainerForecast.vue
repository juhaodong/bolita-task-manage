<template>
  <div>
    <n-card v-if="hasAuthPower('forecastView')" :bordered="false" class="proCard">
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
        <n-button
          v-if="hasAuthPower('forecastAdd')"
          class="action-button"
          size="small"
          type="primary"
          @click="addTable(NotifyType.Container)"
        >
          <template #icon>
            <n-icon>
              <Box20Filled />
            </n-icon>
          </template>
          新建货柜预报
        </n-button>
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
        <n-button class="action-button" size="small" type="warning" @click="downloadFbaCode">
          <template #icon>
            <n-icon>
              <DocumentPdf20Regular />
            </n-icon>
          </template>
          下载FBACode
        </n-button>
      </div>
      <BasicTable
        ref="actionRef"
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
        :style="{ maxWidth: notifyType === NotifyType.TrayOrBox ? '1600px' : '800px' }"
        class="modal-large"
        preset="card"
        title="新建货柜预报"
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
        title="请确认"
      >
        <confirm-dialog :title="'您确定要取消吗？'" @saved="confirmCancel" />
      </n-modal>
      <n-modal
        v-model:show="showConfirmUnloading"
        :show-icon="false"
        class="modal-small"
        preset="card"
        title="请确认"
      >
        <confirm-dialog :title="'确认货柜到库？'" @saved="confirmUnloading" />
      </n-modal>
      <n-modal
        v-model:show="showNeedCheckDialog"
        :show-icon="false"
        class="modal-small"
        preset="card"
        title="请确认"
      >
        <confirm-dialog :title="'请先审核完所有任务！'" @saved="showNeedCheckDialog = false" />
      </n-modal>
    </n-card>
    <no-power-page v-else />
  </div>
</template>

<script lang="ts" setup>
  import { h, onMounted, reactive, ref } from 'vue';
  import { NIcon, NTooltip } from 'naive-ui';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns } from './columns';
  import {
    ArrowDownload20Regular,
    ArrowUpload20Regular,
    Box20Filled,
    Delete20Regular,
    Document20Regular,
    DocumentAdd20Regular,
    DocumentEdit20Regular,
    DocumentPdf20Regular,
    Image20Regular,
    Payment20Regular,
    TableSettings20Regular,
  } from '@vicons/fluent';
  import { CashStatus, InBoundStatus, NotifyType } from '@/api/dataLayer/modules/notify/notify-api';
  import { $ref } from 'vue/macros';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { handleRequest, toastSuccess } from '@/store/utils/utils';
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
    getNotifyListByFilterWithPagination,
  } from '@/api/newDataLayer/Notify/Notify';
  import { getTableHeaderGroupItemList } from '@/api/newDataLayer/Header/HeaderGroup';
  import { addOrUpdateTask, getTaskListByNotifyId } from '@/api/newDataLayer/TaskList/TaskList';
  import { addOrUpdateTaskTimeLine } from '@/api/newDataLayer/TimeLine/TimeLine';
  import { useUserStore } from '@/store/modules/user';
  import { currentBaseImageUrl } from '@/api/dataLayer/fieldDefination/common';
  import { useUploadDialog } from '@/store/modules/uploadFileState';
  import * as XLSX from 'xlsx';

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
  let filterItems = $ref<Array<{ option: string; value: string }>>([]);

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
  const loadDataTable = async () => {
    // Build filter criteria
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

    // Get customer list
    const customerId = await getUserCustomerList();

    // Add customer filter
    currentFilter.push({ field: 'customer.id', op: 'in', value: customerId });

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
    return fakeListStart.concat(allList.concat(fakeListEnd));
  };

  const actionRef = ref();

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  async function confirmCancel() {
    try {
      // Get current user info
      const userInfo = useUserStore().info;

      // Update notify status
      cancelRecord.inStatus = '已取消';
      const res = await addOrUpdateNotify(cancelRecord);

      // Get and update all related tasks
      const list = await getTaskListByNotifyId(cancelRecord.id);

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

  async function downloadData() {
    try {
      // Get filtered data
      const selectedList = await loadDataTable();

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

  async function startEdit(record) {
    currentModel = record;
    showModal.value = true;
  }

  async function checkContainerStatus(record) {
    if (record?.inStatus === InBoundStatus.Wait) {
      currentRecord = record;
      showConfirmUnloading = true;
    } else if (record?.inStatus === InBoundStatus.WaitUnloading) {
      currentNotifyId = record.id!;
      showOperationTable = true;
    } else if (record?.inStatus === InBoundStatus.WaitCheck) {
      showNeedCheckDialog = true;
    }
  }

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
    width: 200,
    render(record: any) {
      const iconFileAction = (label, key, icon, power) => {
        return {
          icon: renderIconWithTooltip(icon, label),
          onClick: async () => {
            try {
              const upload = useUploadDialog();
              const files = await upload.upload(record[key]);
              if (files.checkPassed) {
                record[key] = files.files;
                await addOrUpdateNotify(record);
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
              startEdit(record);
            },
            ifShow: () => {
              return hasAuthPower('forecastEdit');
            },
          },
          iconFileAction('上传卸柜单', 'unloadingFile', ArrowUpload20Regular, 'forecastUpload'),
          {
            icon: renderIconWithTooltip(DocumentAdd20Regular, '生成卸柜单'),
            onClick() {
              currentNotifyId = record.id!;
              showUnloadingList = true;
            },
            ifShow: () => {
              return hasAuthPower('forecastCreatFile') && !record?.unloadingFile;
            },
          },
          {
            icon: renderIconWithTooltip(Box20Filled, '卸柜'),
            onClick() {
              checkContainerStatus(record);
            },
            highlight: () => {
              if (
                record?.inStatus === InBoundStatus.WaitCheck ||
                record?.inStatus === InBoundStatus.Wait
              ) {
                return 'error';
              } else if (record?.inStatus === InBoundStatus.WaitUnloading) {
                return 'info';
              } else {
                return 'success';
              }
            },
            ifShow: () => {
              return hasAuthPower('forecastDownload');
            },
          },
          {
            icon: renderIconWithTooltip(Image20Regular, '卸柜照片'),
            highlight: () => {
              return record?.['unloadingPic']?.length > 0 ? 'success' : 'error';
            },
            async onClick() {
              const upload = useUploadDialog();
              const files = await upload.upload(record['unloadingPic']);
              if (files.checkPassed) {
                record.unloadingPic = files.files;
                await addOrUpdateNotify(record);
              }
              await actionRef.value.reload();
            },
            ifShow: () => {
              return hasAuthPower('outMissionUploadFile');
            },
          },
          {
            icon: renderIconWithTooltip(Document20Regular, '预报文件'),
            onClick() {
              const files = record.files.split(',');
              window.open(files[0]);
            },
          },
          {
            icon: renderIconWithTooltip(Delete20Regular, '取消'),
            async onClick() {
              cancelRecord = record;
              showConfirmDialog = true;
            },
            ifShow: () => {
              return hasAuthPower('forecastCancel');
            },
          },
          {
            icon: renderIconWithTooltip(Payment20Regular, '结算'),
            highlight: () => {
              if (record?.editValue?.cashStatus == CashStatus.Done) {
                return 'success';
              }
            },
            ifShow: () => {
              return hasAuthPower('forecastSettle');
            },
            onClick() {
              currentNotifyId = record.id!;
              showFeeDialog = true;
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
