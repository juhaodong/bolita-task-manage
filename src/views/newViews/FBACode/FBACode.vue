<template>
  <n-card :bordered="false" class="proCard">
    <n-button size="small" type="primary" @click="showAdd">新建FBACode</n-button>
    <!--    <n-button size="small" style="margin-left: 10px" type="primary" @click="downloadFBACode"-->
    <!--      >下载FBACode</n-button-->
    <!--    >-->
    <n-button size="small" style="margin-left: 10px" type="primary" @click="ImportCode = true"
      >导入FBACode</n-button
    >
    <BasicTable
      ref="actionRef"
      v-model:checked-row-keys="checkedRows"
      :action-column="actionColumn"
      :columns="columns"
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
  import { columns } from './columns';
  import DocumentEdit16Filled from '@vicons/fluent/es/DocumentEdit16Filled';
  import Delete16Filled from '@vicons/fluent/es/Delete16Filled';
  import NewFBACode from '@/views/newViews/FBACode/NewFBACode.vue';
  import { $ref } from 'vue/macros';
  import { FBACodeManager } from '@/api/dataLayer/modules/user/user';
  import FileSaver from 'file-saver';
  import ImportFBACodeFile from '@/views/newViews/FBACode/ImportFBACodeFile.vue';

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
  const loadDataTable = async () => {
    FBACodeList = await FBACodeManager.load(filterObj);
    return FBACodeList;
  };

  let filterObj: any | null = $ref(null);

  function reloadTable() {
    actionRef.value.reload();
    showModal.value = false;
    ImportCode = false;
  }

  async function startEdit(id) {
    currentModel = await FBACodeManager.getById(id);
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

  async function startRemove(id) {
    currentModel = await FBACodeManager.remove(id);
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
