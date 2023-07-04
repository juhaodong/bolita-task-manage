<script setup lang="ts">
  import { createNotify, NotifyModel, NotifyType } from '@/api/notify/notify-api';
  import NotifyContainerForm from '@/views/bolita-views/notify/NotifyFormPage/NotifyContainerForm.vue';
  import TrayForm from '@/views/bolita-views/notify/NotifyFormPage/NotifyTrayForm.vue';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { handleRequest } from '@/utils/utils';

  interface Prop {
    type: NotifyType;
  }
  defineProps<Prop>();
  const emit = defineEmits(['loading', 'stop', 'saved']);
  function loading() {
    emit('loading');
  }
  function stop() {
    emit('stop');
  }
  async function saveNotify(value: NotifyModel) {
    loading();

    const res = await createNotify(value);

    await handleRequest(res, () => {
      emit('saved');
    });
    stop();
  }
</script>

<template>
  <loading-frame>
    <template v-if="type == NotifyType.Container">
      <notify-container-form @submit="saveNotify" />
    </template>
    <template v-else-if="type == NotifyType.TrayOrBox">
      <tray-form />
    </template>
  </loading-frame>
</template>

<style scoped lang="less"></style>
