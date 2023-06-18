<script setup lang="ts">
  import { $ref } from 'vue/macros';
  import NewTaskStep1Form from '@/views/bolita-views/task/new/NewTaskStep1Form.vue';
  import { getNewORsByName } from '@/api/task/task-operation-requirement';
  import { reactive, watchEffect } from 'vue';
  import { OperationRequirementModel } from '@/api/operationType';
  import { Archive } from '@vicons/ionicons5';
  import { TaskType } from '@/api/task/task-types';

  let currentStep = $ref(0);
  let taskType: TaskType | null = $ref(null);
  let basicInfo: any | null = $ref(null);
  const ORModels: OperationRequirementModel[] = reactive([]);

  function firstFormResult(result) {
    basicInfo = result;
    taskType = basicInfo.taskType;
    currentStep++;
  }

  watchEffect(() => {
    ORModels.length = 0;
    if (taskType != null) {
      ORModels.push(...getNewORsByName(taskType));
    }
  });
</script>

<template>
  <div>
    <new-task-step1-form v-if="currentStep == 0" @submit="firstFormResult" />
    <template v-else-if="currentStep === 1">
      <n-form>
        <n-grid :cols="12" :x-gap="24">
          <n-gi :span="12">
            <div class="my-2">
              <n-text strong>任务详情</n-text>
            </div>
          </n-gi>
          <n-form-item-gi
            :span="6"
            :key="model.operationType"
            v-for="model in ORModels"
            :label="model.operationType"
          >
            <n-input-number
              @focus="model.requireAmount === 0 ? (model.requireAmount = null) : null"
              clearable
              placeholder="如果不填写，那么为0"
              v-model:value="model.requireAmount"
            />
          </n-form-item-gi>
          <n-form-item-gi :span="12" label="任务附件">
            <n-upload :default-upload="false">
              <n-upload-dragger>
                <div style="margin-bottom: 12px">
                  <n-icon size="48" :depth="3">
                    <archive />
                  </n-icon>
                </div>
                <n-text style="font-size: 16px"> 点击或者拖动文件到该区域来上传</n-text>
                <n-p depth="3" style="margin: 8px 0 0 0"> 请仔细检查您提交的文件</n-p>
              </n-upload-dragger>
            </n-upload>
          </n-form-item-gi>
          <n-form-item-gi :span="12">
            <n-space>
              <n-button type="primary">提交</n-button>
              <n-button>保存到草稿</n-button>
            </n-space>
          </n-form-item-gi>
        </n-grid>
      </n-form>
    </template>
    <template v-else-if="currentStep === 2">
      <div class="flex items-center mt-4">
        <div> 上传任务附件（如拣货单等）</div>
        <div class="flex-grow"></div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="less"></style>
