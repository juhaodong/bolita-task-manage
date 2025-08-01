<script setup lang="ts">
  import { ref } from 'vue';
  import { NCard, NForm, NFormItem, NInput, NGrid, NButton, NSpace } from 'naive-ui';
  import { checkPrice } from '@/api/dataLayer/common/common';

  // Define reactive variables for form inputs
  const volume = ref('');
  const weight = ref('');
  const country = ref('');
  const zipCode = ref('');
  const height = ref('');
  const width = ref('');
  const long = ref('');
  const numberAt = ref('');
  const message = ref('人工询价');
  const currentWeight = ref('');
  const outType = ref('木箱');
  const loading = ref(false);
  const items = [
    {
      label: '托盘',
      value: '托盘',
    },
    {
      label: '木箱',
      value: '木箱',
    },
  ];

  // Function to handle form submission
  async function handleSubmit() {
    loading.value = true;
    message.value = '人工询价';
    if (long.value <= 2.4 || width.value <= 1.2 || height.value <= 2.2 || weight.value <= 1500) {
      if (country.value.toLowerCase() === 'de') {
        if (numberAt.value > 8) {
          message.value = '人工询价';
          return;
        } else {
          if (outType.value === '木箱') {
            const volumeWeight = long.value * width.value * height.value * 150;
            currentWeight.value = Math.max(volumeWeight, weight.value);
          } else {
            const volumeWeight = long.value * width.value * height.value * 150;
            currentWeight.value = Math.max(volumeWeight, weight.value, 150);
          }
        }
      } else {
        if (numberAt.value > 4) {
          message.value = '人工询价';
          return;
        } else {
          if (outType.value === '木箱') {
            const volumeWeight = long.value * width.value * height.value * 330;
            currentWeight.value = Math.max(volumeWeight, weight.value);
          } else {
            const volumeWeight = long.value * width.value * height.value * 330;
            currentWeight.value = Math.max(volumeWeight, weight.value, 330);
          }
        }
      }
    } else {
      message.value = '人工询价';
      return;
    }
    const res = await checkPrice(currentWeight.value, country.value, zipCode.value);
    message.value = res.length > 0 ? res.map((it) => it.price).join(',') : '人工询价';
    loading.value = false;
    // Add your submission logic here
  }
</script>

<template>
  <n-card class="proCard">
    <n-descriptions :columns="2" bordered label-placement="left">
      <n-descriptions-item label="邮编">
        <n-input v-model:value="zipCode" />
      </n-descriptions-item>
      <n-descriptions-item label="国家"> <n-input v-model:value="country" /> </n-descriptions-item>
      <n-descriptions-item label="数量">
        <n-input-number v-model:value="numberAt" />
      </n-descriptions-item>
      <n-descriptions-item label="出库方式">
        <n-select :options="items" v-model:value="outType" />
      </n-descriptions-item>
    </n-descriptions>
    <n-descriptions :columns="2" bordered label-placement="left">
      <n-descriptions-item label="重量">
        <n-input-number v-model:value="weight" />
      </n-descriptions-item>
      <n-descriptions-item label="长">
        <n-input-number v-model:value="long" />
      </n-descriptions-item>
      <n-descriptions-item label="宽">
        <n-input-number v-model:value="width" />
      </n-descriptions-item>
      <n-descriptions-item label="高">
        <n-input-number v-model:value="height" />
      </n-descriptions-item>
      <n-descriptions-item label="价格">
        <n-input v-model:value="message" />
      </n-descriptions-item>
    </n-descriptions>
    <n-button
      :loading="loading"
      @click="handleSubmit"
      style="margin-top: 20px; width: 100%"
      type="primary"
      >查询</n-button
    >
  </n-card>
</template>

<style scoped lang="less">
  .proCard {
    margin-bottom: 16px;
  }
</style>
