<script setup lang="ts"></script>

<template>
  <div class="mt-8">
    <n-descriptions :columns="2" label-placement="left" bordered>
      <n-descriptions-item :span="2" label="仓库名称"> 仓库名称</n-descriptions-item>
      <n-descriptions-item label="地址">地址</n-descriptions-item>
      <n-descriptions-item label="城市">城市</n-descriptions-item>
      <n-descriptions-item label="邮编">邮编</n-descriptions-item>
      <n-descriptions-item label="州">州</n-descriptions-item>
      <n-descriptions-item label="国家">国家</n-descriptions-item>
      <n-descriptions-item label="联系电话">联系电话</n-descriptions-item>
    </n-descriptions>
  </div>
</template>

<style scoped lang="less"></style>
