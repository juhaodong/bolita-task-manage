<script setup lang="ts">
  import { ref } from 'vue';
  import { NButton, NCard, NInput } from 'naive-ui';
  import { searchTaskPrice } from '@/api/newDataLayer/TaskList/TaskList';

  // Define reactive variables for form inputs
  const volume = ref('');
  const weight = ref('');
  const country = ref('');
  const zipCode = ref('');
  const height = ref('');
  const width = ref('');
  const long = ref('');
  const size = ref('');
  const numberAt = ref('');
  const message = ref('人工询价');
  const currentWeight = ref('');
  const outType = ref('木箱');
  const loading = ref(false);
  const deliveryMethod = ref('DHL');
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
    message.value = await searchTaskPrice(
      size.value,
      weight.value,
      country.value,
      outType.value,
      numberAt.value,
      zipCode.value,
      deliveryMethod.value
    );
    loading.value = false;
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
      <n-descriptions-item label="物流方式">
        <n-input v-model:value="deliveryMethod" />
      </n-descriptions-item>
    </n-descriptions>
    <n-descriptions :columns="2" bordered label-placement="left">
      <n-descriptions-item label="重量">
        <n-input-number v-model:value="weight" />
      </n-descriptions-item>
      <n-descriptions-item label="尺寸">
        <n-input v-model:value="size" />
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
