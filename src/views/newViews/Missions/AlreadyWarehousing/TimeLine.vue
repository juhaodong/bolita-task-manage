<script lang="ts" setup>
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { h, onMounted } from 'vue';
  import { $ref } from 'vue/macros';
  import { timeTableColumn } from '@/views/bolita-views/composable/useableColumns';
  import { NButton } from 'naive-ui';
  import ProblemFilesDialog from '@/views/newViews/Missions/AlreadyWarehousing/ProblemFilesDialog.vue';

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
    {
      title: '文件',
      key: 'problemFiles',
      width: 80,
      render(row) {
        if (row.problemFiles) {
          return h(
            NButton,
            {
              strong: true,
              tertiary: true,
              size: 'small',
              onClick: () => showFiles(row),
            },
            { default: () => '文件' }
          );
        }
        return null;
      },
    },
  ]);
  let currentItems = $ref([]);
  let showFilesDialog = $ref(false);
  let currentRow = $ref(null);
  const props = defineProps<Props>();
  async function reload() {
    loading = true;
    currentItems = props.info.timelines
      .filter((it) => it.useType === 'normal')
      .sort((a, b) => {
        return new Date(b.detailTime).getTime() - new Date(a.detailTime).getTime();
      });
    loading = false;
  }

  function showFiles(row) {
    currentRow = row;
    showFilesDialog = true;
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

    <n-modal v-model:show="showFilesDialog" preset="dialog" title="文件">
      <problem-files-dialog
        v-if="currentRow"
        :info="currentRow"
        @cancel="showFilesDialog = false"
      />
    </n-modal>
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
