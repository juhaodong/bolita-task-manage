<template>
  <n-card class="proCard">
    <loading-frame :loading="loading">
      <normal-form
        :default-value-model="model"
        :form-fields="schemas"
        @submit="handleSubmit"
        :show-buttons="false"
      >
        <template #extraSubmitButton="{ submit }">
          <n-button :disabled="model.paymentSubmit" @click="submit" type="info"
            >提交付款申请</n-button
          >
        </template>
        <template #extraContent>
          <n-popconfirm
            v-if="!model?.paymentSubmit"
            @positive-click="handleSubmit({ paymentSubmit: true })"
          >
            <template #trigger>
              <n-button type="success">确认付款</n-button>
            </template>
            确认本款项已经支付
          </n-popconfirm>
          <template v-else> 已经支付 </template>
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
  import { getDatePickerFormField } from '@/api/dataLayer/fieldDefination/common';
  import { CarpoolManager } from '@/api/dataLayer/modules/logistic/carpool';
  import { generateOptionFromArray } from '@/store/utils/utils';
  import { NAutoComplete } from 'naive-ui';
  import { computed, reactive } from 'vue';
  import { db, getDocContent } from '@/store/plugins/firebase';
  import { doc, setDoc } from 'firebase/firestore';

  interface Props {
    model?: any;
  }

  let loading: boolean = $ref(false);
  const prop = defineProps<Props>();
  const docRef = doc(db, 'systemConfig', 'default');
  let systemConfig: { receiver: any[]; iban: any[] } = reactive({
    receiver: [],
    iban: [],
  });

  async function init() {
    const res = await getDocContent(docRef);
    Object.assign(systemConfig, res);
  }

  async function saveSystemConfig(value: any) {
    if (value.receiver && !systemConfig.receiver.includes(value.receiver)) {
      systemConfig.receiver.push(value.receiver);
    }
    if (value.iban && !systemConfig.iban.includes(value.iban)) {
      systemConfig.iban.push(value.iban);
    }
    await setDoc(docRef, systemConfig);
  }

  init();

  const schemas = computed(() => {
    console.log(systemConfig.receiver);
    return [
      {
        field: 'billedCompany',
        label: '出账公司',
        component: 'NSelect',
        componentProps: {
          options: generateOptionFromArray(['A', 'B', 'C', 'D']),
        },
      },
      {
        field: 'receiver',
        label: '收款人',
        component: NAutoComplete,
        componentProps: {
          options: systemConfig.receiver,
        },
      },
      {
        field: 'iban',
        label: 'IBAN',
        component: NAutoComplete,
        componentProps: {
          options: systemConfig.iban,
        },
      },
      {
        field: 'billNumber',
        label: 'Rechnungsnummer',
      },
      getDatePickerFormField('paymentDate', '付款日期'),
      {
        field: 'totalCost',
        label: '付款金额.',
      },
      {
        field: 'paymentReason',
        label: '付款事由',
      },
    ].map((it: FormField) => {
      it.required = false;
      return it;
    });
  });

  const emit = defineEmits(['saved']);

  async function handleSubmit(values) {
    loading = true;
    if (prop.model) {
      await safeScope(async () => {
        await CarpoolManager.editInternal(values, prop.model.id);
        await saveSystemConfig(values);
        emit('saved', values);
      });
    } else {
      emit('saved', values);
    }

    loading = false;
  }
</script>

<style lang="less" scoped></style>
