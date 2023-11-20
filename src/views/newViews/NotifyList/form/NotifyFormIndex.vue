<script setup lang="ts">
  import { NotifyManager, NotifyType } from '@/api/dataLayer/modules/notify/notify-api';
  import NotifyContainerForm from '@/views/newViews/NotifyList/form/NotifyContainerForm.vue';
  import TrayForm from '@/views/newViews/NotifyList/form/NotifyTrayForm.vue';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { getNeededColumnByNotifyType } from '@/api/dataLayer/modules/notify/NotifyRepository';
  import readXlsxFile from 'read-excel-file';
  import { formatItemAddress } from '@/api/dataLayer/fieldDefination/addressGroup';
  import { handleRequest } from '@/store/utils/utils';

  interface Prop {
    type: NotifyType;
  }

  const prop = defineProps<Prop>();
  const emit = defineEmits(['saved']);
  let loading: boolean = $ref(false);

  function startLoading() {
    loading = true;
  }

  function stop() {
    loading = false;
  }

  async function readFile(file, notifyType) {
    if (!file) {
      return [];
    }
    const schema = Object.fromEntries(
      getNeededColumnByNotifyType(notifyType).map((it) => {
        return [it.title, { prop: it.key, type: String }];
      })
    );
    try {
      const { rows, errors } = await readXlsxFile(file, { schema });
      if (rows.length > 0 && errors.length == 0) {
        return rows.map((it) => ({ ...it, arrivedCount: 0 }));
      }
    } catch (e: any) {
      console.log(e?.message);
    }
    return [];
  }

  async function saveNotify(value: any) {
    startLoading();
    value.notifyType = prop.type;
    const taskList = [
      ...(await readFile(value.files?.[0].file, value.notifyType)).map(formatItemAddress),
      ...(value?.trayTaskList ?? []),
    ];
    delete value.uploadFile;
    const res = await NotifyManager.add(value, taskList);
    await handleRequest(res, async () => {
      emit('saved');
    });
    stop();
  }
</script>

<template>
  <loading-frame :loading="loading">
    <template v-if="type == NotifyType.Container">
      <notify-container-form @submit="saveNotify" />
    </template>
    <template v-else-if="type == NotifyType.TrayOrBox">
      <tray-form @submit="saveNotify" />
    </template>
  </loading-frame>
</template>

<style scoped lang="less"></style>
