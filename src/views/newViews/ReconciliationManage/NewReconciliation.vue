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
  import { FinanceContainerManager, FinanceManager } from '@/api/dataLayer/modules/cash/cash';

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
          await FinanceManager.editInternal(values, prop.model.id);
        } else {
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
