<script lang="ts" setup>
  import { $ref } from 'vue/macros';
  import { onMounted } from 'vue';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { updateTask } from '@/api/newDataLayer/TaskList/TaskList';

  interface Props {
    row?: any;
  }

  const props = defineProps<Props>();
  const emit = defineEmits(['saved']);
  let normalNumber = $ref(0);
  let loading = $ref(false);
  let trayNumber = $ref(0);
  let size = $ref('');

  onMounted(() => {
    normalNumber = props.row.arrivedContainerNum ? props.row.arrivedContainerNum : 0;
    trayNumber = props.row.trayNum ? props.row.trayNum : 0;
    size = props.row.size ? props.row.size : '';
  });

  async function saveInfo() {
    let currentTask = Object.assign({}, props.row);
    currentTask.size = size;
    currentTask.outContainerNum = normalNumber;
    currentTask.outTrayNum = trayNumber;
    await updateTask(currentTask);
    emit('saved');
  }
  function cancel() {
    emit('saved');
  }
</script>

<template>
  <loading-frame :loading="loading">
    <div class="mt-8">
      <n-descriptions :columns="1" bordered label-placement="left">
        <n-descriptions-item :span="2" label="出库方式">
          <n-input disabled v-model:value="row.outboundMethod" />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="尺寸">
          <n-input v-model:value="size" placeholder="请输入尺寸" />
        </n-descriptions-item>
        <n-descriptions-item v-if="row.number > 0" :span="2" label="件数">
          <n-input
            :disabled="row.outboundMethod === '散货'"
            v-model:value="normalNumber"
            placeholder="请输入件数"
          />
        </n-descriptions-item>
        <n-descriptions-item v-else :span="2" label="托数">
          <n-input v-model:value="trayNumber" placeholder="请输入托数" />
        </n-descriptions-item>
      </n-descriptions>
      <div class="flex justify-end mt-4 gap-2">
        <n-button @click="cancel">取消</n-button>
        <n-button type="primary" @click="saveInfo">确认</n-button>
      </div>
    </div>
  </loading-frame>
</template>

<style lang="less" scoped></style>
