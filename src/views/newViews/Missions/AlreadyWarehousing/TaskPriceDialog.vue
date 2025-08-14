<script lang="ts" setup>
  import { computed, onMounted } from 'vue';

  interface Props {
    info: string;
  }

  const props = defineProps<Props>();

  const taskLong = computed(() => {
    return props.info.size.split('*');
  });

  onMounted(async () => {
    console.log(props.info, 'info');
  });
</script>
<template>
  <div class="mt-8">
    <n-descriptions :columns="3" bordered label-placement="left">
      <n-descriptions-item :span="2" label="长">
        {{ taskLong[0] }}
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="宽">
        {{ taskLong[1] }}
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="高">
        {{ taskLong[2] }}
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="重量">
        {{ info?.weight }}
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="国家">
        {{ info?.country }}
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="邮编">
        {{ info?.postcode }}
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="报价">
        {{ info?.suggestedPrice }}
      </n-descriptions-item>
    </n-descriptions>
  </div>
</template>

<style lang="less" scoped></style>
