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
        v-model:show="carDialog"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 600px; max-width: 600px"
        title="定车信息"
      >
        <booking-car-dialog :info="currentInfo" @saved="saved" />
      </n-modal>
      <n-modal
        v-model:show="loadingCarDialog"
        :show-icon="false"
        preset="card"
        style="width: 90%; min-width: 600px; max-width: 600px"
        title="装车单"
      >
        <loading-car-list :outbound-info="currentInfo" @saved="saved" />
      </n-modal>
    </n-card>
    <no-power-page v-else />
  </div>
</template>

<script lang="ts" setup>
  import { computed, h, reactive, ref } from 'vue';
  import { BasicTable } from '@/components/Table';
  import { DataTableColumns, NButton, NIcon, NTooltip } from 'naive-ui';
  import { $ref } from 'vue/macros';
  import { CarpoolManager } from '@/api/dataLayer/modules/logistic/carpool';
  import { useUserStore } from '@/store/modules/user';
  import dayjs from 'dayjs';
  import { hasAuthPower } from '@/api/dataLayer/common/power';
  import NoPowerPage from '@/views/newViews/Common/NoPowerPage.vue';
  import FileSaver from 'file-saver';
  import { addOrUpdateOutboundForecast } from '@/api/newDataLayer/OutboundForecast/OutboundForecast';
  import BookingCarDialog from '@/views/newViews/CarpoolManagement/dialog/BookingCarDialog.vue';
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

  const showModal = ref(false);

  let filterObj: any | null = $ref(null);
  let currentModel: any | null = $ref(null);
  let paymentDialogShow: boolean = $ref(false);
  let selectedMonth: any | null = $ref('');
  let monthTab: any | null = $ref(null);
  let editOutboundForecast = $ref(false);
  let showShareCarModel = $ref(false);
  let typeName = $ref('');
  let editId = $ref('');
  let allList = $ref([]);
  let showAll = $ref(false);
  let dateRange = $ref(null);
  let currentInfo = $ref({});
  let offerDialog = $ref(false);
  let carDialog = $ref(false);
  let filterItems = $ref<Array<{ option: string; value: string }>>([]);
  let showDetailInfoDialog = $ref(false);
  let currentIds = $ref([]);
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

  const columns: DataTableColumns<any> = [
    {
      type: 'selection',
    },
    {
      title: 'Ref',
      key: 'ref',
    },
    {
      title: 'ISA',
      key: 'isa',
    },
    {
      title: '运单号',
      key: 'waybillId',
    },
    statusColumnEasy({
      title: '状态',
      key: 'inStatus',
    }),
    {
      title: 'FC',
      key: 'fcAddress',
    },
    // {
    //   title: '地址',
    //   key: 'deliveryDetail',
    // },
    {
      title: '出库方式',
      key: 'deliveryMethod',
      width: 100,
    },
    {
      title: '运单号',
      key: 'waybillId',
    },
    {
      title: '总托数',
      key: 'trayNum',
    },
    {
      title: '总件数',
      key: 'totalNumber',
    },
    {
      title: '邮编',
      key: 'postcode',
    },
    {
      title: '操作人',
      key: 'outOperatePerson',
    },
    timeTableColumn('reservationGetProductTime', '取货日期'),
    {
      title: '取货时间',
      key: 'reservationGetProductDetailTime',
      width: 100,
    },
  ].map((it) => {
    it.resizable = true;
    return it;
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
      // reloadTable() is called by handlePageChange, no need to call it here
    },
    onUpdatePageSize: (pageSize: number) => {
      paginationReactive.pageSize = pageSize;
      paginationReactive.pageNumber = 0;
      // Let the BasicTable component handle the data fetching
    },
  });

  let currentFilter = $ref([]);

  async function getCurrentFilter() {
    // Reset current filter
    currentFilter = [];

    if (filterObj) {
      currentFilter = filterObj;
    }
    currentFilter['inStatusIn'] = ['已定车', '无需定车'];
  }

  let outboundForecastList = $ref([]);

  let selectedOutboundForecastList = $ref([]);
  let checkedRowKeys = $ref([]);

  function handleCheck(rowKeys) {
    // Update the checked keys in the table
    checkedRowKeys = rowKeys;

    // Get the selected items from the current page
    const currentPageSelected = outboundForecastList.filter((item) => rowKeys.includes(item.id));

    // Merge with global selection, removing any items from current page that are no longer selected
    selectedOutboundForecastList = [
      // Keep previously selected items that are not on the current page
      ...selectedOutboundForecastList.filter(
        (item) => !outboundForecastList.some((pageItem) => pageItem.id === item.id)
      ),
      // Add newly selected items from current page
      ...currentPageSelected,
    ];
  }

  const loadDataTable = async () => {
    // Build filter criteria
    await getCurrentFilter();

    // Get paginated data
    const res = await getOutboundForecastListByFilterWithPagination(
      currentFilter,
      paginationReactive
    );
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
    outboundForecastList = [...fakeListStart, ...allList, ...fakeListEnd];
    return outboundForecastList;
  };
  const actionRef = ref();
  let showConfirmCancelDialog = $ref(false);

  async function downloadData() {
    try {
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
              if (col.key === 'createTimestamp' && item[col.key]) {
                row.push(dayjs(item[col.key]).format('YYYY-MM-DD'));
              } else if (col.key === 'reservationGetProductTime' && item[col.key]) {
                row.push(dayjs(item[col.key]).format('YYYY-MM-DD'));
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

      // Add data rows - filter out any rows with all empty values

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(data);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

      // Save file
      FileSaver.saveAs(blob, '定车管理.xlsx');
    } catch (error) {
      console.error('下载失败:', error);
    }
  }

  function updateFilter(value) {
    filterObj = value;
    if (value === null) {
      dateRange = null;
    }
    reloadTable();
  }

  function updateFilterWithItems(value) {
    filterObj = value;
    reloadTable();
  }

  let loadingCarDialog = $ref(false);

  function showLoadingList() {
    currentInfo = selectedOutboundForecastList[0];
    loadingCarDialog = true;
  }

  async function handleFileUpload(fieldName) {
    if (selectedOutboundForecastList.length !== 1) return;

    currentModel = selectedOutboundForecastList[0];
    const upload = useUploadDialog();
    const files = await upload.upload(currentModel[fieldName]);

    if (files.checkPassed) {
      currentModel[fieldName] = files.files;
      await addOrUpdateOutboundForecast(currentModel);
    }

    await actionRef.value.reload();
  }

  async function uploadLoadingList() {
    await handleFileUpload('loadingCarDoc');
  }

  async function LoadingListPic() {
    await handleFileUpload('unloadingFile');
  }

  async function editPod() {
    await handleFileUpload('podFiles');
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
    showModal.value = false;
    showShareCarModel = false;
    paymentDialogShow = false;
    editOutboundForecast = false;
    offerDialog = false;
    carDialog = false;
    showConfirmCancelDialog = false;
    selectedOutboundForecastList = [];
    checkedRowKeys = [];
  }

  function saved() {
    reloadTable();
  }

  async function startEdit(id) {
    currentModel = await CarpoolManager.getById(id);
    showModal.value = true;
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

  const AccountPowerList = computed(() => {
    return useUserStore()?.info?.powerList;
  });
  function startEditOF(id) {
    editId = id;
    editOutboundForecast = true;
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
