<script setup lang="ts">
  import { computed, watchEffect } from 'vue';
  import { NotifyManager } from '@/api/dataLayer/modules/notify/notify-api';
  import { getNotifyDetailListByNotify } from '@/api/dataLayer/modules/notify/notify-detail';
  import { safeParseFloat, safeParseInt } from '@/store/utils/utils';

  interface Props {
    notifyId: string;
  }

  const props = defineProps<Props>();
  let notifyDetail: any | null = $ref(null);
  let currentTaskList: any[] = $ref([]);

  const emit = defineEmits(['close', 'refresh']);
  watchEffect(async () => {
    await reload();
  });

  const totalContainerCount = computed(() => {
    return currentTaskList.reduce((sum, i) => sum + safeParseInt(i?.containerNum), 0);
  });

  const totalTrayCount = computed(() => {
    return currentTaskList.reduce((sum, i) => sum + safeParseInt(i?.trayCount), 0);
  });
  const totalArrivedContainerCount = computed(() => {
    return currentTaskList.reduce((sum, i) => sum + safeParseInt(i?.arrivedContainerNum) || 0, 0);
  });
  const totalArrivedTrayCount = computed(() => {
    return currentTaskList.reduce((sum, i) => sum + safeParseInt(i?.arrivedTrayNum), 0);
  });

  const totalPrice = computed(() => {
    return (
      safeParseFloat(containerSinglePrice) * totalArrivedContainerCount.value +
      safeParseFloat(traySinglePrice) * totalArrivedTrayCount.value
    );
  });

  async function reload() {
    if (props.notifyId != null) {
      notifyDetail = await NotifyManager.getById(props.notifyId);
      currentTaskList = await getNotifyDetailListByNotify(props.notifyId);
      emit('refresh');
    }
  }

  let explain = $ref('');

  let traySinglePrice: string = $ref('');
  let containerSinglePrice: string = $ref('');
  let trayNote: string = $ref('');
  let containerNote: string = $ref('');
  let finalPrice: string = $ref('');
  let feeNote: string = $ref('');
  const canConfirm = computed(() => {
    return (
      totalTrayCount.value == totalArrivedTrayCount.value &&
      totalContainerCount.value == totalArrivedContainerCount.value &&
      explain
    );
  });
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
        {{ notifyDetail?.warehouse ?? '-' }}
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
                v-model:value="traySinglePrice"
                placeholder=""
                @focus="traySinglePrice = ''"
              />
            </td>
            <td>
              {{ safeParseFloat(traySinglePrice) * totalArrivedTrayCount }}
            </td>
            <td>
              <n-input v-model:value="trayNote" placeholder="" />
            </td>
          </tr>
          <tr>
            <td>-</td>
            <td>{{ totalArrivedContainerCount }}</td>
            <td>
              <n-input
                v-model:value="containerSinglePrice"
                placeholder=""
                @focus="containerSinglePrice = ''"
              />
            </td>
            <td>
              {{ safeParseFloat(containerSinglePrice) * totalArrivedContainerCount }}
            </td>
            <td>
              <n-input v-model:value="containerNote" placeholder="" />
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
              <n-input v-model:value="finalPrice" placeholder="" />
            </td>
            <td> <n-input v-model:value="feeNote" placeholder="" /> </td>
          </tr>
        </tbody>
      </n-table>
    </div>
    <div class="mt-4">
      <n-input placeholder="说明" v-model="explain" />
    </div>
    <n-space class="mt-4">
      <n-button type="primary" :disabled="!canConfirm">保存</n-button>
      <n-button type="primary" :disabled="!canConfirm">确认</n-button>
    </n-space>
  </div>
</template>

<style scoped lang="less"></style>
