<script lang="ts" setup>
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { onMounted } from 'vue';
  import { $ref } from 'vue/macros';
  import { getSettlementByIds } from '@/api/dataLayer/common/SettlementType';

  interface Props {
    ids: [];
  }

  let currentItems = $ref([]);
  const props = defineProps<Props>();
  async function reload() {
    currentItems = await getSettlementByIds(props.ids);
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
      <div v-for="item in currentItems" :key="item.id">
        <div style="display: flex; justify-content: space-between">
          <div class="mt-2 font-bold text-l">{{ item.ticketId }}</div>
          <div class="mt-2 font-bold text-l">总计:{{ item.totalPrice }}</div>
        </div>
        <n-descriptions :columns="2" bordered label-placement="left">
          <n-descriptions-item label="入库费"> {{ item?.inboundTotal }} </n-descriptions-item>
          <n-descriptions-item label="出库费"> {{ item?.outboundTotal }} </n-descriptions-item>
          <n-descriptions-item label="操作费"> {{ item?.operateTotal }} </n-descriptions-item>
          <n-descriptions-item label="特殊操作费">
            {{ item?.specialOperateTotal }}
          </n-descriptions-item>
          <n-descriptions-item label="物流费"> {{ item?.deliveryTotal }} </n-descriptions-item>
          <n-descriptions-item label="耗材费"> {{ item?.consumablesTotal }} </n-descriptions-item>
        </n-descriptions>
      </div>
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
