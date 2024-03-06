<script lang="ts" setup>
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';

  interface Props {
    currentDate: [];
  }

  const props = defineProps<Props>();

  let loading: boolean = $ref(false);
</script>

<template>
  <div id="print" class="mt-8">
    <loading-frame :loading="loading">
      <n-descriptions :columns="2" bordered label-placement="left">
        <n-descriptions-item label="客户"> {{ currentDate?.customerName }} </n-descriptions-item>
        <n-descriptions-item label="国家"> {{ currentDate?.country }} </n-descriptions-item>
        <n-descriptions-item label="票号"> {{ currentDate?.ticketId }} </n-descriptions-item>
        <n-descriptions-item label="柜号"> {{ currentDate?.containerId }} </n-descriptions-item>
        <n-descriptions-item label="仓库"> {{ currentDate?.warehouseId }} </n-descriptions-item>
        <n-descriptions-item label="箱数"> {{ currentDate?.number }} </n-descriptions-item>
        <n-descriptions-item label="重量"> {{ currentDate?.weight }} </n-descriptions-item>
        <n-descriptions-item label="体积"> {{ currentDate?.volume }} </n-descriptions-item>
        <n-descriptions-item label="托数"> {{ currentDate?.trayNum ?? 0 }} </n-descriptions-item>
        <n-descriptions-item label="托盘类型">
          {{ currentDate?.trayType ?? '' }}
        </n-descriptions-item>
        <n-descriptions-item label="出库方式">
          {{ currentDate?.outboundMethod }}
        </n-descriptions-item>
        <n-descriptions-item label="物流方式">
          {{ currentDate?.deliveryMethod }}
        </n-descriptions-item>
        <n-descriptions-item label="FBACode"> {{ currentDate?.FCAddress }} </n-descriptions-item>
        <n-descriptions-item label="FBA/快递单号">
          {{ currentDate?.FBADeliveryCode }}
        </n-descriptions-item>
        <n-descriptions-item label="基础备注"> {{ currentDate?.normalNote }} </n-descriptions-item>
        <n-descriptions-item label="送货备注">
          {{ currentDate?.transportationNote }}
        </n-descriptions-item>
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
