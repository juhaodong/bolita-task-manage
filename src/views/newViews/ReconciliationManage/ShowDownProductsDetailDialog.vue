<script lang="ts" setup>
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { onMounted } from 'vue';
  import { getDownProductsDetailListById } from '@/api/dataLayer/modules/notify/notify-detail';
  import { $ref } from 'vue/macros';
  import FileSaver from 'file-saver';

  interface Props {
    ids: [];
  }

  let currentItems = $ref([]);
  const props = defineProps<Props>();
  async function reload() {
    currentItems = await getDownProductsDetailListById(props.ids);
    console.log(currentItems, 'items');
  }
  function downloadFiles() {
    let dataStrings = ['柜号,卸柜费,其他费,总计'];
    currentItems.forEach((it) => {
      const res = [it.containerNo, it.amount, it.otherPrice, it.subtotal];
      dataStrings.push(res.join());
    });
    dataStrings = dataStrings.join('\n');
    const blob = new Blob([dataStrings], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, currentItems[0].financeContainerId + '.csv');
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
          <div class="mt-2 font-bold text-l">{{ item.containerNo }}</div>
          <div class="mt-2 font-bold text-l">总计:{{ item.subtotal }}</div>
        </div>
        <n-descriptions :columns="2" bordered label-placement="left">
          <n-descriptions-item label="卸柜费"> {{ item?.amount }} </n-descriptions-item>
          <n-descriptions-item label="其他费"> {{ item?.otherPrice }} </n-descriptions-item>
        </n-descriptions>
      </div>
      <n-button class="mt-2" @click="downloadFiles">下载</n-button>
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
