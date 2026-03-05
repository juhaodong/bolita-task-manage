<template>
  <n-card :bordered="false" class="proCard">
    <single-filter-bar :form-fields="filters" @clear="updateFilter(null)" @submit="updateFilter" />
    <div class="mt-2">
      <n-button size="small" type="primary" @click="showAdd">新建FBACode</n-button>
      <n-button size="small" class="ml-4" @click="downloadData">下载FBACode</n-button>
      <n-button
        :disabled="checkedRows.length !== 1"
        class="action-button"
        size="small"
        @click="startEdit"
      >
        修改
      </n-button>
      <n-button
        :disabled="checkedRows.length !== 1"
        class="action-button"
        size="small"
        @click="startRemove"
      >
        删除
      </n-button>
    </div>

    <BasicTable
      ref="actionRef"
      v-model:checked-row-keys="checkedRows"
      :columns="columns"
      :pagination="paginationReactive"
      :request="loadDataTable"
      :row-key="(row) => row.id"
    />
    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="新建/编辑FBA码"
    >
      <new-f-b-a-code :model="currentModel" @saved="reloadTable" />
    </n-modal>
    <n-modal
      v-model:show="ImportCode"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="新建/编辑FBA码"
    >
      <import-f-b-a-code-file @saved="reloadTable" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import { BasicTable } from '@/components/Table';
  import { columns, filters } from './columns';
  import NewFBACode from '@/views/newViews/FBACode/NewFBACode.vue';
  import { $ref } from 'vue/macros';
  import FileSaver from 'file-saver';
  import ImportFBACodeFile from '@/views/newViews/FBACode/ImportFBACodeFile.vue';
  import { deleteFBACode, getFBACodeListByFilter } from '@/api/newDataLayer/FBACode/FBACode';
  import SingleFilterBar from '@/views/bolita-views/composable/SingleFilterBar.vue';
  import { NButton } from 'naive-ui';
  import * as XLSX from 'xlsx';
  import dayjs from 'dayjs';

  const actionRef = ref();
  let currentModel: any | null = $ref(null);
  const showModal = ref(false);
  let checkedRows = $ref([]);
  let ImportCode = $ref(false);
  let FBACodeList = $ref([]);

  function showAdd() {
    currentModel = null;
    showModal.value = true;
  }

  const paginationReactive = reactive({
    defaultPage: 1,
    pageNumber: 0,
    pageSize: 10,
    defaultPageSize: 10,
    showSizePicker: true,
    pageSizes: [10, 50, 100],
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

  let currentFilter = $ref([]);

  async function getCurrentFilter() {
    currentFilter = [];
    currentFilter = filterObj;
  }

  let allList = $ref([]);

  const loadDataTable = async () => {
    await getCurrentFilter();
    allList = await getFBACodeListByFilter(currentFilter);
    return allList;
  };

  let filterObj: any | null = $ref(null);

  function reloadTable() {
    actionRef.value.reload();
    showModal.value = false;
    ImportCode = false;
  }

  async function startEdit() {
    currentModel = allList.find((it) => it.id === checkedRows[0]);
    showModal.value = true;
  }

  async function downloadData() {
    try {
      let selectedList = [];
      selectedList = await getFBACodeListByFilter(currentFilter);
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
      FileSaver.saveAs(blob, 'FBACode.xlsx');
    } catch (error) {
      console.error('下载失败:', error);
    }
  }

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  async function startRemove() {
    await deleteFBACode(checkedRows[0]);
    reloadTable();
  }
</script>

<style lang="less" scoped></style>
