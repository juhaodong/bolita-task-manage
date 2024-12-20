<script lang="ts" setup>
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { onMounted } from 'vue';
  import { $ref } from 'vue/macros';
  import { getTaskListByIds } from '@/api/newDataLayer/TaskList/TaskList';

  interface Props {
    ids: [];
  }

  let currentItems = $ref([]);
  const props = defineProps<Props>();
  async function reload() {
    currentItems = await getTaskListByIds(props.ids.split(','));
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
        <div class="mt-2 font-bold text-l">{{ item.ticketId }}</div>
        <n-descriptions :columns="2" bordered label-placement="left">
          <n-descriptions-item label="客户"> {{ item?.customerName }} </n-descriptions-item>
          <n-descriptions-item label="国家"> {{ item?.country }} </n-descriptions-item>
          <n-descriptions-item label="票号"> {{ item?.ticketId }} </n-descriptions-item>
          <n-descriptions-item label="柜号"> {{ item?.containerId }} </n-descriptions-item>
          <n-descriptions-item label="仓库"> {{ item?.warehouseId }} </n-descriptions-item>
          <n-descriptions-item label="箱数"> {{ item?.number }} </n-descriptions-item>
          <n-descriptions-item label="重量"> {{ item?.weight }} </n-descriptions-item>
          <n-descriptions-item label="体积"> {{ item?.volume }} </n-descriptions-item>
          <n-descriptions-item label="托数"> {{ item?.trayNum ?? 0 }} </n-descriptions-item>
          <n-descriptions-item label="托盘类型">
            {{ item?.trayType ?? '' }}
          </n-descriptions-item>
          <n-descriptions-item label="出库方式">
            {{ item?.outboundMethod }}
          </n-descriptions-item>
          <n-descriptions-item label="物流方式">
            {{ item?.deliveryMethod }}
          </n-descriptions-item>
          <n-descriptions-item label="FC/送货地址">
            {{ item?.FCAddress }}
          </n-descriptions-item>
          <n-descriptions-item label="FBA/快递单号">
            {{ item?.FBADeliveryCode }}
          </n-descriptions-item>
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
