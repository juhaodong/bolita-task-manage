<template>
  <n-descriptions bordered :column="2" label-placement="top">
    <n-descriptions-item label="长">
      {{ info?.length ?? '-' }}
    </n-descriptions-item>
    <n-descriptions-item label="宽">
      {{ info?.width ?? '-' }}
    </n-descriptions-item>
    <n-descriptions-item label="高">
      {{ info?.height ?? '-' }}
    </n-descriptions-item>
    <n-descriptions-item label="托盘类型">
      {{ info?.trayType ?? '-' }}
    </n-descriptions-item>
    <n-descriptions-item label="托盘重量">
      {{ info?.weight ?? '-' }}
    </n-descriptions-item></n-descriptions
  >
</template>

<script setup lang="ts">
  import { TrayInfoModel } from '@/api/dataLayer/modules/deliveryMethod/logistic-type';

  interface Props {
    info: TrayInfoModel;
  }
  defineProps<Props>();
</script>

<style scoped></style>
