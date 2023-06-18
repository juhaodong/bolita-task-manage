<script setup lang="ts">
  import { $ref } from 'vue/macros';
  import { watchEffect } from 'vue';
  import { getTaskById } from '@/api/task/task-api';
  import dayjs from 'dayjs';
  import ChangeLogTimeLine from '@/views/bolita-views/composable/ChangeLogTimeLine.vue';

  const props = defineProps({
    taskId: String,
  });
  let taskDetail: any | null = $ref(null);
  watchEffect(async () => {
    await reload();
  });
  const emit = defineEmits(['close']);
  async function reload() {
    if (props.taskId != null) {
      taskDetail = await getTaskById(props.taskId);
      console.log(taskDetail);
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
    v-if="taskId"
  >
    <n-tabs type="line" animated class="mt-4">
      <n-tab-pane name="信息">
        <n-h4>基础信息</n-h4>
        <n-descriptions bordered :column="2" size="small" label-placement="top">
          <n-descriptions-item label="任务ID">
            {{ taskId }}
          </n-descriptions-item>
          <n-descriptions-item label="操作仓库">
            {{ taskDetail?.warehouseId }}
          </n-descriptions-item>
          <n-descriptions-item label="箱数">
            {{ taskDetail?.boxCount }}
          </n-descriptions-item>

          <n-descriptions-item label="操作完成率">
            {{ taskDetail?.completionRate }}%
          </n-descriptions-item>
          <n-descriptions-item label="操作时间">
            {{ dayjs(taskDetail?.operateTime).format('YYYY-MM-DD HH:mm') || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="发货时间">
            {{ dayjs(taskDetail?.deliveryDate).format('YYYY-MM-DD HH:mm') || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="状态">
            {{ taskDetail?.status }}
          </n-descriptions-item>
          <n-descriptions-item label="备注">
            {{ taskDetail?.note || '-' }}
          </n-descriptions-item>
        </n-descriptions>
      </n-tab-pane>
      <n-tab-pane name="操作记录">
        <change-log-time-line :log-ref="taskId" />
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<style scoped lang="less"></style>
