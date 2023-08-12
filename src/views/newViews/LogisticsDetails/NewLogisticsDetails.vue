<template>
  <n-card class="proCard">
    <loading-frame :loading="loading">
      <normal-form :default-value-model="model" :form-fields="schemas" @submit="handleSubmit" />
    </loading-frame>
  </n-card>
</template>
<script lang="ts" setup>
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import { LogisticDetailManager } from '@/api/dataLayer/modules/logistic/logistic';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { carpoolSelfCheck } from '@/api/dataLayer/modules/logistic/carpool';

  interface Props {
    model?: any;
  }
  const props = defineProps<Props>();
  let loading: boolean = $ref(false);
  const schemas: FormField[] = [
    {
      field: 'price',
      label: '报价',
    },
    {
      field: 'note',
      label: '备注',
    },
    {
      field: 'settlementPrice',
      label: '结算金额',
    },
    {
      field: 'specialCharges',
      label: '特殊收费',
    },
    {
      field: 'cashNote',
      label: '结算备注',
    },
  ].map((it: FormField) => {
    it.required = false;
    return it;
  });

  const emit = defineEmits(['saved']);

  async function handleSubmit(values: any) {
    loading = true;
    await safeScope(async () => {
      await LogisticDetailManager.editInternal(values, props.model.id);
      const info = await LogisticDetailManager.getById(props.model.id);
      if (info.carpoolId) {
        await carpoolSelfCheck(info.carpoolId);
      }

      emit('saved');
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
