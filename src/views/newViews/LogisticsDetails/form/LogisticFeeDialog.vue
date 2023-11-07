<template>
  <n-card class="proCard">
    <loading-frame :loading="loading">
      <normal-form
        :default-value-model="model"
        :form-fields="schemas"
        :show-buttons="false"
        @submit="handleSubmit"
      >
        <template #extraSubmitButton="{ submit }">
          <n-button
            v-if="submitQuotationBtn"
            :disabled="model.priceConfirmed"
            type="info"
            @click="submit"
            >提交报价</n-button
          >
        </template>
        <template #extraContent>
          <n-popconfirm v-if="!model?.priceConfirmed" @positive-click="confirmPrice">
            <template #trigger>
              <n-button v-if="confirmQuotationBtn" type="success">确认报价</n-button>
            </template>
            我确认接受此报价
          </n-popconfirm>
          <template v-else> 已经确认</template>
        </template>
      </normal-form>
    </loading-frame>
  </n-card>
</template>
<script lang="ts" setup>
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { FormField } from '@/views/bolita-views/composable/form-field-type';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { carpoolSelfCheck } from '@/api/dataLayer/modules/logistic/carpool';
  import { OutBoundPlanManager } from '@/api/dataLayer/modules/OutBoundPlan/outBoundPlan';
  import { OutStatus } from '@/api/dataLayer/modules/notify/notify-api';
  import { usePermission } from '@/hooks/web/usePermission';
  import { computed } from 'vue';
  import { useUserStore } from '@/store/modules/user';
  import { LogisticsDetailPower } from '@/api/dataLayer/common/PowerModel';

  const { hasPermission } = usePermission();

  interface Props {
    model?: any;
  }

  const props = defineProps<Props>();
  let loading: boolean = $ref(false);
  const AccountPowerList = computed(() => {
    return useUserStore()?.info?.powerList;
  });
  const submitQuotationBtn = computed(() => {
    return AccountPowerList.value.includes(LogisticsDetailPower.SubmitQuotation);
  });
  const confirmQuotationBtn = computed(() => {
    return AccountPowerList.value.includes(LogisticsDetailPower.ConfirmQuotation);
  });
  const schemas: FormField[] = [
    {
      field: 'price',
      label: '报价',
    },
    {
      field: 'specialCharges',
      label: '特殊收费',
    },
    {
      field: 'note',
      label: '备注',
    },
  ].map((it: FormField) => {
    it.required = false;
    return it;
  });

  const emit = defineEmits(['saved']);
  async function confirmPrice() {
    await handleSubmit({
      priceConfirmed: true,
      outStatus: OutStatus.Wait,
    });
  }
  async function handleSubmit(values: any) {
    loading = true;
    await safeScope(async () => {
      console.log(props.model.id, 'id1');
      await OutBoundPlanManager.editInternal(values, props.model.id);
      console.log(props.model.id, 'id2');
      const info = await OutBoundPlanManager.getById(props.model.id);
      console.log(info, 'info');
      if (info.carpoolId) {
        console.log(info.carpoolId, 'id3');
        await carpoolSelfCheck(info.carpoolId);
      }
      emit('saved');
    });
    loading = false;
  }
</script>

<style lang="less" scoped></style>
