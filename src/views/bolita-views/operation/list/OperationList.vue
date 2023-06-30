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
          <n-popselect
            placement="bottom-start"
            @update:value="addTable"
            :options="allSortingLabelAndCount"
          >
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
      <n-space>
        <n-tag size="large" :type="planedBoxCount == questDetail?.boxCount ? 'success' : 'warning'"
          >总计划箱数 {{ planedBoxCount }}/{{ questDetail?.boxCount }}</n-tag
        >
        <n-button @click="emit('next')" type="success" :disabled="!canGoNext">保存并提交</n-button>
      </n-space>
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
  import { computed, h, reactive, ref, watchEffect } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns } from './columns';
  import { createTask, deleteTask, getTaskList, getTasksForQuest } from '@/api/task/task-api';
  import { handleRequest } from '@/utils/utils';
  import { $ref } from 'vue/macros';
  import TaskDetailPage from '@/views/bolita-views/quest/TaskDetail/QuestDetailPage.vue';
  import { TaskModel } from '@/api/task/task-types';
  import NewOperationFormIndex from '@/views/bolita-views/operation/new/NewOperationFormIndex.vue';
  import { getQuestById } from '@/api/quest/quest-api';
  import { QuestModel } from '@/api/quest/quest-type';
  import { PlusOutlined } from '@vicons/antd';
  import { SelectOption } from 'naive-ui';
  import { clamp } from 'lodash-es';

  const emit = defineEmits(['next']);
  interface Props {
    questId?: string;
  }
  let questDetail: QuestModel | null = $ref(null);
  const props = defineProps<Props>();
  watchEffect(async () => {
    await reload();
  });
  async function reload() {
    if (props.questId != null) {
      console.log(props.questId);
      questDetail = await getQuestById(props.questId);
    }
  }

  const planedBoxCount = computed(() => {
    return questDetail?.tasks.reduce((sum, i) => sum + parseInt(i.boxCount), 0) ?? 0;
  });

  const usedSortLabel = $computed(() => {
    return questDetail?.tasks.map((it) => it.sortLabel) ?? [];
  });

  const allSortingLabelAndCount: SelectOption[] = $computed(() => {
    return (
      questDetail?.notifyInfo?.taskList
        ?.filter((it) => !usedSortLabel.includes(it.sortCode))
        ?.map((it) => {
          return {
            label: '分拣码：' + it.sortCode + '(' + it.count + '箱)',
            value: it.sortCode,
          };
        }) ?? []
    );
  });

  const canGoNext = computed(() => {
    return planedBoxCount.value == questDetail?.boxCount;
  });

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

  function addTable(presetSortLabel = '') {
    const preset = questDetail?.notifyInfo?.taskList.find((it) => it.sortCode === presetSortLabel);
    if (preset) {
      useSortCode = presetSortLabel;
      useBoxCount = parseInt(preset.count);
      console.log(preset.count);
    } else {
      console.log(questDetail?.boxCount ?? 0, planedBoxCount.value, 0);
      useBoxCount = clamp(
        (questDetail?.boxCount ?? 0) - planedBoxCount.value,
        0,
        Number.MAX_SAFE_INTEGER
      );
      useSortCode = '';
    }
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
    const res = await createTask(taskInfo);
    await handleRequest(res, () => {
      showModal.value = false;
      reloadTable();
      reload();
    });
  }
</script>

<style lang="less" scoped></style>
