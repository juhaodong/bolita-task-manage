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
    explain: '',
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
    return (
      safeParseFloat(extraInfo.containerSinglePrice) * totalArrivedContainerCount.value +
      safeParseFloat(extraInfo.traySinglePrice) * totalArrivedTrayCount.value
    );
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
      await NotifyManager.edit(editValue, props.notifyId);
      await saveCash(
        {
          customerId: notifyDetail?.customerId,
          containerNo: notifyDetail?.containerNo,
          operationId: props.notifyId,
          operationType: OperationType.In,
          amount: extraInfo.finalPrice,
          note: extraInfo.explain,
          cashStatus: CashStatus.Done,
        },
        notifyDetail?.cashId
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
      editValue.cashId = await saveCash(
        {
          customerId: notifyDetail?.customerId,
          containerNo: notifyDetail?.containerNo,
          operationId: props.notifyId,
          operationType: OperationType.In,
          amount: extraInfo.finalPrice,
          note: extraInfo.explain,
        },
        notifyDetail?.cashId
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
      <n-descriptions-item label="客户ID"> {{ customerInfoany?.customerName }}</n-descriptions-item>
      <n-descriptions-item :span="2" label="入库总数">
        {{ notifyDetail?.totalCount }}
      </n-descriptions-item>
      <n-descriptions-item label="入库ID">
        {{ notifyDetail?.id }}
      </n-descriptions-item>
      <n-descriptions-item label="仓库ID">
        {{ notifyDetail?.warehouseId ?? '-' }}
      </n-descriptions-item>
    </n-descriptions>
    <div class="mt-4">
      <n-table :single-line="false" class="mt-4">
        <thead>
          <tr>
            <th>入库 托</th>
            <th>入库 箱</th>
            <th>单价</th>
            <th style="width: 100px">合计</th>
            <th style="width: 100px">备注</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ totalArrivedTrayCount }}</td>
            <td>-</td>
            <td>
              <n-input
                v-model:value="extraInfo.traySinglePrice"
                :disabled="!customerPower"
                placeholder=""
                @focus="extraInfo.traySinglePrice = ''"
              />
            </td>
            <td>
              {{ safeParseFloat(extraInfo.traySinglePrice) * totalArrivedTrayCount }}
            </td>
            <td>
              <n-input
                v-model:value="extraInfo.trayNote"
                :disabled="!customerPower"
                placeholder=""
              />
            </td>
          </tr>
          <tr>
            <td>-</td>
            <td>{{ totalArrivedContainerCount }}</td>
            <td>
              <n-input
                v-model:value="extraInfo.containerSinglePrice"
                :disabled="!customerPower"
                placeholder=""
                @focus="extraInfo.containerSinglePrice = ''"
              />
            </td>
            <td>
              {{ safeParseFloat(extraInfo.containerSinglePrice) * totalArrivedContainerCount }}
            </td>
            <td>
              <n-input
                v-model:value="extraInfo.containerNote"
                :disabled="!customerPower"
                placeholder=""
              />
            </td>
          </tr>
          <tr>
            <td>合计</td>
            <td> -</td>
            <td> -</td>
            <td>
              {{ totalPrice }}
            </td>
            <td> - </td>
          </tr>
          <tr>
            <td>结算金额</td>
            <td> -</td>
            <td> -</td>
            <td>
              <n-input
                v-model:value="extraInfo.finalPrice"
                :disabled="!customerPower"
                placeholder=""
              />
            </td>
            <td>
              <n-input
                v-model:value="extraInfo.feeNote"
                :disabled="!customerPower"
                placeholder=""
              />
            </td>
          </tr>
        </tbody>
      </n-table>
    </div>
    <div class="mt-4">
      <n-input v-model:value="extraInfo.explain" :disabled="!customerPower" placeholder="说明" />
    </div>
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
