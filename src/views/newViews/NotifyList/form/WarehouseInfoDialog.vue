<script lang="ts" setup>
  import { NotifyManager } from '@/api/dataLayer/modules/notify/notify-api';
  import { watchEffect } from 'vue';

  interface Props {
    notifyId: string;
  }
  const props = defineProps<Props>();
  const emit = defineEmits(['close', 'refresh', 'save']);
  watchEffect(async () => {
    await reload();
  });
  let notifyDetail: any | null = $ref(null);
  async function reload() {
    if (props.notifyId != null) {
      notifyDetail = await NotifyManager.getById(props.notifyId);
      console.log(notifyDetail, 'detail');
      emit('refresh');
    }
  }
</script>

<template>
  <div class="mt-8">
    <n-descriptions :columns="2" bordered label-placement="left">
      <n-descriptions-item :span="2" label="仓库名称"> 仓库名称</n-descriptions-item>
      <n-descriptions-item label="地址">地址</n-descriptions-item>
      <n-descriptions-item label="城市">城市</n-descriptions-item>
      <n-descriptions-item label="邮编">邮编</n-descriptions-item>
      <n-descriptions-item label="州">州</n-descriptions-item>
      <n-descriptions-item label="国家">国家</n-descriptions-item>
      <n-descriptions-item label="联系电话">联系电话</n-descriptions-item>
    </n-descriptions>
  </div>
</template>

<style lang="less" scoped></style>
