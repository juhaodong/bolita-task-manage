<script setup lang="ts">
  import { $ref } from 'vue/macros';
  import NewTaskStep1Form from '@/views/bolita-views/quest/new/step/NewQuestFormStep1.vue';
  import { QuestNotifyType } from '@/api/quest/quest-type';
  import BoxForm from '@/views/bolita-views/notify/NotifyFormPage/BoxForm.vue';
  import TrayForm from '@/views/bolita-views/notify/NotifyFormPage/TrayForm.vue';
  import NotifyContainerForm from '@/views/bolita-views/notify/NotifyFormPage/NotifyContainerForm.vue';
  import NotifyTasksTable from '@/views/bolita-views/notify/NotifyDetail/NotifyTasksTable.vue';
  import { NotifyCreateDTO, saveNotify } from '@/api/notify/notify-api';
  import { handleRequest } from '@/utils/utils';
  import NewOperationTable from '@/views/bolita-views/operation/NewQuestOperationList/NewOperationTable.vue';
  import { saveQuest, updateNotifyInfo } from '@/api/quest/quest-api';

  enum Steps {
    BasicInfo,
    NotifyBasicInfo,
    NotifyDetail,
    TaskInfo,
  }

  let currentStep = $ref(Steps.BasicInfo);
  let questNotifyType: QuestNotifyType | null = $ref(null);
  let currentNotifyId = $ref('');
  let currentQuestId = $ref('');
  let basicInfo: any | null = $ref(null);
  let loading = $ref(false);

  async function basicInfoSubmit(result) {
    basicInfo = result;
    questNotifyType = basicInfo.notifyType;
    basicInfo.warehouseId = null;
    const res = await saveQuest(basicInfo, currentQuestId);
    await handleRequest(res, () => {
      currentQuestId = res.result;
      currentStep = Steps.NotifyBasicInfo;
    });
  }

  let notifyFormInfo: any | null = $ref(null);
  async function createNewNotify(value) {
    if (basicInfo != null) {
      notifyFormInfo = value;
      const info: NotifyCreateDTO = {
        arriveDetail: value,
        arriveMedia: basicInfo.notifyType,
        customerId: basicInfo.customerId,
        files: [],
        planArriveDateTime: value.planArriveDateTime,
        questId: '',
        sortingLabelCount: value.sortingLabelCount,
        totalCount: basicInfo.boxCount,
        warehouseId: basicInfo.warehouseId,
      };
      const res = await saveNotify(info, currentNotifyId);
      await handleRequest(res, async () => {
        currentStep = Steps.NotifyDetail;
        currentNotifyId = res.result;
        await handleRequest(await updateNotifyInfo(currentNotifyId, currentQuestId), () => {});
        console.log(currentNotifyId, '预报创建成功，id');
      });
    }
  }

  async function notifyInfoSubmit(value) {
    await createNewNotify(value);
  }

  async function updateStep(step) {
    if (step == 1) {
      currentStep = Steps.BasicInfo;
    } else if (step == 2) {
      currentStep = Steps.NotifyBasicInfo;
    } else {
      currentStep = Steps.TaskInfo;
    }
  }

  const emit = defineEmits(['submit', 'close']);

  function submit() {
    emit('submit', currentQuestId);
  }
</script>

<template>
  <n-card title="新建任务" style="max-width: 80%" closable @close="emit('close')">
    <n-steps
      @update:current="updateStep"
      class="mt-4"
      :current="(currentStep as number)+1"
      :status="'process'"
    >
      <n-step :disabled="(currentStep as number)<1" title="基本信息" description="任务的基本信息" />
      <n-step
        :disabled="(currentStep as number)<2"
        title="到货计划"
        description="任务涵盖的到货计划"
      />
      <n-step
        :disabled="(currentStep as number)<3"
        title="到货计划详情"
        description="任务涵盖的到货计划"
      />
      <n-step :disabled="(currentStep as number)<4" title="操作计划" description="操作具体的计划" />
    </n-steps>
    <n-divider class="mb-4 mt-8" />
    <template v-if="loading">
      <div class="p-16 flex items-center justify-center">
        <n-spin size="large" />
      </div>
    </template>
    <template v-else>
      <new-task-step1-form
        v-if="currentStep == Steps.BasicInfo"
        @submit="basicInfoSubmit"
        :model="basicInfo"
      />
      <template v-else-if="currentStep === Steps.NotifyBasicInfo">
        <box-form
          :model="notifyFormInfo"
          v-if="questNotifyType == QuestNotifyType.Box"
          @submit="notifyInfoSubmit"
        />
        <tray-form
          :model="notifyFormInfo"
          v-else-if="questNotifyType == QuestNotifyType.Tray"
          @submit="notifyInfoSubmit"
        />
        <notify-container-form
          :model="notifyFormInfo"
          v-else-if="questNotifyType == QuestNotifyType.Container"
          @submit="notifyInfoSubmit"
        />
      </template>
      <template v-else-if="currentStep == Steps.NotifyDetail">
        <div>
          <notify-tasks-table @next="currentStep = Steps.TaskInfo" :notify-id="currentNotifyId" />
        </div>
      </template>
      <template v-else-if="currentStep === Steps.TaskInfo">
        <new-operation-table @next="submit" :quest-id="currentQuestId" />
      </template>
    </template>
  </n-card>
</template>

<style scoped lang="less"></style>
