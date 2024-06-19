<template>
  <n-card :bordered="false" class="proCard">
    <div class="text-xl font-bold text-center">{{ title }}</div>
    <div class="flex justify-center mt-4">
      <n-button :loading="loading" style="width: 100px" type="info" @click="submit">确认</n-button>
    </div>
  </n-card>
</template>

<script lang="ts" setup>
  import { $ref } from 'vue/macros';

  const props = defineProps<Prop>();
  interface Prop {
    title?: string;
  }
  const emit = defineEmits(['saved']);
  let loading = $ref(false);
  function submit() {
    loading = true;
    emit('saved');
  }
</script>

<style lang="less" scoped></style>
