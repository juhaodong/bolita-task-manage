<script lang="ts" setup>
  import { computed, reactive, watchEffect } from 'vue';
  import { CashStatus, NotifyManager } from '@/api/dataLayer/modules/notify/notify-api';
  import { getNotifyDetailListByNotify } from '@/api/dataLayer/modules/notify/notify-detail';
  import { safeParseFloat, safeParseInt } from '@/store/utils/utils';
  import { cloneDeep } from 'lodash-es';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { OperationType, saveCash } from '@/api/dataLayer/modules/cash/cash';
  import { usePermission } from '@/hooks/web/usePermission';
  import { PermissionEnums } from '@/api/dataLayer/modules/system/user/baseUser';

  interface Props {
    notifyId: string;
  }

  const { hasPermission } = usePermission();

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
      <n-descriptions-item label="客户ID"> {{ notifyDetail?.customerId }}</n-descriptions-item>
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
      <n-input v-model:value="extraInfo.explain" placeholder="说明" />
    </div>
    <n-space class="mt-4">
      <n-button
        v-if="
          hasPermission([
            PermissionEnums.Manager,
            PermissionEnums.Operator,
            PermissionEnums.Sales,
            PermissionEnums.Cash,
          ])
        "
        :disabled="!extraInfo.finalPrice"
        secondary
        type="warning"
        @click="save"
        >保存结算</n-button
      >
      <n-button
        v-if="
          hasPermission([
            PermissionEnums.CustomerManage,
            PermissionEnums.Manager,
            PermissionEnums.Operator,
            PermissionEnums.Sales,
            PermissionEnums.Cash,
          ])
        "
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
