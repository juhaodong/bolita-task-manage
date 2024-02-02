<script lang="ts" setup>
  import { NotifyManager, NotifyType } from '@/api/dataLayer/modules/notify/notify-api';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { getNeededColumnByNotifyType } from '@/api/dataLayer/modules/notify/NotifyRepository';
  import NewContainerForecast from '@/views/newViews/ContainerForecast/form/NewContainerForecast.vue';
  import { handleRequest } from '@/store/utils/utils';
  import { useUserStore } from '@/store/modules/user';
  import NotifyTrayForm from '@/views/newViews/ContainerForecast/form/NotifyTrayForm.vue';
  import readXlsxFile from 'read-excel-file';
  import { CustomerManager } from '@/api/dataLayer/modules/user/user';

  interface Prop {
    currentModel?: any;
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
        return [it.title, { prop: it.key }];
      })
    );
    try {
      let { rows, errors } = await readXlsxFile(file, { schema });
      rows = rows.slice(2);
      if (rows.length > 0 && errors.length == 0) {
        rows.slice(2);
        return rows.map((it) => ({ ...it, arrivedCount: 0 }));
      }
    } catch (e: any) {
      console.log(e?.message);
    }
    return [];
  }

  function closeDialog() {
    emit('saved');
  }

  async function saveNotify(value: any) {
    startLoading();
    const userStore = useUserStore();
    value.customerId = userStore.info?.belongsToId ?? '';
    value.notifyType = prop.type;
    const currentCustomer =
      (await CustomerManager.load()).find((it) => it.id === value.customerId) ?? '';
    value.salesName = currentCustomer.belongSalesMan ?? userStore.info?.userType;
    const taskList = [
      ...(await readFile(value.files?.[0].file, value.notifyType)),
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
      <new-container-forecast :model="currentModel" @closed="closeDialog" @submit="saveNotify" />
    </template>
    <template v-else-if="type == NotifyType.TrayOrBox">
      <notify-tray-form :model="currentModel" @submit="saveNotify" />
    </template>
  </loading-frame>
</template>

<style lang="less" scoped></style>
