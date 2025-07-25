<script lang="ts" setup>
  import { computed, onMounted, ref } from 'vue';
  import { addOrUpdateTask, getTaskListByOutboundId } from '@/api/newDataLayer/TaskList/TaskList';
  import { groupBy } from 'lodash';
  import { safeSumBy } from '@/store/utils/utils';
  import { addOrUpdateOutboundForecast } from '@/api/newDataLayer/CarManage/CarManage';
  import { $ref } from 'vue/macros';
  import { getFBACodeList } from '@/api/newDataLayer/FBACode/FBACode';
  import dayjs from 'dayjs';
  import LoadingFrame from "@/views/bolita-views/composable/LoadingFrame.vue";

  interface Props {
    info?: any;
  }
  const emit = defineEmits(['saved']);
  const prop = defineProps<Props>();
  const currentInfo = ref(null);
  let REF = $ref('');
  let suggestedPrice = $ref('');
  let costPrice = $ref('');
  let loading = $ref(false);
  onMounted(async () => {
    loading = true;
    const res = await getTaskListByOutboundId(prop.info.id);
    const fbaCodeList = await getFBACodeList();
    const todayDisplay = dayjs().format('DDMMYY');
    if (prop.info.REF) {
      REF = prop.info.REF;
    } else {
      if (fbaCodeList.find((it) => it.code === prop.info.FCAddress)) {
        REF = prop.info.FCAddress + '-HW' + todayDisplay + '-' + prop.info.id;
      } else {
        REF = prop.info.postcode + '-HW' + todayDisplay + '-' + prop.info.id;
      }
    }
    suggestedPrice = prop.info.suggestedPrice ?? '';
    costPrice = prop.info.costPrice ?? '';
    currentInfo.value = Object.entries(groupBy(res, 'customer.customerName')).map(
      ([key, value]) => ({
        name: key,
        value: value,
        price: safeSumBy(value, 'outPrice'),
      })
    );
    loading = false;
  });
  const totalPrice = computed(() => {
    return safeSumBy(currentInfo.value, 'price');
  });
  async function savePrice() {
    loading = true;
    for (const item of currentInfo.value) {
      for (const task of item.value) {
        // task.inStatus = '已报价';
        task.waitPrice = '1';
        task.outPrice = item.price / item.value.length;
        task.REF = REF.toString();
        await addOrUpdateTask(task);
      }
    }
    let outboundInfo = prop.info;
    outboundInfo.totalOutOffer = totalPrice.value;
    // outboundInfo.inStatus = '已报价';
    outboundInfo.REF = REF.toString();
    outboundInfo.costPrice = costPrice;
    outboundInfo.suggestedPrice = suggestedPrice;
    outboundInfo.waitPrice = '1';
    await addOrUpdateOutboundForecast(outboundInfo);
    loading = false;
    emit('saved');
  }
</script>

<template>
  <loading-frame :loading="loading">
  <div class="mt-8">
    <n-descriptions :columns="1" bordered label-placement="left">
      <n-descriptions-item :span="2" label="REF">
        <n-input v-model:value="REF" />
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="建议报价">
        <n-input v-model:value="suggestedPrice" />
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="成本价">
        <n-input v-model:value="costPrice" />
      </n-descriptions-item>
      <n-descriptions-item
        v-for="(item, index) in currentInfo"
        :key="index"
        :label="item.name"
        :span="2"
      >
        <n-input v-model:value="item.price" />
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="总价">
        <n-input v-model:value="totalPrice" />
      </n-descriptions-item>
    </n-descriptions>
    <n-button style="margin-top: 10px" type="info" @click="savePrice">确认</n-button>
  </div>
  </loading-frame>
</template>

<style lang="less" scoped></style>
