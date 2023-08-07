<script setup lang="ts">
  import { NotifyManager, NotifyType } from '@/api/dataLayer/modules/notify/notify-api';
  import NotifyContainerForm from '@/views/newViews/NotifyList/form/NotifyContainerForm.vue';
  import TrayForm from '@/views/newViews/NotifyList/form/NotifyTrayForm.vue';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { handleRequest } from '@/store/utils/utils';
  import { getNeededColumnByNotifyType } from '@/api/dataLayer/modules/notify/NotifyRepository';
  import readXlsxFile from 'read-excel-file';

  interface Prop {
    type: NotifyType;
  }

  const prop = defineProps<Prop>();
  const emit = defineEmits(['loading', 'stop', 'saved']);

  function loading() {
    emit('loading');
  }

  function stop() {
    emit('stop');
  }

  async function readFile(file, notifyType) {
    const schema = Object.fromEntries(
      getNeededColumnByNotifyType(notifyType).map((it) => {
        return [it.title, { prop: it.key, type: String }];
      })
    );
    try {
      const { rows, errors } = await readXlsxFile(file, { schema });
      console.log(rows, errors);
      if (rows.length > 0 && errors.length == 0) {
        return rows.map((it) => ({ ...it, arrivedCount: 0 }));
      }
    } catch (e: any) {
      console.log(e?.message);
    }
    return [];
  }

  async function saveNotify(value: any) {
    loading();
    value.notifyType = prop.type;
    value.taskList = await readFile(value.uploadFile[0].file, value.notifyType);
    delete value.uploadFile;
    const res = await NotifyManager.add(value);
    await handleRequest(res, async () => {
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
      <tray-form @submit="saveNotify" />
    </template>
  </loading-frame>
</template>

<style scoped lang="less"></style>
