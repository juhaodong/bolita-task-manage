<script lang="ts" setup>
  import { onMounted } from 'vue';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { safeSumBy } from '@/store/utils/utils';
  import {
    addOrUpdateOutboundForecast,
    getOutboundForecastById,
  } from '@/api/newDataLayer/OutboundForecast/OutboundForecast';
  import { addOrUpdateTask, getTaskListByIds } from '@/api/newDataLayer/TaskList/TaskList';

  interface Props {
    ids: string;
  }

  const props = defineProps<Props>();
  let currentTaskList = $ref([]);
  let outPrice = $ref('');
  let loading = $ref(false);

  const emit = defineEmits(['close', 'refresh', 'saved']);

  onMounted(() => {
    reload();
  });

  async function reload() {
    if (props.ids != null) {
      currentTaskList = await getTaskListByIds(props.ids);
      console.log(currentTaskList, 'list');
      emit('refresh');
    }
  }
  async function confirm() {
    loading = true;
    await safeScope(async () => {
      for (const item of currentTaskList) {
        item.inStatus = '待订车';
        item.needOfferPrice = '2';
        item.customerId = item.customer.id;
        item.inventoryId = item.inventory.id;
        await addOrUpdateTask(item);
        const outboundDetail = await getOutboundForecastById(item.outboundId);
        const detailInfo = await getTaskListByIds(outboundDetail.outboundDetailInfo.split(','));
        const getOutOfferList = detailInfo.filter((it) => !it.outPrice);
        if (getOutOfferList.length === 0) {
          outboundDetail.totalOutOffer = safeSumBy(detailInfo, 'outPrice');
          await addOrUpdateOutboundForecast(outboundDetail);
        }
      }
      loading = false;
      emit('saved');
    });
  }
</script>
5a
<template>
  <div v-if="!loading" class="mt-8">
    <n-card v-for="(item, index) in currentTaskList" :key="index">
      <n-descriptions :columns="3" bordered label-placement="left">
        <n-descriptions-item :span="2" label="票号">
          {{ item?.ticketId }}
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="Ref.">
          {{ item?.REF }}
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="建议报价">
          {{ item?.suggestedPrice }}</n-descriptions-item
        >
        <n-descriptions-item :span="2" label="物流底价"> {{ item?.costPrice }}</n-descriptions-item>
        <n-descriptions-item :span="2" label="对外报价">
          <n-input v-model:value="item.outPrice"
        /></n-descriptions-item>
      </n-descriptions>
    </n-card>
    <n-space class="mt-4">
      <n-button secondary type="primary" @click="confirm">确认报价</n-button>
    </n-space>
  </div>
  <div v-else class="loader"> </div>
</template>

<style lang="less" scoped>
  /* HTML: <div class="loader"></div> */
  .loader {
    width: 50px;
    aspect-ratio: 1;
    border-radius: 50%;
    border: 8px solid #514b82;
    animation: l20-1 0.8s infinite linear alternate, l20-2 1.6s infinite linear;
  }
  @keyframes l20-1 {
    0% {
      clip-path: polygon(50% 50%, 0 0, 50% 0%, 50% 0%, 50% 0%, 50% 0%, 50% 0%);
    }
    12.5% {
      clip-path: polygon(50% 50%, 0 0, 50% 0%, 100% 0%, 100% 0%, 100% 0%, 100% 0%);
    }
    25% {
      clip-path: polygon(50% 50%, 0 0, 50% 0%, 100% 0%, 100% 100%, 100% 100%, 100% 100%);
    }
    50% {
      clip-path: polygon(50% 50%, 0 0, 50% 0%, 100% 0%, 100% 100%, 50% 100%, 0% 100%);
    }
    62.5% {
      clip-path: polygon(50% 50%, 100% 0, 100% 0%, 100% 0%, 100% 100%, 50% 100%, 0% 100%);
    }
    75% {
      clip-path: polygon(50% 50%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 50% 100%, 0% 100%);
    }
    100% {
      clip-path: polygon(50% 50%, 50% 100%, 50% 100%, 50% 100%, 50% 100%, 50% 100%, 0% 100%);
    }
  }
  @keyframes l20-2 {
    0% {
      transform: scaleY(1) rotate(0deg);
    }
    49.99% {
      transform: scaleY(1) rotate(135deg);
    }
    50% {
      transform: scaleY(-1) rotate(0deg);
    }
    100% {
      transform: scaleY(-1) rotate(-135deg);
    }
  }
</style>
