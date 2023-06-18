<script setup lang="ts">
  import { checkLog } from '@/api/statusChangeLog';
  import { watchEffect } from 'vue';
  import dayjs from 'dayjs';
  import { $computed } from 'vue/macros';

  const props = defineProps({ logRef: String });
  let logData: any[] = $ref([]);
  watchEffect(async () => {
    logData = await checkLog(props.logRef ?? '');
  });
  const changeLog = $computed(() => {
    return logData.map((it) => ({
      id: it.id,
      time: dayjs(it.timestamp).format('YYYY-MM-DD HH:mm:ss'),
      type: 'info',
      title: '操作人:' + it.userId,
      content: it.fromStatus + ' -> ' + it.toStatus,
      note: it.note,
      files: it.files,
    }));
  });
  function imageFiles(files: string[]) {
    return files.filter((it) => it.includes('image'));
  }

  function otherFiles(files: string[]) {
    return files.filter((it) => !it.includes('image'));
  }
</script>

<template>
  <n-h4>变动时间线</n-h4>
  <n-timeline>
    <n-timeline-item
      :key="log.id"
      v-for="log in changeLog"
      :type="log.type"
      :title="log.title"
      :content="log.content"
      :time="log.time"
    >
      <template #header>
        <div class="flex items-center">
          <n-text strong>
            {{ log.title }}
          </n-text>
          <div class="flex-grow"></div>
          <div>
            <n-text depth="2">
              {{ log.content }}
            </n-text>
          </div>
        </div>
      </template>
      <div class="mt-4">{{ log.note || '暂无留言' }}</div>
      <div class="px-2 py-2 mt-4" v-if="log.files.length > 0">
        <n-image-group v-if="imageFiles(log.files).length > 0">
          <n-space>
            <n-image :key="f" v-for="f in imageFiles(log.files)" width="72" :src="f" />
          </n-space>
        </n-image-group>
        <n-space v-if="otherFiles(log.files).length > 0">
          <n-button :key="f" v-for="(f, i) in otherFiles(log.files)">
            下载附件{{ i + 1 }}
          </n-button>
        </n-space>
      </div>
    </n-timeline-item>
  </n-timeline>
</template>

<style scoped lang="less"></style>
