<script lang="ts" setup>
  import { computed, onMounted, reactive } from 'vue';
  import { safeParseFloat } from '@/store/utils/utils';
  import { cloneDeep } from 'lodash-es';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { getNotifyById } from '@/api/newDataLayer/Notify/Notify';
  import { getCustomerById } from '@/api/newDataLayer/Customer/Customer';
  import { getTaskListByNotifyId } from '@/api/newDataLayer/TaskList/TaskList';
  import {
    addOrUpdateNotifySettlement,
    getNotifySettlementByNotifyId,
  } from '@/api/newDataLayer/NotifySettlement/NotifySettlement';
  import { $ref } from 'vue/macros';

  interface Props {
    notifyId: string;
  }

  const props = defineProps<Props>();
  let notifyDetail: any | null = $ref(null);
  let customerInfoany: [] = $ref(null);
  let currentTaskList: any[] = $ref([]);
  const defaultExtraInfo = {
    note: '',
    unloadingFee: '',
    otherFee: '',
    status: '',
    totalFee: '',
    customerId: '',
    notifyId: '',
  };
  const extraInfo = reactive(defaultExtraInfo);

  const emit = defineEmits(['close', 'refresh', 'save']);

  onMounted(async () => {
    await reload();
  });

  const totalPrice = computed(() => {
    return safeParseFloat(extraInfo.unloadingFee) + safeParseFloat(extraInfo.otherFee);
  });

  let settlementInfo = $ref([]);

  async function reload() {
    if (props.notifyId != null) {
      settlementInfo = await getNotifySettlementByNotifyId(props.notifyId);
      if (settlementInfo.length > 0) {
        extraInfo.otherFee = settlementInfo[0].otherFee;
        extraInfo.unloadingFee = settlementInfo[0].unloadingFee;
        extraInfo.note = settlementInfo[0].note;
        extraInfo.id = settlementInfo[0].id;
      }
      notifyDetail = await getNotifyById(props.notifyId);
      customerInfoany = await getCustomerById(notifyDetail?.customer.id);
      currentTaskList = await getTaskListByNotifyId(props.notifyId);
      Object.assign(extraInfo, cloneDeep(notifyDetail?.extraInfo ?? defaultExtraInfo));
      console.log(notifyDetail, 'detail');
      emit('refresh');
    }
  }
  async function confirm() {
    await safeScope(async () => {
      console.log(extraInfo, 'extraInfo');
      extraInfo.status = '已结算';
      extraInfo.notifyId = props.notifyId;
      extraInfo.customerId = notifyDetail.customer.id;
      extraInfo.totalFee = totalPrice.value;
      await addOrUpdateNotifySettlement(extraInfo);
      emit('save');
    });
  }
</script>
5a
<template>
  <div class="mt-8">
    <n-descriptions v-if="notifyDetail" :columns="3" bordered label-placement="left">
      <n-descriptions-item :span="2" label="货柜号">
        {{ notifyDetail?.containerNo }}
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="客户ID">
        {{ customerInfoany?.customerName }}</n-descriptions-item
      >
      <n-descriptions-item :span="2" label="卸柜费">
        <n-input v-model:value="extraInfo.unloadingFee" />
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="其他费用">
        <n-input v-model:value="extraInfo.otherFee" />
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="费用总额">
        <n-input v-model:value="totalPrice" disabled />
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="备注">
        <n-input v-model:value="extraInfo.note" />
      </n-descriptions-item>
    </n-descriptions>
    <n-space class="mt-4">
      <n-button secondary type="primary" @click="confirm">确认结算</n-button>
    </n-space>
  </div>
</template>

<style lang="less" scoped></style>
