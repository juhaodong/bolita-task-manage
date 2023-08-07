<script setup lang="ts">
  interface Prop {
    loading: boolean;
  }
  defineProps<Prop>();
</script>

<template>
  <div>
    <slot v-if="!loading"></slot>
    <div
      v-else
      style="min-height: 300px; width: 100%"
      class="flex flex-col justify-center items-center"
    >
      <n-spin size="large" />
    </div>
  </div>
</template>

<style scoped lang="less"></style>
