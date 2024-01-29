<template>
  <n-card class="proCard">
    <loading-frame :loading="loading">
      <normal-form
        :default-value-model="model"
        :form-fields="typeMission === '货柜对账' ? schemas : schemasContainer"
        @submit="handleSubmit"
      />
    </loading-frame>
  </n-card>
</template>
<script lang="ts" setup>
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { schemas, schemasContainer } from './columns';
  import {
    CashManager,
    FinanceContainerManager,
    FinanceManager,
  } from '@/api/dataLayer/modules/cash/cash';
  import { updateSettlement } from '@/api/dataLayer/common/SettlementType';
  import { NotifyDetailManager } from '@/api/dataLayer/modules/notify/notify-detail';
  import { NotifyManager } from '@/api/dataLayer/modules/notify/notify-api';

  interface Props {
    model?: any;
    typeMission?: any;
  }

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();

  const emit = defineEmits(['saved']);

  async function handleSubmit(values: any) {
    loading = true;
    await safeScope(async () => {
      if (prop?.model?.id) {
        if (prop.typeMission === '货柜对账') {
          const res = await FinanceManager.getById(prop.model.id);
          for (const item of res?.detailInfo) {
            item.finalStatus = values.collectionStatus;
            item.detailInfo.finalStatus = values.collectionStatus;
            await updateSettlement(item.id, item);
            await NotifyDetailManager.editInternal(item.detailInfo, item.detailInfo.id);
          }
          await FinanceManager.editInternal(values, prop.model.id);
        } else {
          const res = await FinanceContainerManager.getById(prop.model.id);
          for (const item of res?.detailInfo) {
            item.containerFinalStatus = values.collectionStatus;
            await CashManager.editInternal(item, item.id);
            let currentNotify = await NotifyManager.getById(item.operationId);
            currentNotify.containerFinalStatus = values.collectionStatus;
            await NotifyManager.editInternal(currentNotify, currentNotify.id);
          }
          await FinanceContainerManager.editInternal(values, prop.model.id);
        }
      } else {
        if (prop.typeMission === '货柜对账') {
          await FinanceManager.addInternal(values);
        } else {
          await FinanceContainerManager.addInternal(values);
        }
      }
      emit('saved', values);
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
