<script lang="ts" setup>
  import { computed, reactive, watchEffect } from 'vue';
  import { CashStatus } from '@/api/dataLayer/modules/notify/notify-api';
  import { safeParseFloat } from '@/store/utils/utils';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { OperationType, saveCash } from '@/api/dataLayer/modules/cash/cash';
  import { updateOutboundForecast } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';
  import { cloneDeep } from 'lodash-es';

  interface Props {
    currentInfo: string;
  }

  const props = defineProps<Props>();
  let currentOutBoundInfo = $ref([]);
  const defaultExtraInfo = {
    outPriceNote: '',
    outOtherPrice: '',
    outPrice: '',
    finalPrice: '',
  };
  const extraInfo = reactive(defaultExtraInfo);

  const emit = defineEmits(['close', 'refresh', 'save']);
  watchEffect(async () => {
    await reload();
  });

  const totalPrice = computed(() => {
    return safeParseFloat(extraInfo.outPrice) + safeParseFloat(extraInfo.outOtherPrice);
  });

  async function reload() {
    if (props.currentInfo != null) {
      currentOutBoundInfo = props.currentInfo;
      console.log(currentOutBoundInfo, 'info');
      Object.assign(extraInfo, cloneDeep(currentOutBoundInfo?.extraInfo ?? defaultExtraInfo));
      emit('refresh');
    }
  }
  async function confirm() {
    await safeScope(async () => {
      await updateOutboundForecast(currentOutBoundInfo?.id, {
        cashStatus: CashStatus.Done,
        finalPrice: extraInfo.finalPrice,
      });
      // await saveCash(
      //   {
      //     ref: currentOutBoundInfo?.ref ?? '',
      //     operationId: currentOutBoundInfo.id,
      //     operationType: OperationType.Out,
      //     amount: extraInfo.outPrice,
      //     note: extraInfo.outPriceNote,
      //     subtotal: safeParseFloat(extraInfo.outPrice) + safeParseFloat(extraInfo.outOtherPrice),
      //     outOtherPrice: extraInfo.outOtherPrice,
      //   },
      //   currentOutBoundInfo?.outCashId
      // );
      emit('save');
    });
  }

  async function save() {
    const editValue: any = {
      extraInfo,
      cashStatus: CashStatus.WaitConfirm,
    };

    await safeScope(async () => {
      editValue.containerFinalStatus = CashStatus.WaitConfirm;
      editValue.outFinalPrice = extraInfo.finalPrice;
      editValue.outCashId = await saveCash(
        {
          ref: currentOutBoundInfo?.ref ?? '',
          operationId: currentOutBoundInfo.id,
          operationType: OperationType.Out,
          amount: extraInfo.outPrice,
          note: extraInfo.outPriceNote,
          subtotal: safeParseFloat(extraInfo.outPrice) + safeParseFloat(extraInfo.outOtherPrice),
          outOtherPrice: extraInfo.outOtherPrice,
        },
        currentOutBoundInfo?.outCashId
      );
      console.log(editValue, 'value');
      await updateOutboundForecast(currentOutBoundInfo?.id, editValue);
      emit('save');
    });
  }
</script>

<template>
  <div class="mt-8">
    <n-descriptions :columns="3" bordered label-placement="left">
      <n-descriptions-item :span="2" label="Ref.">
        {{ currentOutBoundInfo.ref }}
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="装柜费">
        <n-input v-model:value="extraInfo.outPrice" />
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="其他费用">
        <n-input v-model:value="extraInfo.outOtherPrice" />
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="费用总额">
        <n-input v-model:value="totalPrice" disabled />
      </n-descriptions-item>
      <n-descriptions-item :span="2" label="备注">
        <n-input v-model:value="extraInfo.outPriceNote" />
      </n-descriptions-item>
    </n-descriptions>
    <n-space class="mt-4">
      <n-button secondary type="warning" @click="save">保存结算</n-button>
      <n-button secondary type="primary" @click="confirm">确认结算</n-button>
    </n-space>
  </div>
</template>

<style lang="less" scoped></style>
