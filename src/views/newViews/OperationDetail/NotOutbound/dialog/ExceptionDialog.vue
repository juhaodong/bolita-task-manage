<script lang="ts" setup>
  import { $ref } from 'vue/macros';
  import { onMounted } from 'vue';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { errorStatus, updateTask } from '@/api/newDataLayer/TaskList/TaskList';
  import { generateOptionFromArray } from '@/store/utils/utils';
  import { addOrUpdateTaskTimeLine } from '@/api/newDataLayer/TimeLine/TimeLine';
  import dayjs from 'dayjs';
  import { useUserStore } from '@/store/modules/user';

  interface Props {
    row?: any;
  }

  const props = defineProps<Props>();
  const emit = defineEmits(['saved', 'cancel']);

  let status = $ref('异常');
  let reason = $ref('');
  let loading = $ref(false);
  let requiredInfo = $ref(false);
  let errorMessage = $ref('');

  onMounted(() => {
    if (props.row) {
      status = props.row.inStatus || '异常';
    }
  });

  async function saveInfo() {
    if (!reason) {
      requiredInfo = true;
      errorMessage = '请填写异常原因！';
      return;
    }

    loading = true;

    // Create updated data object
    const updatedData = {
      ...props.row,
    };
    updatedData.inStatus = status;
    updatedData.outboundForecastId = null;

    try {
      const userInfo = useUserStore().info;
      // Update the task in the database
      await updateTask(updatedData);
      await addOrUpdateTaskTimeLine({
        useType: 'normal',
        bolitaTaskId: updatedData.id,
        operator: userInfo?.realName,
        detailTime: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
        note: reason,
      });
      loading = false;
      emit('saved', updatedData);
    } catch (error) {
      console.error('Failed to update task:', error);
      errorMessage = '保存失败，请重试！';
      requiredInfo = true;
      loading = false;
    }
  }

  function cancel() {
    emit('cancel');
  }
</script>

<template>
  <loading-frame :loading="loading">
    <div class="mt-8">
      <n-descriptions :columns="1" bordered label-placement="left">
        <n-descriptions-item :span="2" label="状态">
          <n-select v-model:value="status" :options="generateOptionFromArray(errorStatus)" />
        </n-descriptions-item>
        <n-descriptions-item :span="2" label="异常原因 (必填)">
          <n-input
            type="textarea"
            v-model:value="reason"
            :status="requiredInfo ? 'error' : ''"
            placeholder="请输入异常原因"
          />
        </n-descriptions-item>
      </n-descriptions>
      <div class="flex justify-end mt-4 gap-2">
        <n-button @click="cancel">取消</n-button>
        <n-button type="primary" @click="saveInfo">确认</n-button>
        <span v-if="requiredInfo" style="color: red">{{ errorMessage }}</span>
      </div>
    </div>
  </loading-frame>
</template>

<style lang="less" scoped></style>
