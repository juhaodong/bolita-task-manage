<script setup lang="ts">
  let loading = $ref(false);
  function startLoading() {
    loading = true;
  }
</script>

<template>
  <div>
    <slot @loading="startLoading" @stop="loading = false" v-if="!loading"></slot>
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
