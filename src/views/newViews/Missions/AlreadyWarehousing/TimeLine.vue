<script lang="ts" setup>
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { onMounted } from 'vue';
  import { $ref } from 'vue/macros';
  import { timeTableColumn } from '@/views/bolita-views/composable/useableColumns';

  interface Props {
    info: [];
  }
  const columns = $ref([
    timeTableColumn('detailTime', '时间', 'YYYY-MM-DD HH:mm:ss'),
    {
      title: '操作人员',
      key: 'operator',
    },
    {
      title: '操作事项',
      key: 'note',
    },
  ]);
  let currentItems = $ref([]);
  const props = defineProps<Props>();
  async function reload() {
    loading = true;
    currentItems = props.info.timelines.filter((it) => it.useType === 'normal')
      .sort((a, b) => {
        return new Date(b.detailTime).getTime() - new Date(a.detailTime).getTime();
      });
    loading = false;
  }
  onMounted(async () => {
    await reload();
  });
  let loading: boolean = $ref(false);
</script>

<template>
  <div>
    <loading-frame :loading="loading">
      <n-data-table :bordered="false" :columns="columns" :data="currentItems" />
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
