<template>
  <n-card :bordered="false" class="proCard">
    <BasicForm @register="register" @reset="handleReset" @submit="handleSubmit">
      <template #statusSlot="{ model, field }">
        <n-input v-model:value="model[field]" />
      </template>
    </BasicForm>
    <div class="my-2"></div>
    <BasicTable
      ref="actionRef"
      :actionColumn="actionColumn"
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      :scroll-x="1090"
      @update:checked-row-keys="onCheckedRow"
    >
      <template #tableTitle>
        <n-button type="primary" @click="addTable">
          <template #icon>
            <n-icon>
              <PlusOutlined />
            </n-icon>
          </template>
          新建
        </n-button>
      </template>

      <template #toolbar>
        <n-button type="primary" @click="reloadTable">刷新数据</n-button>
      </template>
    </BasicTable>

    <n-modal v-model:show="showModal" :show-icon="false" preset="dialog" title="新建索赔">
      <new-logistic-from-index @submit="createNewLogistic" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { h, reactive, ref } from 'vue';
  // import { useMessage } from 'naive-ui';
  import { BasicTable, TableAction } from '@/components/Table';
  import { BasicForm, useForm } from '@/components/Form';
  import { columns } from './columns';
  import { PlusOutlined } from '@vicons/antd';
  import { useRouter } from 'vue-router';
  import { creatDamageClaim } from '@/api/damageClaim/list';
  import { handleRequest } from '@/utils/utils';
  import { getLogisticList } from '@/api/deliveryMethod/logistic-api';
  import { searchField } from '@/views/bolita-views/logistic/list/SearchField';
  import NewLogisticFromIndex from '@/views/bolita-views/logistic/newLogisticForm/NewLogisticFromIndex.vue';

  const router = useRouter();

  // const message = useMessage();
  const actionRef = ref();
  const [register, {}] = useForm({
    gridProps: { cols: '1 s:1 m:2 l:3 xl:4 2xl:4' },
    labelWidth: 80,
    searchField,
  });
  const showModal = ref(false);

  const actionColumn = reactive({
    width: 220,
    title: '操作',
    key: 'action',
    fixed: 'right',
    render(record) {
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '详情',
            onClick: showDetail.bind(null, record),
          },
        ],
      });
    },
  });

  function addTable() {
    showModal.value = true;
  }

  const loadDataTable = async () => {
    return await getLogisticList({});
  };

  function onCheckedRow(rowKeys) {
    console.log(rowKeys);
  }

  function reloadTable() {
    actionRef.value.reload();
  }

  async function createNewLogistic(info) {
    const res = await creatDamageClaim(info);
    await handleRequest(res, () => {
      showModal.value = false;
      reloadTable();
    });
  }

  function showDetail(record: Recordable) {
    router.push({ name: 'basic-info', params: { id: record.id } });
  }

  function handleSubmit(values: Recordable) {
    console.log(values);
    reloadTable();
  }

  function handleReset(values: Recordable) {
    console.log(values);
  }
</script>

<style lang="less" scoped></style>
