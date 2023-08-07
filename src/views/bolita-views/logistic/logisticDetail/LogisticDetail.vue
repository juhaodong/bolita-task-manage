<script setup lang="ts">
  import { $ref } from 'vue/macros';
  import { watchEffect } from 'vue';
  import ChangeLogTimeLine from '@/views/bolita-views/composable/ChangeLogTimeLine.vue';
  import AppendFileListDisplay from '@/views/bolita-views/composable/AppendFileListDisplay.vue';
  import dayjs from 'dayjs';
  import {
    LogisticModel,
    LogisticType,
  } from '@/api/dataLayer/modules/deliveryMethod/logistic-type';
  import { getLogisticInfoById } from '@/api/dataLayer/modules/deliveryMethod/logistic-api';
  import TrayInfoDisplay from '@/views/bolita-views/composable/TrayInfoDisplay.vue';
  import DeliveryMethodDisplay from '@/views/bolita-views/composable/DeliveryMethodDisplay.vue';

  const props = defineProps({
    id: {
      required: true,
      type: String,
    },
  });

  const logisticType = $computed(() => {
    return detail?.logisticType;
  });
  const detailInfo = $computed(() => {
    return detail?.logisticDetail;
  });

  let detail: LogisticModel | null = $ref(null);
  watchEffect(async () => {
    await reload();
  });
  const emit = defineEmits(['close', 'refresh']);

  async function reload() {
    if (props.id != null) {
      detail = await getLogisticInfoById(props.id);
    }
  }
</script>

<template>
  <n-card
    size="small"
    style="max-width: 800px"
    @close="emit('close')"
    closable
    title="物流详情"
    v-if="id && detail"
  >
    <n-tabs type="line" animated class="mt-4">
      <n-tab-pane name="信息">
        <n-h4>基础信息</n-h4>
        <n-descriptions bordered :column="2" size="small" label-placement="top">
          <n-descriptions-item label="任务ID">
            {{ id }}
          </n-descriptions-item>
          <n-descriptions-item label="操作仓库">
            {{ detail?.warehouseId }}
          </n-descriptions-item>
          <n-descriptions-item label="箱数">
            {{ detail?.boxCount }}
          </n-descriptions-item>
          <n-descriptions-item label="报价">
            {{ detail?.price ?? '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="物流渠道">
            <delivery-method-display
              :delivery-method="detail?.deliveryMethod"
              :other-delivery-name="detail?.otherDeliveryName"
            />
          </n-descriptions-item>
          <n-descriptions-item label="下单时间">
            {{ dayjs(detail?.orderDate).format('YYYY-MM-DD HH:mm') || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="发货时间">
            {{ dayjs(detail?.pickupDate).format('YYYY-MM-DD HH:mm') || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="状态">
            {{ detail?.status }}
          </n-descriptions-item>
          <n-descriptions-item label="备注">
            {{ detail?.note || '-' }}
          </n-descriptions-item>
        </n-descriptions>
        <template v-if="detailInfo">
          <template v-if="logisticType === LogisticType.AmazonTray">
            <div class="mt-8">
              <n-h4>亚马逊托盘</n-h4>
              <n-descriptions bordered :column="2" label-placement="top">
                <n-descriptions-item label="FBA">
                  {{ detailInfo?.fba }}
                </n-descriptions-item>
                <n-descriptions-item label="po">
                  {{ detailInfo?.po }}
                </n-descriptions-item>
                <n-descriptions-item label="po">
                  {{ detailInfo?.fba }}
                </n-descriptions-item>
                <n-descriptions-item label="托盘数量">
                  {{ detailInfo?.trayCount }}
                </n-descriptions-item>
                <n-descriptions-item label="配送地址">
                  {{ detailInfo?.deliveryAddress }}
                </n-descriptions-item>
                <n-descriptions-item label="总重量">
                  {{ detailInfo?.totalWeight }}
                </n-descriptions-item>
                <n-descriptions-item label="转托">
                  {{ detailInfo?.transferTray }}
                </n-descriptions-item>
                <n-descriptions-item label="亚马逊预约号">
                  {{ detailInfo?.amazonReservationNo }}
                </n-descriptions-item>
              </n-descriptions>
            </div>
          </template>
          <template v-else-if="logisticType === LogisticType.Box">
            <div class="mt-8">
              <n-h4>散货</n-h4>
              <n-descriptions bordered :column="2" label-placement="top">
                <n-descriptions-item label="转托">
                  {{ detailInfo?.transferTray }}
                </n-descriptions-item>
                <n-descriptions-item label="托盘数量">
                  {{ detailInfo?.trayCount }}
                </n-descriptions-item>
                <n-descriptions-item label="po">
                  {{ detailInfo?.fba }}
                </n-descriptions-item>
                <n-descriptions-item label="配送地址">
                  {{ detailInfo?.deliveryAddress }}
                </n-descriptions-item>
              </n-descriptions>
            </div>
          </template>
          <template v-else-if="logisticType === LogisticType.OtherTray">
            <div class="mt-8">
              <n-h4>其他托盘</n-h4>
              <n-descriptions bordered :column="2" label-placement="top">
                <n-descriptions-item label="交换托盘">
                  {{ detailInfo?.transferTray ?? '-' }}
                </n-descriptions-item>
                <n-descriptions-item label="托盘数量">
                  {{ detailInfo?.trayCount }}
                </n-descriptions-item>
                <n-descriptions-item label="送仓号">
                  {{ detailInfo?.deliveryNo }}
                </n-descriptions-item>
                <n-descriptions-item label="配送地址">
                  {{ detailInfo?.deliveryAddress }}
                </n-descriptions-item>
              </n-descriptions>
            </div>
            <div class="mt-8">
              <n-h4>托盘详情</n-h4>
              <tray-info-display :info="detailInfo.trayInfo" />
            </div>
          </template>
        </template>
      </n-tab-pane>
      <n-tab-pane name="附件">
        <append-file-list-display :files-url="detail?.files" />
      </n-tab-pane>
      <n-tab-pane name="操作记录">
        <change-log-time-line :log-ref="id" />
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<style scoped lang="less"></style>
