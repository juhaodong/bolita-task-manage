<script setup lang="ts">
  import { $ref } from 'vue/macros';
  import NewTaskStep1Form from '@/views/bolita-views/task/new/step/NewQuestFormStep1.vue';
  import { QuestNotifyType } from '@/api/quest/quest-type';
  import BoxForm from '@/views/bolita-views/notify/NotifyFormPage/BoxForm.vue';
  import TrayForm from '@/views/bolita-views/notify/NotifyFormPage/TrayForm.vue';
  import NotifyContainerForm from '@/views/bolita-views/notify/NotifyFormPage/NotifyContainerForm.vue';
  import NotifyTasksTable from '@/views/bolita-views/notify/NotifyDetail/NotifyTasksTable.vue';
  import { createNotify, NotifyCreateDTO } from '@/api/notify/notify-api';
  import { handleRequest } from '@/utils/utils';
  import NewOperationTable from '@/views/bolita-views/operation/NewQuestOperationList/NewOperationTable.vue';
  import { createNewQuest, updateNotifyInfo } from '@/api/quest/quest-api';

  enum Steps {
    BasicInfo,
    NotifyInfo,
    TaskInfo,
  }
  let currentStep = $ref(Steps.TaskInfo);
  let questNotifyType: QuestNotifyType | null = $ref(null);
  let currentNotifyId = $ref('NnT7Bu3HPsMyAoRXUI8w');
  let currentQuestId = $ref('OIrpN3S8x98Xur3qLdQx');
  let basicInfo: any | null = $ref(null);
  let loading = $ref(false);

  async function basicInfoSubmit(result) {
    basicInfo = result;
    questNotifyType = basicInfo.notifyType;
    const res = await createNewQuest(basicInfo);
    await handleRequest(res, () => {
      currentQuestId = res.result;
      if (questNotifyType !== QuestNotifyType.None) {
        currentStep = Steps.NotifyInfo;
        notifyInfoStep = 0;
      } else {
        currentStep = Steps.TaskInfo;
      }
    });
  }
  async function createNewNotify(value) {
    if (basicInfo != null) {
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
      const res = await createNotify(info);
      await handleRequest(res, async () => {
        notifyInfoStep = 1;
        currentNotifyId = res.result;
        await handleRequest(await updateNotifyInfo(currentNotifyId, currentQuestId), () => {});
        console.log(currentNotifyId, '预报创建成功，id');
      });
    }
  }

  let notifyInfoStep = $ref(1);
  async function notifyInfoSubmit(value) {
    await createNewNotify(value);
  }
</script>

<template>
  <n-card style="max-width: 80%">
    <n-steps class="mt-4" size="small" :current="(currentStep as number)+1" :status="'process'">
      <n-step title="基本信息" />
      <n-step title="到货计划" />
      <n-step title="操作计划" />
    </n-steps>
    <n-divider class="mb-4 mt-8" />
    <template v-if="loading">
      <div class="p-16 flex items-center justify-center">
        <n-spin size="large" />
      </div>
    </template>
    <template v-else>
      <new-task-step1-form v-if="currentStep == Steps.BasicInfo" @submit="basicInfoSubmit" />
      <template v-else-if="currentStep === Steps.NotifyInfo">
        <template v-if="notifyInfoStep == 0">
          <box-form v-if="questNotifyType == QuestNotifyType.Box" @submit="notifyInfoSubmit" />
          <tray-form
            v-else-if="questNotifyType == QuestNotifyType.Tray"
            @submit="notifyInfoSubmit"
          />
          <notify-container-form
            v-else-if="questNotifyType == QuestNotifyType.Container"
            @submit="notifyInfoSubmit"
          />
        </template>
        <template v-else-if="notifyInfoStep == 1">
          <div>
            <notify-tasks-table @next="currentStep = Steps.TaskInfo" :notify-id="currentNotifyId" />
          </div>
        </template>
      </template>
      <template v-else-if="currentStep === Steps.TaskInfo">
        <new-operation-table :quest-id="currentQuestId" />
      </template>
    </template>
  </n-card>
</template>

<style scoped lang="less"></style>
