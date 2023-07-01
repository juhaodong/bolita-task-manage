<script setup lang="ts">
  import { $ref } from 'vue/macros';
  import { ref, watchEffect } from 'vue';
  import ChangeLogTimeLine from '@/views/bolita-views/composable/ChangeLogTimeLine.vue';
  import AppendFileListDisplay from '@/views/bolita-views/composable/AppendFileListDisplay.vue';
  import dayjs from 'dayjs';
  import { QuestModel } from '@/api/quest/quest-type';
  import { getQuestById } from '@/api/quest/quest-api';
  import { TaskStatus } from '@/api/task/task-types';
  import NotifyTasksTable from '@/views/bolita-views/notify/NotifyDetail/NotifyTasksTable.vue';
  import NotifyDetailBasicInfo from '@/views/bolita-views/notify/NotifyDetail/Fragment/NotifyDetailBasicInfo.vue';
  import OperationList from '@/views/bolita-views/operation/list/OperationList.vue';

  const props = defineProps({
    id: String,
  });
  const files = ref([]);

  let questDetail: QuestModel | null = $ref(null);
  watchEffect(async () => {
    await reload();
  });
  const emit = defineEmits(['close', 'refresh']);

  async function reload() {
    if (props.id) {
      files.value = [];
      questDetail = await getQuestById(props.id);
    }
  }
</script>

<template>
  <n-card
    size="small"
    style="max-width: 800px"
    @close="emit('close')"
    closable
    title="任务详情"
    v-if="id && questDetail"
  >
    <n-tabs type="line" animated class="mt-4">
      <n-tab-pane name="任务信息">
        <n-descriptions bordered :column="2" size="small" label-placement="top">
          <n-descriptions-item label="任务ID">
            {{ id }}
          </n-descriptions-item>
          <n-descriptions-item label="操作仓库">
            {{ questDetail?.warehouseId }}
          </n-descriptions-item>
          <n-descriptions-item label="箱数">
            {{ questDetail?.boxCount }}
          </n-descriptions-item>
          <n-descriptions-item label="操作完成率">
            {{ questDetail?.completeRate }}%
          </n-descriptions-item>
          <n-descriptions-item v-if="questDetail?.notifyId" label="到货情况">
            {{ questDetail?.tasks.filter((it) => it.status == TaskStatus.Finished).length }}
          </n-descriptions-item>
          <n-descriptions-item label="任务概览">
            {{ questDetail?.tasks.filter((it) => it.status == TaskStatus.Finished).length }}/{{
              questDetail?.tasks.length
            }}
          </n-descriptions-item>
          <n-descriptions-item label="指令下达时间">
            {{ dayjs(questDetail?.createTimestamp).format('YYYY-MM-DD HH:mm') || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="状态">
            {{ questDetail?.status }}
          </n-descriptions-item>
          <n-descriptions-item label="备注">
            {{ questDetail?.note || '-' }}
          </n-descriptions-item>
        </n-descriptions>
      </n-tab-pane>
      <n-tab-pane name="预报详情" v-if="questDetail?.notifyId">
        <notify-detail-basic-info :notify-id="questDetail.notifyId" />
      </n-tab-pane>
      <n-tab-pane name="货品列表" v-if="questDetail?.notifyId">
        <notify-tasks-table :editable="false" :notify-id="questDetail.notifyId" />
      </n-tab-pane>
      <n-tab-pane name="任务列表">
        <operation-list :quest-id="id" />
      </n-tab-pane>
      <n-tab-pane name="附件">
        <append-file-list-display :files-url="questDetail?.files" />
      </n-tab-pane>
      <n-tab-pane name="操作记录">
        <change-log-time-line :log-ref="id" />
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<style scoped lang="less"></style>
