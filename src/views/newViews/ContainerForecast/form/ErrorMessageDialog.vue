<script lang="ts" setup>
  import { computed } from 'vue';

  interface Props {
    errorMessage: string;
  }

  const props = defineProps<Props>();
  const emit = defineEmits(['closed']);
  const filesMessage = computed(() => {
    return props.errorMessage.filter((it) => it.index);
  });
  const otherMessage = computed(() => {
    return props.errorMessage.filter((it) => !it.index);
  });
  function save() {
    emit('closed');
  }
</script>

<template>
  <div class="mt-8">
    <n-descriptions :columns="3" bordered label-placement="left">
      <n-descriptions-item v-for="(item, index) in otherMessage" :key="index" :label="'发现错误'">
        {{ item.detail }}
      </n-descriptions-item>
      <n-descriptions-item
        v-for="(item, index) in filesMessage"
        :key="index"
        :label="'行数' + item.index"
        :span="2"
      >
        {{ item.detail }}
      </n-descriptions-item>
    </n-descriptions>
    <n-space class="mt-4">
      <n-button secondary type="warning" @click="save">确定</n-button>
    </n-space>
  </div>
</template>

<style lang="less" scoped></style>
