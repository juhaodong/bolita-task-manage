<template>
  <n-card :bordered="false" class="proCard">
    <n-space vertical>
      <BasicTable
        :columns="columns"
        :request="loadDataTable"
        :row-key="(row) => row.id"
        ref="actionRef"
        :actionColumn="actionColumn"
        :scroll-x="1090"
      >
        <template #tableTitle>
          <n-popselect placement="bottom-start" @update:value="addTable">
            <n-button type="primary" @click="addTable">
              <template #icon>
                <n-icon>
                  <PlusOutlined />
                </n-icon>
              </template>
              新建
            </n-button>
            <template #empty>
              <div>请点击新建按钮</div>
            </template>
          </n-popselect>
        </template>
      </BasicTable>
      <n-space />
    </n-space>

    <n-modal v-model:show="showModal" :show-icon="false" preset="dialog" title="新建任务">
      <new-operation-form-index
        :default-sort-label="useSortCode"
        :default-box-count="useBoxCount"
        @submit="createNewTask"
      />
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
  import { h, reactive, ref, watchEffect } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns } from './columns';
  import { createTask, deleteTask, getTaskList, getTasksForQuest } from '@/api/task/task-api';
  import { handleRequest } from '@/utils/utils';
  import { $ref } from 'vue/macros';
  import TaskDetailPage from '@/views/bolita-views/operation/OperationDetail/OperationDetailPage.vue';
  import { TaskModel, TaskStatus } from '@/api/task/task-types';
  import NewOperationFormIndex from '@/views/bolita-views/operation/new/NewOperationFormIndex.vue';
  import { PlusOutlined } from '@vicons/antd';

  interface Props {
    questId?: string;
  }

  const props = defineProps<Props>();
  watchEffect(async () => {
    await reload();
  });
  async function reload() {
    if (props.questId != null) {
      console.log(props.questId);
    }
  }

  const actionRef = ref();

  const showModal = ref(false);
  let showDetailModel = $ref(false);
  let currentTaskId = $ref('');
  let useSortCode = $ref('');
  let useBoxCount = $ref(0);

  const actionColumn = reactive({
    width: 160,
    fixed: 'right',
    title: '操作',
    key: 'action',
    render(record) {
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '详情',
            onClick() {
              showDetailModel = true;
              currentTaskId = record.id;
            },
            ifShow: () => {
              return true;
            },
          },
          {
            label: '删除',
            popConfirm: {
              title: '您确定要删除本条记录吗',
              async confirm() {
                const res = await deleteTask(record.id);
                await handleRequest(res, () => {
                  reload();
                  reloadTable();
                });
              },
            },
            ifShow: () => {
              return true;
            },
          },
        ],
        select: (key) => {
          window['$message'].info(`您点击了，${key} 按钮`);
        },
      });
    },
  });

  function addTable() {
    showModal.value = true;
  }

  const loadDataTable = async () => {
    const re = props?.questId ? await getTasksForQuest(props.questId) : await getTaskList({});
    console.log(re);
    return re;
  };

  function reloadTable() {
    actionRef.value.reload();
  }

  async function createNewTask(taskInfo: TaskModel) {
    taskInfo.questId = props.questId;
    taskInfo.status = TaskStatus.WaitForCheck;
    const res = await createTask(taskInfo);
    await handleRequest(res, () => {
      showModal.value = false;
      reloadTable();
      reload();
    });
  }
</script>

<style lang="less" scoped></style>
