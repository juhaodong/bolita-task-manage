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
      <n-space>
        <n-tag size="large" :type="planedBoxCount == questDetail?.boxCount ? 'success' : 'warning'"
          >总计划箱数 {{ planedBoxCount }}/{{ questDetail?.boxCount }}</n-tag
        >
        <n-button :disabled="!canGoNext">保存并提交</n-button>
      </n-space>
    </n-space>

    <n-modal v-model:show="showModal" :show-icon="false" preset="dialog" title="新建任务">
      <new-operation-form-index @submit="createNewTask" />
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
  import { computed, h, reactive, ref, watchEffect } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns } from './columns';
  import { PlusOutlined } from '@vicons/antd';
  import { createTask, deleteTask, getTasksForQuest } from '@/api/task/task-api';
  import { handleRequest } from '@/utils/utils';
  import { $ref } from 'vue/macros';
  import TaskDetailPage from '@/views/bolita-views/task/TaskDetail/TaskDetailPage.vue';
  import { TaskModel } from '@/api/task/task-types';
  import NewOperationFormIndex from '@/views/bolita-views/operation/new/NewOperationFormIndex.vue';
  import { getQuestById } from '@/api/quest/quest-api';
  import { QuestModel } from '@/api/quest/quest-type';

  interface Props {
    questId: string;
  }
  let questDetail: QuestModel | null = $ref(null);
  const props = defineProps<Props>();
  watchEffect(async () => {
    await reload();
  });
  async function reload() {
    if (props.questId != null) {
      questDetail = await getQuestById(props.questId);
    }
  }

  const planedBoxCount = computed(() => {
    return questDetail?.tasks.reduce((sum, i) => sum + parseInt(i.boxCount), 0) ?? 0;
  });

  let allSoringLabelAndCount = computed(() => {
    return questDetail?.notifyInfo?.taskList.map((it) => {
      return {
        label: it.sortCode,
        count: it.count,
      };
    });
  });

  const canGoNext = computed(() => {
    return planedBoxCount.value == questDetail?.boxCount;
  });

  const actionRef = ref();

  const showModal = ref(false);
  let showDetailModel = $ref(false);
  let currentTaskId = $ref('');

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
    const re = await getTasksForQuest(props.questId);
    console.log(re);
    return re;
  };

  function reloadTable() {
    actionRef.value.reload();
  }

  async function createNewTask(taskInfo: TaskModel) {
    taskInfo.questId = props.questId;
    const res = await createTask(taskInfo);
    await handleRequest(res, () => {
      showModal.value = false;
      reloadTable();
      reload();
    });
  }
</script>

<style lang="less" scoped></style>
