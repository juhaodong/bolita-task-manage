<script lang="ts" setup>
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { onMounted } from 'vue';
  import { NotifyDetailManager } from '@/api/dataLayer/modules/notify/notify-detail';
  import { $ref } from 'vue/macros';

  interface Props {
    ids: [];
  }

  let currentItems = $ref([]);
  const props = defineProps<Props>();
  async function reload() {
    currentItems = await NotifyDetailManager.getById(props.ids);
    console.log(currentItems, 'items');
  }
  onMounted(async () => {
    await reload();
  });
  let loading: boolean = $ref(false);
</script>

<template>
  <div>
    <loading-frame :loading="loading">
      <n-descriptions :columns="1" bordered label-placement="left">
        <n-descriptions-item label="审核时间"> {{ currentItems.checkedTime }} </n-descriptions-item>
        <n-descriptions-item label="入库时间"> {{ currentItems.arriveTime }} </n-descriptions-item>
        <n-descriptions-item label="创建出库计划时间">
          {{ currentItems.createPlanTime }}
        </n-descriptions-item>
        <n-descriptions-item label="订车时间">
          {{ currentItems.bookingCarTime }}
        </n-descriptions-item>
        <n-descriptions-item label="出库时间"> {{ currentItems.realOutDate }} </n-descriptions-item>
      </n-descriptions>
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
