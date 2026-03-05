<template>
  <div>
    <n-card v-if="hasAuthPower('orderCarView')" :bordered="false" class="proCard">
      <single-filter-bar
        :form-fields="filters"
        @clear="updateFilter(null)"
        @submit="updateFilter"
      />
      <div class="mt-2">
        <n-button class="action-button" size="small" @click="downloadData"> 下载 </n-button>
        <n-button
          :disabled="selectedOutboundForecastList.length !== 1"
          class="action-button"
          size="small"
          @click="showLoadingList"
        >
          装车信息
        </n-button>
        <n-button
          :disabled="selectedOutboundForecastList.length !== 1"
          class="action-button"
          size="small"
          @click="uploadLoadingList"
        >
          上传装车单
        </n-button>
        <n-button
          :disabled="selectedOutboundForecastList.length !== 1"
          class="action-button"
          size="small"
          @click="LoadingListPic"
          >装车图片
        </n-button>
        <n-button
          :disabled="selectedOutboundForecastList.length !== 1"
          class="action-button"
          size="small"
          @click="editPod"
          >POD
        </n-button>
        <n-button
          :disabled="selectedOutboundForecastList.length !== 1"
          class="action-button"
          size="small"
          @click="showFinishConfirm"
          >完成
        </n-button>
      </div>
      <!-- Filter controls are now handled by FilterBar component -->
      <div class="my-2"></div>
      <BasicTable
        ref="actionRef"
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        @update:checked-row-keys="handleCheck"
        :pagination="paginationReactive"
        :request="loadDataTable"
        :row-key="(row) => row.id"
        @update:page="handlePageChange"
        @update:pageSize="handlePageSizeChange"
      />
      <n-modal
        v-model:show="loadingCarDialog"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 600px; max-width: 600px"
        title="装车信息"
      >
        <loading-car-list :outbound-info="currentInfo" @saved="saved" />
      </n-modal>
      <n-modal
        v-model:show="showFinishDialog"
        :show-icon="false"
        class="modal-small"
        preset="card"
        style="width: 600px"
        title="请确认"
      >
        <confirm-dialog :title="'确认该Ref已经完成？'" @saved="finishRef" />
      </n-modal>
    </n-card>
    <no-power-page v-else />
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import { BasicTable } from '@/components/Table';
  import { DataTableColumns, useMessage } from 'naive-ui';
  import { $ref } from 'vue/macros';
  import dayjs from 'dayjs';
  import { hasAuthPower } from '@/api/dataLayer/common/power';
  import NoPowerPage from '@/views/newViews/Common/NoPowerPage.vue';
  import FileSaver from 'file-saver';
  import { addOrUpdateOutboundForecast } from '@/api/newDataLayer/OutboundForecast/OutboundForecast';
  import * as XLSX from 'xlsx';
  import {
    statusColumnEasy,
    timeTableColumn,
  } from '@/views/bolita-views/composable/useableColumns';
  import SingleFilterBar from '@/views/bolita-views/composable/SingleFilterBar.vue';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import { generateOptionFromArray } from '@/store/utils/utils';
  import { allInStatusOperationList } from '@/api/dataLayer/common/common';
  import { createPaginationPlaceholders } from '@/api/newDataLayer/Common/Common';
  import { getOutboundForecastListByFilterWithPagination } from '@/api/newDataLayer/CarManage/CarManage';
  import { useUploadDialog } from '@/store/modules/uploadFileState';
  import LoadingCarList from '@/views/newViews/OperationDetail/NotOutbound/LoadingCarList.vue';
  import {
    getTaskListByIds,
    getTaskListByNotifyId,
    updateTask,
  } from '@/api/newDataLayer/TaskList/TaskList';
  import { addOrUpdateNotify, getNotifyById } from '@/api/newDataLayer/Notify/Notify';
  import ConfirmDialog from '@/views/newViews/Common/ConfirmDialog.vue';

  // Filters definition
  let filterObj: any | null = $ref(null);
  let currentModel: any | null = $ref(null);
  let currentInfo = $ref({});

  const filters: FormField[] = [
    {
      label: 'Ref',
      field: 'ref',
    },
    {
      label: '状态',
      field: 'inStatus',
      component: 'NSelect',
      componentProps: {
        options: generateOptionFromArray(allInStatusOperationList),
      },
    },
  ];

  // Table columns
  const columns: DataTableColumns<any> = [
    { type: 'selection' },
    { title: 'Ref', key: 'ref', minWidth: 140 },
    {
      title: '文件',
      key: 'filesDisplay',
      minWidth: 140,
    },
    { title: 'ISA', key: 'isa', minWidth: 140 },
    { title: '运单号', key: 'waybillId', minWidth: 140 },
    statusColumnEasy({ title: '状态', key: 'inStatus' }),
    { title: 'FC', key: 'fcAddress' },
    // { title: '地址', key: 'deliveryDetail' },
    { title: '出库方式', key: 'deliveryMethod', width: 100 },
    { title: '总托数', key: 'trayNum' },
    { title: '总件数', key: 'totalNumber' },
    { title: '邮编', key: 'postcode' },
    { title: '操作人', key: 'outOperatePerson' },
    timeTableColumn('reservationGetProductTime', '取货日期'),
    { title: '取货时间', key: 'reservationGetProductDetailTime', width: 100 },
  ].map((it) => {
    it.resizable = true;
    return it;
  });

  // Pagination
  const paginationReactive = reactive({
    defaultPage: 1,
    pageNumber: 0,
    pageSize: 10,
    defaultPageSize: 10,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    onChange: (page: number) => {
      paginationReactive.pageNumber = page - 1;
    },
    onUpdatePageSize: (pageSize: number) => {
      paginationReactive.pageSize = pageSize;
      paginationReactive.pageNumber = 0;
    },
  });

  // Filters current value
  let currentFilter = $ref([]);
  async function getCurrentFilter() {
    currentFilter = [];
    if (filterObj) currentFilter = filterObj;
    // currentFilter['inStatusIn'] = ['已定车', '无需定车'];
  }

  // Table data and selection
  let outboundForecastList = $ref([]);
  let selectedOutboundForecastList = $ref([]);
  let checkedRowKeys = $ref([]);

  function handleCheck(rowKeys) {
    checkedRowKeys = rowKeys;
    const currentPageSelected = outboundForecastList.filter((item) => rowKeys.includes(item.id));
    selectedOutboundForecastList = [
      ...selectedOutboundForecastList.filter(
        (item) => !outboundForecastList.some((pageItem) => pageItem.id === item.id)
      ),
      ...currentPageSelected,
    ];
  }

  const loadDataTable = async () => {
    await getCurrentFilter();
    const res = await getOutboundForecastListByFilterWithPagination(
      currentFilter,
      paginationReactive
    );
    const allList = res.rows.map((it) => {
      let filesStatus = '';
      if (it.loadingCarDoc) {
        filesStatus = filesStatus + '装车单';
      }
      if (it.pickupFiles) {
        filesStatus = filesStatus + ' | 装车图片';
      }
      if (it.podFiles) {
        filesStatus = filesStatus + ' | POD';
      }
      it.filesDisplay = filesStatus;
      return it;
    });
    const totalCount = res.totalRowCount;
    const { fakeListStart, fakeListEnd } = createPaginationPlaceholders(
      paginationReactive.pageNumber,
      paginationReactive.pageSize,
      totalCount
    );
    outboundForecastList = [...fakeListStart, ...allList, ...fakeListEnd];
    return outboundForecastList;
  };

  const actionRef = ref();

  async function getAllOutboundForecastByFilter() {
    await getCurrentFilter();
    const res = await getOutboundForecastListByFilterWithPagination(
      currentFilter,
      paginationReactive
    );
    return res.rows;
  }

  // Export
  async function downloadData() {
    try {
      const selectedList = await getAllOutboundForecastByFilter();
      const data: any[] = [];
      const headers = columns.filter((it) => it.title).map((it) => it.title);
      data.push(headers);

      selectedList.forEach((item) => {
        const row: any[] = [];
        columns
          .filter((col) => col.title)
          .forEach((col) => {
            if (col.key && (col.key as string).includes('.')) {
              const keys = (col.key as string).split('.');
              let value: any = item;
              for (const key of keys) value = value && value[key];
              row.push(value ?? '');
            } else if (col.key) {
              if ((col.key as string) === 'createTimestamp' && item[col.key as string]) {
                row.push(dayjs(item[col.key as string]).format('YYYY-MM-DD'));
              } else if (
                (col.key as string) === 'reservationGetProductTime' &&
                item[col.key as string]
              ) {
                row.push(dayjs(item[col.key as string]).format('YYYY-MM-DD'));
              } else {
                row.push(item[col.key as string] ?? '');
              }
            } else {
              row.push('');
            }
          });
        const hasValue = row.some((v) => v !== '' && v !== null && v !== undefined);
        if (hasValue) data.push(row);
      });

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      FileSaver.saveAs(blob, '定车管理.xlsx');
    } catch (error) {
      console.error('下载失败:', error);
    }
  }

  // Finish Ref
  let showFinishDialog = $ref(false);
  function showFinishConfirm() {
    showFinishDialog = true;
  }
  const message = useMessage();

  async function finishRef() {
    const editInfo = Object.assign({}, selectedOutboundForecastList[0]);
    editInfo.inStatus = '已完成';
    const taskList = await getTaskListByIds(editInfo.bolitaTaskIds);

    const exceptionTasks = taskList.filter((task) => task.inStatus === '异常');
    if (exceptionTasks.length > 0) {
      message.error('当前Ref有异常明细！');
      return;
    }

    await addOrUpdateOutboundForecast(editInfo);
    for (const currentTask of taskList) {
      currentTask.inStatus = '已完成';
      await updateTask(currentTask);
      const allTask = await getTaskListByNotifyId(currentTask.notifyId);
      const alreadyDoneTask = allTask.filter((it) => it.inStatus === '已完成');
      const notify = await getNotifyById(currentTask.notifyId);
      notify.inStatus = alreadyDoneTask.length === allTask.length ? '全部出库' : '部分出库';
      await addOrUpdateNotify(notify);
    }
    reloadTable();
  }

  // Filters update
  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  // Dialogs
  let loadingCarDialog = $ref(false);
  function showLoadingList() {
    currentInfo = selectedOutboundForecastList[0];
    loadingCarDialog = true;
  }

  // Upload helpers
  async function handleFileUpload(fieldName: string) {
    if (selectedOutboundForecastList.length !== 1) return;

    currentModel = selectedOutboundForecastList[0];
    const upload = useUploadDialog();
    const files = await upload.upload(currentModel[fieldName]);

    if (files.checkPassed) {
      currentModel[fieldName] = files.files;
      if (fieldName === 'pickupFiles') {
        currentModel.inStatus = '已完成';
        const taskList = await getTaskListByIds(currentModel.bolitaTaskIds);
        for (const currentTask of taskList) {
          currentTask.inStatus = '已完成';
          await updateTask(currentTask);
          const allTask = await getTaskListByNotifyId(currentTask.notifyId);
          const alreadyDoneTask = allTask.filter((it) => it.inStatus === '已完成');
          const notify = await getNotifyById(currentTask.notifyId);
          notify.inStatus = alreadyDoneTask.length === allTask.length ? '全部出库' : '部分出库';
          await addOrUpdateNotify(notify);
        }
      }
      await addOrUpdateOutboundForecast(currentModel);
    }

    await actionRef.value.reload();
  }

  async function uploadLoadingList() {
    await handleFileUpload('loadingCarDoc');
  }
  async function LoadingListPic() {
    await handleFileUpload('pickupFiles');
  }
  async function editPod() {
    await handleFileUpload('podFiles');
  }

  // Pagination handlers
  function handlePageChange(page: number) {
    paginationReactive.pageNumber = page - 1;
    reloadTable();
  }
  function handlePageSizeChange(pageSize: number) {
    paginationReactive.pageSize = pageSize;
    paginationReactive.pageNumber = 0;
    reloadTable();
  }

  // Reload table and reset state
  function reloadTable() {
    actionRef.value.reload();
    loadingCarDialog = false;
    showFinishDialog = false;
    selectedOutboundForecastList = [];
    checkedRowKeys = [];
  }

  function saved() {
    reloadTable();
  }
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
