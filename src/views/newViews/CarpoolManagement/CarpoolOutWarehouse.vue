<template>
  <n-card v-if="hasAuthPower('outStorageView')" :bordered="false" class="proCard">
    <filter-bar
      v-model="filterItems"
      :columns="outCarColumns"
      :pagination="paginationReactive"
      @clear="updateFilter(null)"
      @submit="updateFilter"
      @filter-change="updateFilterWithItems"
    />
    <div class="my-2"></div>
    <n-button
      v-if="hasAuthPower('outStorageCarAdd')"
      class="action-button"
      size="small"
      type="primary"
      @click="ImportFilesDialog = true"
    >
      <template #icon>
        <n-icon>
          <DocumentAdd20Regular />
        </n-icon>
      </template>
      库外订车
    </n-button>
    <n-button class="action-button" size="small" type="info" @click="downloadData">
      <template #icon>
        <n-icon>
          <ArrowDownload20Regular />
        </n-icon>
      </template>
      下载
    </n-button>
    <BasicTable
      ref="actionRef"
      v-model:checked-row-keys="checkedRows"
      :actionColumn="actionColumn"
      :columns="outCarColumns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
    />
    <n-modal
      v-model:show="ImportFilesDialog"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="库外订车"
    >
      <import-out-warehouse-file @saved="reloadTable" />
    </n-modal>
    <n-modal
      v-model:show="editDetailModel"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="编辑详情"
    >
      <out-car-detail :model="currentModel" @saved="reloadTable" />
    </n-modal>
    <n-modal
      v-model:show="showOfferPrice"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 800px; max-width: 800px"
      title="报价表"
    >
      <out-warehouse-car-offer :ids="currentId" @save="reloadTable" />
    </n-modal>
  </n-card>
  <no-power-page v-else />
</template>

<script lang="ts" setup>
  import { h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { outCarColumns } from './columns';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { $ref } from 'vue/macros';
  import { hasAuthPower } from '@/api/dataLayer/common/power';
  import NoPowerPage from '@/views/newViews/Common/NoPowerPage.vue';
  import ImportOutWarehouseFile from '@/views/newViews/CarpoolManagement/ImportOutWarehouseFile.vue';
  import OutCarDetail from '@/views/newViews/CarpoolManagement/OutCarDetail.vue';
  import OutWarehouseCarOffer from '@/views/newViews/CarpoolManagement/OutWarehouseCarOffer.vue';
  import { useUploadDialog } from '@/store/modules/uploadFileState';
  import FileSaver from 'file-saver';
  import * as XLSX from 'xlsx';
  import { NIcon, NTooltip } from 'naive-ui';
  import {
    ArrowDownload20Regular,
    Delete20Regular,
    DocumentAdd20Regular,
    DocumentEdit20Regular,
    Image20Regular,
  } from '@vicons/fluent';
  import {
    deleteExternalVehicleList,
    getExternalVehicleListByFilterWithPagination,
    updateExternalVehicle,
  } from '@/api/newDataLayer/CarManage/ExternalVehicle';
  import dayjs from 'dayjs';

  let filterObj: any | null = $ref(null);
  let currentModel: any | null = $ref(null);
  let checkedRows = $ref([]);
  let ImportFilesDialog = $ref(false);
  let editDetailModel = $ref(false);
  let currentId = $ref('');
  let showOfferPrice = $ref(false);
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
    },
    onUpdatePageSize: (pageSize: number) => {
      paginationReactive.pageSize = pageSize;
      paginationReactive.pageNumber = 0;
    },
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

    const res = await getExternalVehicleListByFilterWithPagination(
      currentFilter,
      paginationReactive
    );

    let allList = res.content;
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
    return fakeListStart.concat(allList.concat(fakeListEnd));
  };

  async function downloadData() {
    let selectedList = [];
    selectedList = await loadDataTable();
    // Create a 2D array for Excel data
    const data = [];
    const headers = outCarColumns.filter((it) => it.title).map((it) => it.title);
    data.push(headers);

    // Add data rows
    selectedList.forEach((item) => {
      const row = [];
      outCarColumns
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
            // If the field is orderDate, format it using dayjs
            if (col.key === 'orderDate' && item[col.key]) {
              row.push(dayjs(item[col.key]).format('YYYY-MM-DD'));
            } else {
              row.push(item[col.key] || '');
            }
          } else {
            row.push('');
          }
        });
      data.push(row);
    });

    // Create a workbook
    const workbook = XLSX.utils.book_new();
    // Convert data to worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    // Save file
    FileSaver.saveAs(blob, '库外订车.xlsx');
  }

  onMounted(async () => {});
  const actionRef = ref();

  function updateFilter(value) {
    filterObj = value;
    console.log(filterObj, 'filterObj');
    reloadTable();
  }

  function updateFilterWithItems(value) {
    filterObj = value;
    reloadTable();
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

  function reloadTable() {
    actionRef.value.reload();
    editDetailModel = false;
    showOfferPrice = false;
    ImportFilesDialog = false;
  }

  async function startEdit(record) {
    // Transform deliveryDate and pickupDate using dayjs for proper display in NDatePicker
    // NDatePicker with type="datetime" expects a timestamp (milliseconds)
    if (record.deliveryDate) {
      // Ensure the date is a valid timestamp
      record.deliveryDate = dayjs(record.deliveryDate).isValid()
        ? dayjs(record.deliveryDate).valueOf()
        : null;
    }
    if (record.pickupDate) {
      // Ensure the date is a valid timestamp
      record.pickupDate = dayjs(record.pickupDate).isValid()
        ? dayjs(record.pickupDate).valueOf()
        : null;
    }
    currentModel = record;
    editDetailModel = true;
  }

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 100,
    render(record: any) {
      return h(TableAction as any, {
        style: 'text',
        actions: [
          {
            icon: renderIconWithTooltip(DocumentEdit20Regular, '修改'),
            onClick() {
              record.customerName = record.customer.customerName;
              startEdit(record);
            },
            ifShow: () => {
              return hasAuthPower('outStorageEdit');
            },
          },
          {
            icon: renderIconWithTooltip(Image20Regular, '文件'),
            highlight: () => {
              return record?.['files']?.length > 1 ? 'success' : 'error';
            },
            disabled: !hasAuthPower('outStorageSendFile'),
            async onClick() {
              const upload = useUploadDialog();
              const files = await upload.upload(record['files']);
              if (files.checkPassed) {
                record.files = files.files;
                await updateExternalVehicle(record);
              }
              actionRef.value.reload();
            },
          },
          {
            icon: renderIconWithTooltip(Delete20Regular, '删除'),
            async onClick() {
              try {
                await deleteExternalVehicleList(record.id);
                reloadTable();
              } catch (error) {
                console.error('删除失败:', error);
              }
            },
            ifShow: () => {
              return hasAuthPower('outStorageEdit');
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
