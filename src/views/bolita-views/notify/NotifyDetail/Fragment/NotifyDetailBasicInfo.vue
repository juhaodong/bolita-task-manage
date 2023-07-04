<script setup lang="ts">
  import { computed, watchEffect } from 'vue';
  import { getNotifyById, NotifyType } from '@/api/notify/notify-api';
  import { getTaskColumns } from '@/views/bolita-views/notify/NotifyRepository/NotifyRepository';
  import dayjs from 'dayjs';

  interface Props {
    notifyId: string;
  }
  const props = defineProps<Props>();
  let notifyDetail: any | null = $ref(null);
  watchEffect(async () => {
    await reload();
  });
  async function reload() {
    if (props.notifyId != null) {
      notifyDetail = await getNotifyById(props.notifyId);
    }
  }
  const columns = computed(() => {
    return getTaskColumns();
  });
</script>

<template>
  <n-h4>基础信息</n-h4>
  <n-descriptions bordered :column="3" size="small" label-placement="top">
    <n-descriptions-item label="预报ID">
      {{ notifyId }}
    </n-descriptions-item>
    <n-descriptions-item label="到货仓库ID">
      {{ notifyDetail?.warehouseId }}
    </n-descriptions-item>
    <n-descriptions-item label="已到货/总箱数">
      {{ notifyDetail?.arrivedCount }}/{{ notifyDetail?.totalCount }}
    </n-descriptions-item>
    <n-descriptions-item label="预计到仓时间">
      {{ dayjs(notifyDetail?.planArriveDateTime).format('YYYY-MM-DD') }}
    </n-descriptions-item>
    <n-descriptions-item label="预约仓位">
      {{ dayjs(notifyDetail?.reserveTime).format('YYYY-MM-DD HH:mm') }}
    </n-descriptions-item>
    <n-descriptions-item label="备注">
      {{ notifyDetail?.note || '-' }}
    </n-descriptions-item>
  </n-descriptions>
  <template v-if="notifyDetail?.notifyType === NotifyType.Container">
    <div class="mt-8">
      <n-h4>货柜信息</n-h4>
      <n-descriptions bordered :column="3" label-placement="top">
        <n-descriptions-item label="货柜号码">
          {{ notifyDetail?.containerNo }}
        </n-descriptions-item>
        <n-descriptions-item label="货柜尺寸">
          {{ notifyDetail?.containerSize }}
        </n-descriptions-item>
        <n-descriptions-item label="货柜类型">
          {{ notifyDetail?.containerType }}
        </n-descriptions-item>
      </n-descriptions>
    </div>
  </template>
  <n-h4>到货货品列表</n-h4>
  <div v-if="notifyDetail">
    <n-data-table
      :row-class-name="(row) => (row.arrivedCount == row.count ? 'bg-green-100' : '')"
      :columns="columns"
      :data="notifyDetail.taskList"
    />
  </div>
</template>

<style scoped lang="less"></style>
