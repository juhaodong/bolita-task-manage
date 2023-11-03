<template>
  <n-card :bordered="false" class="proCard">
    <n-button size="small" type="primary" @click="showAdd">新建FBACode</n-button>
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

  const actionRef = ref();
  let currentModel: any | null = $ref(null);
  const showModal = ref(false);
  let checkedRows = $ref([]);

  function showAdd() {
    currentModel = null;
    showModal.value = true;
  }
  const loadDataTable = async () => {
    return await FBACodeManager.load(filterObj);
  };

  let filterObj: any | null = $ref(null);

  function reloadTable() {
    actionRef.value.reload();
    showModal.value = false;
  }

  async function startEdit(id) {
    currentModel = await FBACodeManager.getById(id);
    showModal.value = true;
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
