<script lang="ts" setup>
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';

  interface Props {
    currentDate: {};
  }

  const props = defineProps<Props>();

  let loading: boolean = $ref(false);
</script>

<template>
  <div id="print" class="mt-8">
    <loading-frame :loading="loading">
      <n-descriptions :columns="2" bordered label-placement="left">
        <n-descriptions-item label="客户">
          {{ currentDate?.customer.customerName }}
        </n-descriptions-item>
        <n-descriptions-item label="柜号"> {{ currentDate?.containerNo }} </n-descriptions-item>
        <n-descriptions-item label="仓库"> {{ currentDate?.inventory.name }} </n-descriptions-item>
        <n-descriptions-item label="数量"> {{ currentDate?.arrivedCount }} </n-descriptions-item>
        <n-descriptions-item label="状态"> {{ currentDate?.inStatus }} </n-descriptions-item>
        <n-descriptions-item label="备注"> {{ currentDate?.note }} </n-descriptions-item>
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
