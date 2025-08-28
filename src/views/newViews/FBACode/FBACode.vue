<template>
  <n-card :bordered="false" class="proCard">
    <single-filter-bar :form-fields="filters" @clear="updateFilter(null)" @submit="updateFilter" />
    <div class="mt-2">
      <n-button size="small" type="primary" @click="showAdd">新建FBACode</n-button>
      <n-button size="small" class="ml-4" @click="downloadFBACode">下载FBACode</n-button>
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

  async function startRemove() {
    await deleteFBACode(checkedRows[0]);
    reloadTable();
  }
</script>

<style lang="less" scoped></style>
