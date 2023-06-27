<script setup lang="ts">
  import { $ref } from 'vue/macros';
  import NewTaskStep1Form from '@/views/bolita-views/operation/new/NewOperationFormStep1.vue';
  import {
    getLaterORsByTaskType,
    getNewORsByTaskType,
  } from '@/api/task/task-operation-requirement';
  import { reactive, Ref, ref, UnwrapRef, watchEffect } from 'vue';
  import { OperationRequirementModel, OperationType } from '@/api/operationType';
  import { Archive } from '@vicons/ionicons5';
  import { TaskStatus, TaskType } from '@/api/task/task-types';
  import { getFileListUrl, uploadFile } from '@/plugins/firebase';
  import { UploadFileInfo } from 'naive-ui';
  import { generateOptionFromArray, handleRequest } from '@/utils/utils';
  import { LogisticType } from '@/api/deliveryMethod/logistic-type';
  import LogisticOtherForm from '@/views/bolita-views/logistic/newLogisticForm/NewLogisticStep2Form/LogisitcOthersForm.vue';
  import LogisticBoxForm from '@/views/bolita-views/logistic/newLogisticForm/NewLogisticStep2Form/LogisticBoxForm.vue';
  import LogisticAmazonForm from '@/views/bolita-views/logistic/newLogisticForm/NewLogisticStep2Form/LogisticAmazonForm.vue';
  import { DeliveryMethod, getLogisticTypeByDeliveryMethod } from '@/api/deliveryMethod';
  import { createLogistic } from '@/api/deliveryMethod/logistic-api';

  let currentStep = $ref(0);
  let taskType: TaskType | null = $ref(null);
  let basicInfo: any | null = $ref(null);
  const ORModels: OperationRequirementModel[] = reactive([]);
  const deliveryOR = $computed(() => {
    return ORModels.find((it) => it.operationType == OperationType.Delivery);
  });
  const files: Ref<UnwrapRef<UploadFileInfo[]>> = ref([]);
  let loading = $ref(false);
  interface Props {
    defaultBoxCount: number;
    defaultSortLabel: string;
  }
  defineProps<Props>();
  function firstFormResult(result) {
    basicInfo = result;
    taskType = basicInfo.taskType;
    currentStep++;
  }

  async function submit(directSubmit = false) {
    loading = true;
    const end = () => {
      basicInfo.status = directSubmit ? TaskStatus.WaitForCheck : TaskStatus.NotSubmit;
      basicInfo.completionRate = 0;
      emit('submit', basicInfo);
      loading = false;
    };
    const fileUrls: string[] = [];
    for (const f of files.value) {
      fileUrls.push(await uploadFile(f.file, f.type));
    }
    basicInfo.files = fileUrls;
    if (taskType != null) {
      basicInfo.operationRequirements = [...ORModels, ...getLaterORsByTaskType(taskType)];
    }
    if (deliveryOR && logisticType != null) {
      const info: any = {
        files: [],
        boxCount: basicInfo.boxCount,
        deliveryMethod: (deliveryOR?.value as DeliveryMethod) ?? DeliveryMethod.Others,
        logisticDetail: secondStepInfo,
        logisticType: logisticType,
      };
      info.files = await getFileListUrl(info.logisticDetail.files);
      delete info.logisticDetail.files;
      const res = await createLogistic(info);
      await handleRequest(res, () => {
        basicInfo.logisticId = res.result;
        end();
      });
    } else {
      end();
    }
  }

  const emit = defineEmits(['submit']);

  watchEffect(() => {
    ORModels.length = 0;
    if (taskType != null) {
      ORModels.push(...getNewORsByTaskType(taskType));
    }
  });
  let logisticType: LogisticType | null = $ref(null);

  function fillInDetails() {
    const value = deliveryOR?.value ?? DeliveryMethod.DHL;
    console.log(value);
    logisticType = getLogisticTypeByDeliveryMethod(value as DeliveryMethod);
    currentStep++;
  }
  let secondStepInfo: any = $ref(null);
  function secondFormResult(result) {
    secondStepInfo = result;
    submit();
  }
</script>

<template>
  <div>
    <template v-if="loading">
      <div class="p-16 flex items-center justify-center">
        <n-spin size="large" />
      </div>
    </template>
    <template v-else>
      <new-task-step1-form
        :default-box-count="defaultBoxCount"
        :default-sort-label="defaultSortLabel"
        v-if="currentStep == 0"
        @submit="firstFormResult"
      />
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
                v-if="model.operationInputType === 'input'"
                @focus="model.requireAmount === 0 ? (model.requireAmount = null) : null"
                clearable
                placeholder="如果不填写，那么为0"
                v-model:value="model.requireAmount"
              />
              <n-select
                v-else
                v-model:value="model.value"
                :options="generateOptionFromArray(model.options)"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="任务附件">
              <n-upload multiple v-model:file-list="files" :default-upload="false">
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
              <template v-if="deliveryOR">
                <n-button @click="fillInDetails" type="primary">补充物流细节</n-button>
              </template>
              <template v-else>
                <n-button @click="submit(true)" type="primary">提交</n-button>
                <n-button @click="submit(false)">保存到草稿</n-button>
              </template>
            </n-form-item-gi>
          </n-grid>
        </n-form>
      </template>
      <template v-else-if="currentStep === 2">
        <logistic-amazon-form
          @submit="secondFormResult"
          v-if="logisticType == LogisticType.AmazonTray"
        />
        <logistic-box-form
          @submit="secondFormResult"
          v-else-if="logisticType === LogisticType.Box"
        />
        <logistic-other-form v-else @submit="secondFormResult" />
      </template>
    </template>
  </div>
</template>

<style scoped lang="less"></style>
