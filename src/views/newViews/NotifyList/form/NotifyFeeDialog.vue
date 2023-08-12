<script setup lang="ts">
  import { computed, reactive, watchEffect } from 'vue';
  import { CashStatus, NotifyManager } from '@/api/dataLayer/modules/notify/notify-api';
  import { getNotifyDetailListByNotify } from '@/api/dataLayer/modules/notify/notify-detail';
  import { safeParseFloat, safeParseInt } from '@/store/utils/utils';
  import { cloneDeep } from 'lodash-es';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { OperationType, saveCash } from '@/api/dataLayer/modules/cash/cash';

  interface Props {
    notifyId: string;
  }

  const props = defineProps<Props>();
  let notifyDetail: any | null = $ref(null);
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

  const totalPrice = computed(() => {
    return (
      safeParseFloat(extraInfo.containerSinglePrice) * totalArrivedContainerCount.value +
      safeParseFloat(extraInfo.traySinglePrice) * totalArrivedTrayCount.value
    );
  });

  async function reload() {
    if (props.notifyId != null) {
      notifyDetail = await NotifyManager.getById(props.notifyId);
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

<template>
  <div class="mt-8">
    <n-descriptions v-if="notifyDetail" :columns="3" label-placement="left" bordered>
      <n-descriptions-item :span="2" label="货柜号">
        {{ notifyDetail?.containerNo }}
      </n-descriptions-item>
      <n-descriptions-item label="客户ID"> {{ notifyDetail?.customerId }}</n-descriptions-item>
      <n-descriptions-item label="预报总数" :span="2">
        {{ notifyDetail?.totalCount }}
      </n-descriptions-item>
      <n-descriptions-item label="仓库ID">
        {{ notifyDetail?.warehouseId ?? '-' }}
      </n-descriptions-item>
    </n-descriptions>
    <div class="mt-4">
      <n-table class="mt-4" :single-line="false">
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
                placeholder=""
                @focus="extraInfo.traySinglePrice = ''"
              />
            </td>
            <td>
              {{ safeParseFloat(extraInfo.traySinglePrice) * totalArrivedTrayCount }}
            </td>
            <td>
              <n-input v-model:value="extraInfo.trayNote" placeholder="" />
            </td>
          </tr>
          <tr>
            <td>-</td>
            <td>{{ totalArrivedContainerCount }}</td>
            <td>
              <n-input
                v-model:value="extraInfo.containerSinglePrice"
                placeholder=""
                @focus="extraInfo.containerSinglePrice = ''"
              />
            </td>
            <td>
              {{ safeParseFloat(extraInfo.containerSinglePrice) * totalArrivedContainerCount }}
            </td>
            <td>
              <n-input v-model:value="extraInfo.containerNote" placeholder="" />
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
              <n-input v-model:value="extraInfo.finalPrice" placeholder="" />
            </td>
            <td> <n-input v-model:value="extraInfo.feeNote" placeholder="" /> </td>
          </tr>
        </tbody>
      </n-table>
    </div>
    <div class="mt-4">
      <n-input placeholder="说明" v-model:value="extraInfo.explain" />
    </div>
    <n-space class="mt-4">
      <n-button @click="save" :disabled="!extraInfo.finalPrice" type="warning" secondary
        >保存结算</n-button
      >
      <n-button
        @click="confirm"
        :disabled="notifyDetail?.cashStatus != CashStatus.WaitConfirm"
        type="primary"
        secondary
        >确认结算</n-button
      >
    </n-space>
  </div>
</template>

<style scoped lang="less"></style>
