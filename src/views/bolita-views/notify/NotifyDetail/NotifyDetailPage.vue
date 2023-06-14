<template>
  <n-card
    title="到货预报详情"
    v-if="notifyId"
    size="small"
    style="max-width: 800px"
    @close="emit('close')"
    closable
  >
    <n-tabs type="line" animated class="mt-4">
      <n-tab-pane name="信息">
        <n-h4>基础信息</n-h4>
        <n-descriptions bordered :column="2" size="small" label-placement="top">
          <n-descriptions-item label="预报ID">
            {{ notifyId }}
          </n-descriptions-item>
          <n-descriptions-item label="到货仓库ID">
            {{ notifyDetail?.arriveWarehouseId }}
          </n-descriptions-item>
          <n-descriptions-item label="到货类型">
            {{ notifyDetail?.arriveMedia }}
          </n-descriptions-item>

          <n-descriptions-item label="已到货/总箱数">
            {{ notifyDetail?.arrivedCount }}/{{ notifyDetail?.totalCount }}
          </n-descriptions-item>
          <n-descriptions-item label="预计到仓时间">
            {{ dayjs(notifyDetail?.planArriveDateTime).format('YYYY-MM-DD HH:mm') }}
          </n-descriptions-item>
          <n-descriptions-item label="状态">
            {{ notifyDetail?.status }}
          </n-descriptions-item>
          <n-descriptions-item label="备注">
            {{ notifyDetail?.note || '-' }}
          </n-descriptions-item>
        </n-descriptions>
        <template v-if="notifyDetail?.arriveMedia === ArriveMediaTypes.Container">
          <div class="mt-8">
            <n-h4>货柜信息</n-h4>
            <n-descriptions bordered :column="2" label-placement="top">
              <n-descriptions-item label="货柜号码">
                {{ arriveDetail?.containerNo }}
              </n-descriptions-item>
              <n-descriptions-item label="车牌号">
                {{ arriveDetail?.carNo }}
              </n-descriptions-item>
              <n-descriptions-item label="货柜尺寸">
                {{ arriveDetail?.containerSize }}
              </n-descriptions-item>
              <n-descriptions-item label="货柜类型">
                {{ arriveDetail?.containerType }}
              </n-descriptions-item>
            </n-descriptions>
          </div>
        </template>
        <template v-if="notifyDetail?.arriveMedia === ArriveMediaTypes.Tray">
          <div class="mt-8">
            <n-h4>托盘信息</n-h4>
            <n-descriptions bordered :column="2" label-placement="top">
              <n-descriptions-item label="托盘尺寸">
                {{ arriveDetail?.traySize }}
              </n-descriptions-item>
              <n-descriptions-item label="托盘类型">
                {{ arriveDetail?.trayType }}
              </n-descriptions-item>
              <n-descriptions-item label="托盘数量">
                {{ arriveDetail?.trayCount }}
              </n-descriptions-item>
              <n-descriptions-item label="车牌号">
                {{ arriveDetail?.carNo }}
              </n-descriptions-item>
              <n-descriptions-item label="货品类型">
                {{ arriveDetail?.goodsType }}
              </n-descriptions-item>
            </n-descriptions>
          </div>
        </template>
        <template v-if="notifyDetail?.arriveMedia === ArriveMediaTypes.Box">
          <div class="mt-8">
            <n-h4>散货信息</n-h4>
            <n-descriptions bordered :column="2" label-placement="top">
              <n-descriptions-item label="物流渠道">
                {{ arriveDetail?.deliveryMethod }}
              </n-descriptions-item>
            </n-descriptions>
          </div>
        </template>
      </n-tab-pane>
      <n-tab-pane name="到货货品列表">
        <div class="bg-green-100" style="overflow-x: scroll">
          <div style="width: fit-content">
            <n-data-table
              :row-class-name="(row) => (row.arrivedCount == row.count ? 'bg-green-100' : '')"
              scroll-x="max-content"
              :columns="columns"
              :data="notifyDetail.taskList"
            />
          </div>
        </div>
      </n-tab-pane>
      <n-tab-pane name="操作记录">
        <n-h4>变动时间线</n-h4>

        <n-timeline>
          <n-timeline-item
            :key="log.id"
            v-for="log in changeLog"
            :type="log.type"
            :title="log.title"
            :content="log.content"
            :time="log.time"
          >
            <template #header>
              <div class="flex items-center">
                <n-text strong>
                  {{ log.title }}
                </n-text>
                <div class="flex-grow"></div>
                <div>
                  <n-text depth="2">
                    {{ log.content }}
                  </n-text>
                </div>
              </div>
            </template>
            <div class="mt-4">{{ log.note || '暂无留言' }} </div>
            <div class="px-2 py-2 mt-4" v-if="log.files.length > 0">
              <n-image-group>
                <n-space>
                  <n-image v-for="f in log.files" width="72" :src="f" />
                </n-space>
              </n-image-group>
            </div>
          </n-timeline-item>
        </n-timeline>
      </n-tab-pane>
    </n-tabs>
    <n-modal v-model:show="showNumberEditModal">
      <n-card style="width: 600px" title="修改到货数量">
        <n-form :rules="rules" :model="formValue" ref="formRef" :label-width="80">
          <n-form-item label="实际到货数量" path="arriveCount">
            <n-input-number
              v-model:value="formValue.arriveCount"
              :max="233"
              placeholder="输入实际到货数量"
            />
          </n-form-item>
          <n-form-item label="备注" path="note">
            <n-input v-model:value="formValue.note" placeholder="输入备注" />
          </n-form-item>
          <n-form-item label="附件" path="files">
            <n-upload
              multiple
              accept="image/*"
              v-model:file-list="formValue.files"
              :default-upload="false"
            >
              <n-upload-dragger>
                <div style="margin-bottom: 12px">
                  <n-icon size="48" :depth="3">
                    <archive />
                  </n-icon>
                </div>
                <n-text style="font-size: 16px"> 点击或者拖动文件到该区域来上传</n-text>
                <n-p depth="3" style="margin: 8px 0 0 0"> 请仔细检查您提交的文件 </n-p>
              </n-upload-dragger>
            </n-upload>
          </n-form-item>
          <n-form-item>
            <n-button @click="submitChange" type="primary" attr-type="button">确认</n-button>
          </n-form-item>
        </n-form>
      </n-card>
    </n-modal>
  </n-card>
