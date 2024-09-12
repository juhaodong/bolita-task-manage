<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar :form-fields="filters" @clear="updateFilter(null)" @submit="updateFilter">
      <n-button size="small" type="primary" @click="showAdd">新建FBACode</n-button>
      <n-button size="small" type="primary" @click="downloadFBACode">下载FBACode</n-button>
      <n-button size="small" type="primary" @click="ImportCode = true">导入FBACode</n-button>
    </filter-bar>
    <BasicTable
      ref="actionRef"
      v-model:checked-row-keys="checkedRows"
      :action-column="actionColumn"
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
  import { h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import DocumentEdit16Filled from '@vicons/fluent/es/DocumentEdit16Filled';
  import Delete16Filled from '@vicons/fluent/es/Delete16Filled';
  import NewFBACode from '@/views/newViews/FBACode/NewFBACode.vue';
  import { $ref } from 'vue/macros';
  import FileSaver from 'file-saver';
  import ImportFBACodeFile from '@/views/newViews/FBACode/ImportFBACodeFile.vue';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import {
    deleteFBACode,
    getFbaCodeById,
    getFBACodeListByFilter,
  } from '@/api/newDataLayer/FBACode/FBACode';

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

  const loadDataTable = async () => {
    let currentFilter = [];
    if (filterObj) {
      const res = Object.keys(filterObj);
      for (const filterItem of res) {
        currentFilter.push({
          field: filterItem,
          op: filterObj[filterItem] ? '==' : '!=',
          value: filterObj[filterItem] ?? '',
        });
      }
    }
    const res = await getFBACodeListByFilter(currentFilter, paginationReactive);
    FBACodeList = res.content;
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
      fakeListEnd = Array(totalCount - paginationReactive.pageSize * paginationReactive.pageNumber)
        .fill(null)
        .map((it, index) => {
          return { key: index };
        });
    }
    return fakeListStart.concat(FBACodeList.concat(fakeListEnd));
  };

  let filterObj: any | null = $ref(null);

  function reloadTable() {
    actionRef.value.reload();
    showModal.value = false;
    ImportCode = false;
  }

  async function startEdit(id) {
    currentModel = await getFbaCodeById(id);
    showModal.value = true;
  }

  async function downloadFBACode() {
    let dataStrings = ['FBACode,州,地址,城市,邮编'];
    FBACodeList.forEach((it) => {
      const res = [it.code, it.state, it.address, it.city, it.postcode];
      dataStrings.push(res.join());
    });
    dataStrings = dataStrings.join('\n');
    const blob = new Blob([dataStrings], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, 'FBACode.csv');
  }

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  async function startRemove(id) {
    currentModel = await deleteFBACode(id);
    reloadTable();
  }

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 60,
    render(record: any) {
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '修改',
            icon: DocumentEdit16Filled,
            onClick() {
              startEdit(record.id);
            },
          },
          {
            label: '删除',
            icon: Delete16Filled,
            onClick() {
              startRemove(record.id);
            },
          },
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
