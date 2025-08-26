<template>
  <loading-frame :loading="loading">
    <span>原始明细</span>
    <n-data-table
      :columns="columns"
      :data="[sourceTask]"
      :row-key="(row) => row.id"
      max-height="450"
      virtual-scroll
    />
    <span class="mt-4">拆分明细</span>
    <n-data-table
      :columns="columns"
      :data="allTaskList"
      :row-key="(row) => row.id"
      max-height="450"
      virtual-scroll
    />
    <n-button @click="confirmMerge" style="margin-top: 20px" type="primary">确定</n-button>
  </loading-frame>
</template>
<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { DataTableColumns } from 'naive-ui';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { $ref } from 'vue/macros';
  import {
    addOrUpdateTask,
    deleteTask,
    getTaskListById,
    getTaskListBySourceId,
  } from '@/api/newDataLayer/TaskList/TaskList';

  interface Props {
    info?: {};
  }

  const prop = defineProps<Props>();
  const emit = defineEmits(['saved']);
  onMounted(async () => {
    await init();
  });
  let loading: boolean = $ref(false);

  const allTaskList = ref([]);
  const sourceTask = ref({});

  async function confirmMerge() {
    // const source
    loading = true;
    sourceTask.value.inStatus = '入库待出库';
    await addOrUpdateTask(sourceTask.value);
    const deleteIds = allTaskList.value.map((it) => it.id);
    await deleteTask(deleteIds);
    emit('saved');
    loading = false;
  }

  async function init() {
    loading = true;
    allTaskList.value = await getTaskListBySourceId(prop.info[0].sourceId);
    sourceTask.value = await getTaskListById(prop.info[0].sourceId);
    loading = false;
  }

  const columns: DataTableColumns<any> = $computed(() => [
    { title: '票号', key: 'ticketId' },
    { title: '柜号', key: 'containerId' },
    { title: '托数', key: 'arrivedTrayNum' },
    { title: '箱数', key: 'arrivedContainerNum' },
    { title: '重量', key: 'weight' },
    { title: '体积', key: 'volume' },
    { title: 'FC', key: 'fcAddress' },
    { title: '国家', key: 'country' },
    { title: 'FBA单号', key: 'fbaDeliveryCode' },
  ]);
</script>

<style lang="less" scoped></style>
