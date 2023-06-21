<script setup lang="ts">
  import { $ref } from 'vue/macros';
  import NewLogisticStep1Form from '@/views/bolita-views/logistic/newLogisticForm/NewLogisticStep1Form.vue';
  import { LogisticType } from '@/api/deliveryMethod/logistic-type';
  import LogisticAmazonForm from '@/views/bolita-views/logistic/newLogisticForm/NewLogisticStep2Form/LogisticAmazonForm.vue';
  import LogisticBoxForm from '@/views/bolita-views/logistic/newLogisticForm/NewLogisticStep2Form/LogisticBoxForm.vue';
  import LogisitcOthersForm from '@/views/bolita-views/logistic/newLogisticForm/NewLogisticStep2Form/LogisitcOthersForm.vue';
  import { getLogisticTypeByDeliveryMethod } from '@/api/deliveryMethod';

  let currentStep = $ref(0);
  let logisticType: LogisticType | null = $ref(null);
  let basicInfo: any = $ref(null);
  let secondStepInfo: any = $ref(null);
  let loading = $ref(false);

  function firstFormResult(result) {
    basicInfo = result;
    basicInfo.logisticType = getLogisticTypeByDeliveryMethod(basicInfo.deliveryMethod);
    logisticType = basicInfo.logisticType;
    currentStep++;
  }

  function secondFormResult(result) {
    secondStepInfo = result;
    submit();
  }

  async function submit() {
    const sumInfo = { ...basicInfo, logisticDetail: secondStepInfo };
    loading = true;
    emit('submit', sumInfo);
    loading = false;
  }

  const emit = defineEmits(['submit']);
</script>

<template>
  <div>
    <template v-if="loading">
      <div class="p-16 flex items-center justify-center">
        <n-spin size="large" />
      </div>
    </template>
    <template v-else>
      <new-logistic-step1-form v-if="currentStep == 0" @submit="firstFormResult" />
      <template v-else-if="currentStep === 1">
        <logistic-amazon-form
          @submit="secondFormResult"
          v-if="logisticType == LogisticType.AmazonTray"
        />
        <logistic-box-form
          @submit="secondFormResult"
          v-else-if="logisticType === LogisticType.Box"
        />
        <logisitc-others-form v-else @submit="secondFormResult" />
      </template>
    </template>
  </div>
</template>

<style scoped lang="less"></style>