</template>

<script setup lang="ts">
  import {
    ArriveMediaTypes,
    changeArriveCountForNotifyTask,
    getNotifyById,
  } from '@/api/notify/list';
  import { computed, h, Ref, ref, watchEffect } from 'vue';
  import dayjs from 'dayjs';
  import { NButton } from 'naive-ui';
  import { Archive } from '@vicons/ionicons5';
  import { handleRequest, toastSuccess } from '@/utils/utils';
  import { uploadImage } from '@/plugins/firebase';

  const formValue: Ref<{ arriveCount: number; note: string; files: any[] }> = ref({
    arriveCount: 0,
    note: '',
    files: [],
  });

  const rules = ref({
    arriveCount: {
      required: true,
      message: '请输入将要修改的数量',
      trigger: ['input', 'blur'],
      type: 'number',
    },
    note: {},
    files: {},
  });

  async function submitChange() {
    const files = formValue.value.files;
    console.log(files, 'files');
    for (const key in files) {
      files[key] = await uploadImage(files[key].file);
    }
    const res = await changeArriveCountForNotifyTask(
      props.notifyId,
      editingTaskId,
      formValue.value.arriveCount,
      formValue.value.note,
      files
    );
    await handleRequest(res, () => {
      reload();
      editingTaskId = '';
      showNumberEditModal = false;

      toastSuccess('更新成功');
    });
  }

  let showNumberEditModal = $ref(false);
  let editingTaskId = $ref('');
  const columns = computed(() => {
    const boxField =
      arriveMedia == ArriveMediaTypes.Box ? [{ title: '物流追踪号', key: 'trackingCode' }] : [];
    const trayField =
      arriveMedia == ArriveMediaTypes.Tray
        ? [
            { title: '托盘号（选填）', key: 'trayCode' },
            { title: '托盘长度', key: 'trayLength' },
            { title: '托盘宽度', key: 'trayWidth' },
            { title: '托盘高度', key: 'trayHeight' },
          ]
        : [];
    return [
      {
        title: '到货状态',
        key: 'arrived',
        render(row) {
          return h('div', [
            h(
              NButton,
              {
                onClick() {
                  console.log(row);
                  showNumberEditModal = true;
                  editingTaskId = row.id;
                },
              },
              (row.arrivedCount ?? 0) + '/' + row.count
            ),
          ]);
        },
      },
      { title: '分拣码', key: 'sortCode' },
      ...boxField,
      ...trayField,
      { title: '实重', key: 'actualWeight' },
      { title: '体积', key: 'volume' },
      { title: '长', key: 'length' },
      { title: '宽', key: 'width' },
      { title: '高', key: 'height' },
      { title: 'SKU', key: 'sku' },
      { title: '操作类型', key: 'operationType' },
      { title: '地址类型', key: 'addressType' },
      { title: '目的地', key: 'targetCountry' },
      { title: '邮编', key: 'postCode' },
      { title: 'FBA Code', key: 'fbaCode' },
      { title: 'FBA', key: 'fba' },
      { title: 'PO', key: 'po' },
      { title: '物流渠道', key: 'deliveryMethod' },
      { title: '地址', key: 'address' },
    ];
  });

  const arriveMedia: ArriveMediaTypes | null = $computed(() => {
    return notifyDetail?.arriveMedia;
  });
  const props = defineProps({ notifyId: String || null });
  let notifyDetail: any | null = $ref(null);
  const emit = defineEmits(['close']);
  watchEffect(async () => {
    await reload();
  });
  async function reload() {
    if (props.notifyId != null) {
      notifyDetail = await getNotifyById(props.notifyId);
      console.log(notifyDetail);
    }
  }
  const changeLog = $computed(() => {
    return notifyDetail?.changeLogs.map((it) => ({
      id: it.id,
      time: dayjs(it.timestamp).format('YYYY-MM-DD HH:mm:ss'),
      type: 'info',
      title: '操作人:' + it.userId,
      content: it.fromStatus + ' -> ' + it.toStatus,
      note: it.note,
      files: it.files,
    }));
  });
  const arriveDetail = $computed(() => {
    return notifyDetail?.arriveDetail;
  });
</script>

<style scoped></style>
