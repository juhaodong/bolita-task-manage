<script lang="ts" setup>
  import { computed, reactive, watchEffect } from 'vue';
  import { CashStatus, NotifyManager } from '@/api/dataLayer/modules/notify/notify-api';
  import { getNotifyDetailListByNotify } from '@/api/dataLayer/modules/notify/notify-detail';
  import { safeParseFloat, safeParseInt } from '@/store/utils/utils';
  import { cloneDeep } from 'lodash-es';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { OperationType, saveCash } from '@/api/dataLayer/modules/cash/cash';
  import { NotifyListPower } from '@/api/dataLayer/common/PowerModel';
  import { useUserStore } from '@/store/modules/user';
  import { CustomerManager } from '@/api/dataLayer/modules/user/user';

  interface Props {
    notifyId: string;
  }

  const props = defineProps<Props>();
  let notifyDetail: any | null = $ref(null);
  let customerInfoany: [] = $ref(null);
  let currentTaskList: any[] = $ref([]);
  const defaultExtraInfo = {
    note: '',
    otherPrice: '',
    inboundPrice: '',
    traySinglePrice: '',
    containerSinglePrice: '',
    trayNote: '',
    containerNote: '',
    feeNote: '',
    finalPrice: '',
  };
  const extraInfo = reactive(defaultExtraInfo);

  const emit = defineEmits(['close', 'refresh', 'save']);
  watchEffect(async () => {
    await reload();
  });

  const totalArrivedContainerCount = computed(() => {
    return currentTaskList.reduce((sum, i) => sum + safeParseInt(i?.arrivedContainerNum) || 0, 0);
  });
  const totalArrivedTrayCount = computed(() => {
    return currentTaskList.reduce((sum, i) => sum + safeParseInt(i?.arrivedTrayNum), 0);
  });
  const AccountPowerList = computed(() => {
    return useUserStore()?.info?.powerList;
  });
  const saveBtn = computed(() => {
    return AccountPowerList.value.includes(NotifyListPower.CostSave);
  });
  const confirmBtn = computed(() => {
    return AccountPowerList.value.includes(NotifyListPower.CostConfirm);
  });
  const customerPower = computed(() => {
    return AccountPowerList.value.includes(NotifyListPower.editFee);
  });

  const totalPrice = computed(() => {
    return safeParseFloat(extraInfo.inboundPrice) + safeParseFloat(extraInfo.otherPrice);
  });

  async function reload() {
    if (props.notifyId != null) {
      notifyDetail = await NotifyManager.getById(props.notifyId);
      customerInfoany = await CustomerManager.getById(notifyDetail?.customerId);
      currentTaskList = await getNotifyDetailListByNotify(props.notifyId);
      Object.assign(extraInfo, cloneDeep(notifyDetail?.extraInfo ?? defaultExtraInfo));
      emit('refresh');
    }
  }
  async function confirm() {
    const editValue = {
      cashStatus: CashStatus.Done,
    };
    await safeScope(async () => {
      await NotifyManager.edit({ editValue, finalPrice: extraInfo.finalPrice }, props.notifyId);
      await saveCash(
        {
          customerId: notifyDetail?.customerId,
          containerNo: notifyDetail?.containerNo,
          operationId: props.notifyId,
          operationType: OperationType.In,
          amount: extraInfo.inboundPrice,
          note: extraInfo.note,
          otherPrice: extraInfo.otherPrice,
          cashStatus: CashStatus.Done,
          subtotal: extraInfo.finalPrice,
        },
        notifyDetail?.outCashId
      );
      emit('save');
    });
  }

  async function save() {
    const editValue: any = {
      extraInfo,
      cashStatus: CashStatus.WaitConfirm,
    };

    await safeScope(async () => {
      editValue.inboundFinalPrice = extraInfo.finalPrice;
      editValue.outCashId = await saveCash(
        {
          customerId: notifyDetail?.customerId,
          containerNo: notifyDetail?.containerNo,
          operationId: props.notifyId,
          operationType: OperationType.In,
          amount: extraInfo.inboundPrice,
          note: extraInfo.note,
          cashStatus: CashStatus.Done,
          subtotal: extraInfo.finalPrice,
          otherPrice: extraInfo.otherPrice,
        },
        notifyDetail?.outCashId
      );
      await NotifyManager.edit(editValue, props.notifyId);
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
        <n-input v-model:value="extraInfo.inboundPrice" :disabled="!customerPower" />
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="其他费用">
        <n-input v-model:value="extraInfo.otherPrice" :disabled="!customerPower" />
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="费用总额">
        <n-input v-model:value="totalPrice" disabled />
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="结算金额">
        <n-input v-model:value="extraInfo.finalPrice" :disabled="!customerPower" />
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="备注">
        <n-input v-model:value="extraInfo.note" :disabled="!customerPower" />
      </n-descriptions-item>
    </n-descriptions>
    <n-space class="mt-4">
      <n-button
        v-if="saveBtn"
        :disabled="!extraInfo.finalPrice"
        secondary
        type="warning"
        @click="save"
        >保存结算</n-button
      >
      <n-button
        v-if="confirmBtn"
        :disabled="notifyDetail?.cashStatus != CashStatus.WaitConfirm"
        secondary
        type="primary"
        @click="confirm"
        >确认结算</n-button
      >
    </n-space>
  </div>
</template>

<style lang="less" scoped></style>
