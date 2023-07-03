<script setup lang="ts">
  import { watchEffect } from 'vue';
  import { getNotifyById, NotifyType } from '@/api/notify/notify-api';
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
  const arriveDetail = $computed(() => {
    return notifyDetail?.arriveDetail;
  });
</script>

<template>
  <n-h4>基础信息</n-h4>
  <n-descriptions bordered :column="2" size="small" label-placement="top">
    <n-descriptions-item label="预报ID">
      {{ notifyId }}
    </n-descriptions-item>
    <n-descriptions-item label="到货仓库ID">
      {{ notifyDetail?.arriveWarehouseId }}
    </n-descriptions-item>
    <n-descriptions-item label="到货类型">
      {{ notifyDetail?.arriveMedia }}
    </n-descriptions-item>

    <n-descriptions-item label="已到货/总箱数">
      {{ notifyDetail?.arrivedCount }}/{{ notifyDetail?.totalCount }}
    </n-descriptions-item>
    <n-descriptions-item label="预计到仓时间">
      {{ dayjs(notifyDetail?.planArriveDateTime).format('YYYY-MM-DD HH:mm') }}
    </n-descriptions-item>
    <n-descriptions-item label="状态">
      {{ notifyDetail?.status }}
    </n-descriptions-item>
    <n-descriptions-item label="备注">
      {{ notifyDetail?.note || '-' }}
    </n-descriptions-item>
  </n-descriptions>
  <template v-if="notifyDetail?.arriveMedia === NotifyType.Container">
    <div class="mt-8">
      <n-h4>货柜信息</n-h4>
      <n-descriptions bordered :column="2" label-placement="top">
        <n-descriptions-item label="货柜号码">
          {{ arriveDetail?.containerNo }}
        </n-descriptions-item>
        <n-descriptions-item label="车牌号">
          {{ arriveDetail?.carNo }}
        </n-descriptions-item>
        <n-descriptions-item label="货柜尺寸">
          {{ arriveDetail?.containerSize }}
        </n-descriptions-item>
        <n-descriptions-item label="货柜类型">
          {{ arriveDetail?.containerType }}
        </n-descriptions-item>
      </n-descriptions>
    </div>
  </template>
  <template v-if="notifyDetail?.arriveMedia === NotifyType.TrayOrBox">
    <div class="mt-8">
      <n-h4>托盘信息</n-h4>
      <n-descriptions bordered :column="2" label-placement="top">
        <n-descriptions-item label="托盘尺寸">
          {{ arriveDetail?.traySize }}
        </n-descriptions-item>
        <n-descriptions-item label="托盘类型">
          {{ arriveDetail?.trayType }}
        </n-descriptions-item>
        <n-descriptions-item label="托盘数量">
          {{ arriveDetail?.trayCount }}
        </n-descriptions-item>
        <n-descriptions-item label="车牌号">
          {{ arriveDetail?.carNo }}
        </n-descriptions-item>
        <n-descriptions-item label="货品类型">
          {{ arriveDetail?.goodsType }}
        </n-descriptions-item>
      </n-descriptions>
    </div>
  </template>
  <template v-if="notifyDetail?.arriveMedia === NotifyType.Box">
    <div class="mt-8">
      <n-h4>散货信息</n-h4>
      <n-descriptions bordered :column="2" label-placement="top">
        <n-descriptions-item label="物流渠道">
          {{ arriveDetail?.deliveryMethod }}
        </n-descriptions-item>
      </n-descriptions>
    </div>
  </template>
</template>

<style scoped lang="less"></style>
