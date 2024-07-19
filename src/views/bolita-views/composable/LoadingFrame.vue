<script lang="ts" setup>
  interface Prop {
    loading: boolean;
    title: string;
  }
  defineProps<Prop>();
</script>

<template>
  <div>
    <slot v-if="!loading"></slot>
    <div
      v-else
      class="flex flex-col justify-center items-center"
      style="min-height: 300px; width: 100%"
    >
      <div v-if="title" class="mb-8" v-html="title"></div>
      <n-spin size="large" />
    </div>
  </div>
</template>

<style lang="less" scoped></style>
