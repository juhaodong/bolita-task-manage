<script setup lang="ts">
  import { $ref } from 'vue/macros';
  import { ref, watchEffect } from 'vue';
  import ChangeLogTimeLine from '@/views/bolita-views/composable/ChangeLogTimeLine.vue';
  import { Archive } from '@vicons/ionicons5';
  import AppendFileListDisplay from '@/views/bolita-views/composable/AppendFileListDisplay.vue';
  import { CheckCircleFilled } from '@vicons/antd';
  import dayjs from 'dayjs';
  import { LogisticModel } from '@/api/deliveryMethod/logistic-type';
  import { getLogisticInfoById } from '@/api/deliveryMethod/logistic-api';

  const props = defineProps({
    id: {
      required: true,
      type: String,
    },
  });
  const files = ref([]);
  let note = $ref('');

  let detail: LogisticModel | null = $ref(null);
  watchEffect(async () => {
    await reload();
  });
  const emit = defineEmits(['close', 'refresh']);

  async function reload() {
    if (props.id != null) {
      files.value = [];
      note = '';
      detail = await getLogisticInfoById(props.id);
      console.log(detail);
    }
  }

  let loading = $ref(false);
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
          <n-descriptions-item label="物流渠道">
            {{ detail?.deliveryMethod }}%
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
      </n-tab-pane>
      <n-tab-pane name="附件">
        <append-file-list-display :files-url="detail?.files" />
      </n-tab-pane>
      <n-tab-pane name="任务反馈">
        <n-form>
          <n-grid :cols="3" x-gap="24">
            <n-gi :span="canEditFeedBack ? 2 : 3">
              <n-grid :cols="12" x-gap="24">
                <n-gi span="12" class="mb-2">
                  <n-text strong>操作完成情况</n-text>
                </n-gi>
                <n-form-item-gi
                  :span="6"
                  :label="m.operationType"
                  v-for="m in requiredORs"
                  :key="m.operationType"
                >
                  <n-input-number
                    v-if="m.operationInputType !== 'select'"
                    :status="m.completeAmount >= m.requireAmount ? 'success' : 'warning'"
                    :disabled="!canEditFeedBack"
                    style="width: 100%"
                    :show-button="false"
                    v-model:value="m.completeAmount"
                  >
                    <template #prefix v-if="m.completeAmount >= m.requireAmount">
                      <n-icon color="green"><check-circle-filled /></n-icon>
                    </template>
                    <template #suffix> / 共 {{ m.requireAmount }}</template>
                  </n-input-number>
                  <n-input disabled v-model:value="m.value" v-else />
                </n-form-item-gi>
                <n-gi span="12" class="mb-2">
                  <n-text strong>操作中产生的额外费用</n-text>
                </n-gi>
                <n-form-item-gi
                  :span="6"
                  :label="m.operationType"
                  v-for="m in appendORs"
                  :key="m.operationType"
                >
                  <n-input-number
                    :disabled="!canEditFeedBack"
                    style="width: 100%"
                    :show-button="false"
                    v-model:value="m.completeAmount"
                  >
                    <template #suffix> / 共 {{ m.requireAmount }}</template>
                  </n-input-number>
                </n-form-item-gi>
              </n-grid>
            </n-gi>
            <n-gi v-if="canEditFeedBack">
              <div class="mb-2">
                <n-text strong>反馈</n-text>
              </div>
              <n-form-item label="备注">
                <n-input v-model:value="note" />
              </n-form-item>
              <n-form-item label="本次反馈附件">
                <n-upload multiple v-model:file-list="files" :default-upload="false">
                  <n-upload-dragger>
                    <div style="margin-bottom: 12px">
                      <n-icon size="48" :depth="3">
                        <archive />
                      </n-icon>
                    </div>
                    <n-text style="font-size: 16px"> 点击或者拖动文件到该区域来上传</n-text>
                    <n-p depth="3" style="margin: 8px 0 0 0"> 请仔细检查您提交的文件</n-p>
                  </n-upload-dragger>
                </n-upload>
              </n-form-item>
              <n-space vertical>
                <n-button style="width: 100%" @click="fillItAll"> 自动补齐 </n-button>
                <n-button
                  :loading="loading"
                  type="primary"
                  style="width: 100%"
                  @click="submitFeedBack"
                >
                  提交反馈
                </n-button>
              </n-space>
            </n-gi>
          </n-grid>
        </n-form>
      </n-tab-pane>
      <n-tab-pane name="操作记录">
        <change-log-time-line :log-ref="id" />
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<style scoped lang="less"></style>
