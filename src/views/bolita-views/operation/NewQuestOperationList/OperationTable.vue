<template>
  <n-card :bordered="false" class="proCard">
    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      @update:checked-row-keys="onCheckedRow"
      :scroll-x="1090"
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
    </BasicTable>

    <n-modal v-model:show="showModal" :show-icon="false" preset="dialog" title="新建任务">
      <new-task-form-index @submit="createNewTask" />
    </n-modal>
    <n-modal v-model:show="showDetailModel">
      <task-detail-page
        @refresh="reloadTable"
        @close="
          showDetailModel = false;
          currentTaskId = '';
        "
        :id="currentTaskId"
      />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { FormSchema, useForm } from '@/components/Form';
  import { columns } from './columns';
  import { PlusOutlined } from '@vicons/antd';
  import { salesNameList } from '@/api/sales';
  import { deliveryMethods } from '@/api/deliveryMethod';
  import { warehouseList } from '@/api/warehouse';
  import dayjs from 'dayjs';
  import { createTask, getTaskList } from '@/api/task/task-api';
  import { notifyStatusList } from '@/api/notify/notify-api';
  import NewTaskFormIndex from '@/views/bolita-views/task/new/NewQuestFormIndex.vue';
  import { handleRequest } from '@/utils/utils';
  import { $ref } from 'vue/macros';
  import TaskDetailPage from '@/views/bolita-views/task/TaskDetail/TaskDetailPage.vue';
  import { TaskModel } from '@/api/task/task-types';

  const schemas: FormSchema[] = [
    {
      field: 'salesName',
      component: 'NSelect',
      label: '负责人',
      componentProps: {
        placeholder: '请选择负责人',
        options: salesNameList.map((it) => {
          return {
            value: it,
            label: it,
          };
        }),
        onUpdateValue: (e: any) => {
          console.log(e);
        },
      },
    },
    {
      field: 'planArriveDate',
      component: 'NDatePicker',
      label: '预约时间',
      defaultValue: dayjs().valueOf(),
      componentProps: {
        type: 'date',
        clearable: true,
        onUpdateValue: (e: any) => {
          console.log(e);
        },
      },
    },
    {
      field: 'deliveryMethod',
      component: 'NSelect',
      label: '物流渠道',
      componentProps: {
        placeholder: '请选择物流渠道',
        options: deliveryMethods.map((it) => {
          return {
            value: it,
            label: it,
          };
        }),
        onUpdateValue: (e: any) => {
          console.log(e);
        },
      },
    },
    {
      field: 'arriveWarehouseName',
      component: 'NSelect',
      label: '到货仓库',
      componentProps: {
        placeholder: '请选择到货仓库',
        options: warehouseList.map((it) => {
          return {
            value: it,
            label: it,
          };
        }),
        onUpdateValue: (e: any) => {
          console.log(e);
        },
      },
    },
    {
      field: 'status',
      component: 'NSelect',
      label: '状态',
      componentProps: {
        placeholder: '状态',
        options: notifyStatusList.map((it) => {
          return {
            value: it,
            label: it,
          };
        }),
        onUpdateValue: (e: any) => {
          console.log(e);
        },
      },
    },
  ];

  const actionRef = ref();

  const showModal = ref(false);

  const formParams = reactive({
    name: '',
    address: '',
    date: null,
  });

  const params = ref({
    pageSize: 5,
    name: 'xiaoMa',
  });
  const actionColumn = reactive({
    width: 100,
    title: '操作',
    key: 'action',
    render(record) {
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '详情',
            onClick: handleEdit.bind(null, record),
            ifShow: () => {
              return true;
            },
          },
          {
            label: '删除',
            onClick: handleEdit.bind(null, record),
            ifShow: () => {
              return true;
            },
          },
        ],
        dropDownActions: [
          {
            label: '编辑',
            onClick: handleEdit.bind(null, record),
            ifShow: () => {
              return true;
            },
            auth: ['basic_list'],
          },
          {
            label: '取消预报',
          },
        ],
        select: (key) => {
          window['$message'].info(`您点击了，${key} 按钮`);
        },
      });
    },
  });

  const [register, {}] = useForm({
    gridProps: { cols: '1 s:1 m:2 l:3 xl:4 2xl:4' },
    labelWidth: 80,
    schemas,
  });

  function addTable() {
    showModal.value = true;
  }

  const loadDataTable = async (res) => {
    return await getTaskList({ ...formParams, ...params.value, ...res });
  };

  function onCheckedRow(rowKeys) {
    console.log(rowKeys);
  }

  function reloadTable() {
    actionRef.value.reload();
  }

  function handleEdit(record: Recordable) {
    showDetailModel = true;
    currentTaskId = record.id;
  }

  function handleSubmit(values: Recordable) {
    console.log(values);
    reloadTable();
  }

  function handleReset(values: Recordable) {
    console.log(values);
  }

  async function createNewTask(taskInfo: TaskModel) {
    const res = await createTask(taskInfo);
    await handleRequest(res, () => {
      showModal.value = false;
      reloadTable();
    });
  }

  let showDetailModel = $ref(false);
  let currentTaskId = $ref('');
</script>

<style lang="less" scoped></style>
