<script lang="ts" setup>
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { onMounted } from 'vue';
  import { NotifyDetailManager } from '@/api/dataLayer/modules/notify/notify-detail';
  import { $ref } from 'vue/macros';

  interface Props {
    ids: [];
  }
  const columns = $ref([
    {
      title: '时间',
      key: 'detailTime',
    },
    {
      title: '操作人员',
      key: 'operator',
    },
    {
      title: '操作事项',
      key: 'note',
    },
  ]);
  let dataInfo = $ref([]);

  let currentItems = $ref([]);
  const props = defineProps<Props>();
  async function reload() {
    currentItems = await NotifyDetailManager.getById(props.ids);
    dataInfo = currentItems.timeLine;
    console.log(dataInfo, 'info');
  }
  onMounted(async () => {
    await reload();
  });
  let loading: boolean = $ref(false);
</script>

<template>
  <div>
    <loading-frame :loading="loading">
      <n-data-table :bordered="false" :columns="columns" :data="dataInfo" />
    </loading-frame>
  </div>
</template>

<style lang="less" scoped>
  @media print {
    .noMaxHeight {
      max-height: unset !important;
      overflow: hidden;
    }
  }
</style>
