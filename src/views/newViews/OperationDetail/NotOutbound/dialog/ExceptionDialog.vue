<script lang="ts" setup>
  import { $ref } from 'vue/macros';
  import { onMounted } from 'vue';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { useUserStore } from '@/store/modules/user';
  import { updateTask } from '@/api/newDataLayer/TaskList/TaskList';
  import { addOrUpdateTaskTimeLine } from '@/api/newDataLayer/TimeLine/TimeLine';
  import dayjs from 'dayjs';
  import { saveFiles } from '@/api/newDataLayer/Notify/Notify';

  interface Props {
    row?: any;
  }

  const props = defineProps<Props>();
  const emit = defineEmits(['saved', 'cancel']);

  let reason = $ref('');
  let loading = $ref(false);
  let requiredInfo = $ref(false);
  let errorMessage = $ref('');
  let fileList = $ref([]);

  onMounted(() => {});

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
    updatedData.errorStatus = '1';
    updatedData.outboundForecastId = null;
    updatedData.errorReason = reason;

    // Add file list to updated data
    if (fileList && fileList.length > 0) {
      updatedData.fileList = fileList;
    }

    try {
      const userInfo = useUserStore().info;
      const filesUrl = await saveFiles(fileList);
      // Update the task in the database
      await updateTask(updatedData);

      // Create timeline note
      let timelineNote = '状态异常!异常原因:' + reason;
      if (fileList && fileList.length > 0) {
        timelineNote += ' (已上传附件)';
      }

      await addOrUpdateTaskTimeLine({
        useType: 'normal',
        bolitaTaskId: updatedData.id,
        operator: userInfo?.realName,
        detailTime: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
        note: timelineNote,
        problemFiles: filesUrl,
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
        <n-descriptions-item :span="2" label="异常原因 (必填)">
          <n-input
            type="textarea"
            v-model:value="reason"
            :status="requiredInfo ? 'error' : ''"
            placeholder="请输入异常原因"
          />
        </n-descriptions-item>
      </n-descriptions>
      <n-upload abstract v-model:file-list="fileList">
        <n-button-group>
          <n-upload-trigger #="{ handleClick }" abstract>
            <n-button @click="handleClick"> 上传 </n-button>
          </n-upload-trigger>
        </n-button-group>
        <n-card v-if="fileList.length > 0" style="margin-top: 12px" title="文件列表">
          <n-upload-file-list />
        </n-card>
      </n-upload>
      <div class="flex justify-end mt-4 gap-2">
        <n-button @click="cancel">取消</n-button>
        <n-button type="primary" @click="saveInfo">确认</n-button>
        <span v-if="requiredInfo" style="color: red">{{ errorMessage }}</span>
      </div>
    </div>
  </loading-frame>
</template>

<style lang="less" scoped></style>
