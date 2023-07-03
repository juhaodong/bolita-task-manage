<script setup lang="ts">
  import { NotifyType } from '@/api/notify/notify-api';
  import NotifyContainerForm from '@/views/bolita-views/notify/NotifyFormPage/NotifyContainerForm.vue';
  import TrayForm from '@/views/bolita-views/notify/NotifyFormPage/TrayForm.vue';

  interface Prop {
    type: NotifyType;
  }
  defineProps<Prop>();
</script>

<template>
  <div>
    <template v-if="type == NotifyType.Container">
      <notify-container-form />
    </template>
    <template v-else-if="type == NotifyType.TrayOrBox">
      <tray-form />
    </template>
  </div>
</template>

<style scoped lang="less"></style>
