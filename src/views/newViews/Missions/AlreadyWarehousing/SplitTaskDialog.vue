<script lang="ts" setup>
  import { computed, onMounted, ref } from 'vue';
  import { safeSumBy } from '@/store/utils/utils';
  import {
    addOrUpdateTask,
    deleteTask,
    searchTaskPrice,
  } from '@/api/newDataLayer/TaskList/TaskList';
  import { addOrUpdateTaskTimeLine } from '@/api/newDataLayer/TimeLine/TimeLine';
  import { useUserStore } from '@/store/modules/user';
  import dayjs from 'dayjs';

  interface Props {
    info?: any;
  }
  const prop = defineProps<Props>();
  let newSplitList = ref([]);
  let splitNumber = ref(2);
  let step = ref(1);
  let loading = ref(false);
  onMounted(async () => {
    console.log(prop.info, 'info');
  });
  const emit = defineEmits(['saved']);
  const totalNumber = computed(() => {
    return (
      safeSumBy(newSplitList.value, 'currentNumber').toString() ===
      prop.info.arrivedContainerNum.toString()
    );
  });
  const totalWeight = computed(() => {
    return safeSumBy(newSplitList.value, 'weight').toString() === prop.info.weight.toString();
  });
  function backStep() {
    step.value = step.value - 1;
  }
  async function nextStep() {
    if (step.value === 1) {
      newSplitList.value = [];
      for (let i = 1; i <= parseFloat(splitNumber.value); i++) {
        newSplitList.value.push({
          value: i.toString(),
          currentNumber: '',
          size: '',
          weight: '',
        });
      }
      step.value = step.value + 1;
    } else {
      loading.value = true;
      for (const item of newSplitList.value) {
        let defaultTask = Object.assign({}, prop.info);
        if (!defaultTask.sourceId) {
          defaultTask.sourceId = defaultTask.id;
        }
        delete defaultTask.id;
        delete defaultTask.timelines;
        defaultTask.weight = item.weight;
        defaultTask.size = item.size;
        defaultTask.arrivedContainerNum = item.currentNumber;
        defaultTask.ticketId = defaultTask.ticketId + '#' + item.value;
        defaultTask.suggestionPrice = await searchTaskPrice(
          item.size,
          item.weight,
          defaultTask.country,
          defaultTask.outboundMethod,
          item.currentNumber,
          defaultTask.postcode
        );
        await addOrUpdateTask(defaultTask);
      }
      let originalTask = Object.assign({}, prop.info);
      if (originalTask.sourceId) {
        await deleteTask([originalTask.id]);
      } else {
        originalTask.inStatus = '已拆分';
        await addOrUpdateTask(originalTask);
      }
      const userInfo = useUserStore().info;
      await addOrUpdateTaskTimeLine({
        useType: 'normal',
        bolitaTaskId: prop.info.id,
        operator: userInfo?.realName,
        detailTime: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
        note: '被拆分',
      });
      loading.value = false;
      emit('saved');
    }
  }
</script>

<template>
  <div class="mt-2">
    <div style="display: flex; justify-content: space-between">
      <div>原票号:{{ prop.info.ticketId }}</div>
      <div>总数量: {{ prop.info.arrivedContainerNum }}</div>
      <div>总重量: {{ prop.info.weight }}</div>
    </div>
    <n-descriptions :columns="1" bordered label-placement="left">
      <n-descriptions-item v-if="step === 1" :span="2" label="拆分数量">
        <n-input v-model:value="splitNumber" />
      </n-descriptions-item>
      <template v-if="step === 2">
        <n-descriptions-item
          v-for="(item, index) in newSplitList"
          :key="index"
          :label="'#' + item.value"
        >
          <n-input-number placeholder="请输入数量" v-model:value="item.currentNumber" />
          <n-input-number placeholder="请输入重量" v-model:value="item.weight" />
          <n-input placeholder="请输入尺寸" v-model:value="item.size" />
        </n-descriptions-item>
      </template>
    </n-descriptions>
    <n-button
      v-if="step === 2"
      style="margin-top: 10px; margin-right: 10px"
      type="info"
      @click="backStep"
      >上一步</n-button
    >
    <n-button
      :disabled="
        ((!totalNumber || !totalWeight) && step === 2) ||
        (step === 1 && !splitNumber) ||
        !Number.isInteger(parseFloat(splitNumber))
      "
      :loading="loading && step === 2"
      style="margin-top: 10px"
      type="info"
      @click="nextStep"
      >{{ step === 1 ? '下一步' : '确定' }}</n-button
    >
  </div>
</template>

<style lang="less" scoped></style>
