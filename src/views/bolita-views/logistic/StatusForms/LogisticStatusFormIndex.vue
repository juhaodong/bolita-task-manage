<template>
  <logistic-feed-back-form
    :logistic-type="logisticType"
    v-if="status === LogisticStatus.WaitForFeedBack"
    @submit="submit"
  />
  <logistic-out-delivery-form
    :logistic-type="logisticType"
    v-else-if="status === LogisticStatus.ReadyToSend"
    @submit="submit"
  />
  <logistic-finish-form
    :logistic-type="logisticType"
    v-else-if="status === LogisticStatus.Sent"
    @submit="submit"
  />
</template>

<script setup lang="ts">
  import {
    LogisticStatus,
    LogisticType,
  } from '@/api/dataLayer/modules/deliveryMethod/logistic-type';
  import LogisticFeedBackForm from '@/views/bolita-views/logistic/StatusForms/LogisticFeedBackForm.vue';
  import LogisticOutDeliveryForm from '@/views/bolita-views/logistic/StatusForms/LogisticOutDeliveryForm.vue';
  import LogisticFinishForm from '@/views/bolita-views/logistic/StatusForms/LogisticFinishForm.vue';

  interface Props {
    logisticType: LogisticType;
    status: LogisticStatus;
  }
  defineProps<Props>();
  const emit = defineEmits(['submit']);

  function submit(value) {
    console.log(value);
    emit('submit', value);
  }
</script>

<style scoped></style>
