<script setup lang="ts">
  import { BasicTable, TableAction } from '@/components/Table';
  import { computed, h, reactive, ref, watchEffect } from 'vue';
  import {
    ArriveMediaTypes,
    getNeededColumnsByArriveMedia,
    getNotifyById,
    NotifyStatus,
  } from '@/api/notify/notify-api';
  import { NButton } from 'naive-ui';
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { handleRequest, toastSuccess } from '@/utils/utils';
  import {
    addNotifyDetail,
    deleteDetailForNotify,
    getTasksForNotify,
    NotifyDetailModel,
  } from '@/api/notify/notify-detail';
  import { Archive } from '@vicons/ionicons5';
  import dayjs from 'dayjs';
  import xlsx from 'json-as-xlsx';
  import readXlsxFile from 'read-excel-file';
  import { $ref } from 'vue/macros';

  let notifyDetail: any | null = $ref(null);
  const columns = computed(() => {
    const list = getNeededColumnsByArriveMedia(arriveMedia);
    return [
      {
        title: '到货状态',
        key: 'arrived',
        render(row) {
          return h('div', [
            h(
              NButton,
              {
                type: (row.arrivedCount ?? 0) >= row.count ? 'success' : 'default',
                disabled: notifyDetail?.status !== NotifyStatus.WaitFroArrive,
                onClick() {},
              },
              (row.arrivedCount ?? 0) + '/' + row.count
            ),
          ]);
        },
      },
      ...list,
    ];
  });

  const addFormField = computed(() => {
    return getNeededColumnsByArriveMedia(arriveMedia).map((it) => ({
      label: it.title,
      field: it.key,
    }));
  });

  const totalRecordCount = computed(() => {
    return notifyDetail?.taskList?.reduce((sum, i) => sum + parseInt(i.count), 0) ?? 0;
  });
  const arriveMedia: ArriveMediaTypes | null = $computed(() => {
    return notifyDetail?.arriveMedia;
  });
  watchEffect(async () => {
    await reload();
  });
  async function reload() {
    if (props.notifyId != null) {
      notifyDetail = await getNotifyById(props.notifyId);
    }
  }
  interface Props {
    notifyId: string;
    editable: boolean;
  }
  const props = defineProps<Props>();
  const actionColumn = props.editable
    ? reactive({
        width: 100,
        title: '操作',
        key: 'action',
        fixed: 'right',
        render(record) {
          return h(TableAction as any, {
            style: 'button',
            actions: [
              {
                label: '删除',
                popConfirm: {
                  title: '您是否确定删除此条记录?',
                  async confirm() {
                    const res = await deleteDetailForNotify(record.id, props.notifyId);
                    await handleRequest(res, () => {
                      tableReload();
                      reload();
                      toastSuccess('删除成功');
                    });
                  },
                },
              },
            ],
            select: (key) => {
              window['$message'].info(`您点击了，${key} 按钮`);
            },
          });
        },
      })
    : null;
  let showAdd = $ref(false);
  const loadDataTable = async () => {
    return await getTasksForNotify(props.notifyId);
  };
  const actionRef: null | any = ref(null);

  function tableReload() {
    actionRef.value?.reload();
  }

  const canGoNext = computed(() => {
    return (
      totalRecordCount.value == notifyDetail?.totalCount &&
      notifyDetail?.taskList.length == notifyDetail?.sortingLabelCount
    );
  });
  async function addNewDetailNotify(detailInfo) {
    const res = await addNotifyDetail(detailInfo, props.notifyId);
    await handleRequest(res, () => {
      toastSuccess('添加成功');
      showAdd = false;
      tableReload();
      reload();
    });
  }

  const emit = defineEmits(['next']);

  let showMassImport = $ref(false);

  function startMassImport() {
    showMassImport = true;
    detailedTasks = [];
    step = 0;
  }
  function generateNotifyTaskModel(count) {
    const res: NotifyDetailModel[] = [];

    for (let i = 1; i <= count; i++) {
      res.push({
        arrivedCount: 0,
        actualWeight: '',
        count: 0,
        height: '',
        length: '',
        sku: '',
        sortCode: '分拣码:' + i,
        trackingCode: '',
        trayCode: '',
        trayHeight: '',
        trayLength: '',
        trayWidth: '',
        volume: '',
        width: '',
      });
    }
    return res;
  }
  let uploadFailed = $ref(false);
  let failReason = $ref('');
  let detailedTasks: any[] = $ref([]);
  async function readFile(file) {
    const schema = {
      分拣码: { prop: 'sortCode', type: String },
      物流追踪号: { prop: 'trackingCode', type: String },
      '托盘号（选填）': { prop: 'trayCode', type: String },
      托盘长度: { prop: 'trayLength', type: String },
      托盘宽度: { prop: 'trayWidth', type: String },
      托盘高度: { prop: 'trayHeight', type: String },
      件数: { prop: 'count', type: String },
      实重: { prop: 'actualWeight', type: String },
      体积: { prop: 'volume', type: String },
      长: { prop: 'length', type: String },
      宽: { prop: 'width', type: String },
      高: { prop: 'height', type: String },
      SKU: { prop: 'sku', type: String },
      操作类型: { prop: 'operationType', type: String },
      地址类型: { prop: 'addressType', type: String, oneOf: ['Amz', 'B2B', 'B2C'] },
      目的地: { prop: 'targetCountry', type: String },
      邮编: { prop: 'postCode', type: String },
      'FBA Code': { prop: 'fbaCode', type: String },
      FBA: { prop: 'fba', type: String },
      PO: { prop: 'po', type: String },
      地址: { prop: 'address', type: String },
      物流渠道: {
        prop: 'deliveryMethod',
        type: String,
      },
    };
    try {
      const { rows, errors } = await readXlsxFile(file, { schema });
      console.log(rows, errors);
      if (rows.length > 0 && errors.length == 0) {
        uploadFailed = false;
        detailedTasks = rows.map((it) => ({ ...it, arrivedCount: 0 }));
      } else if (errors.length > 0) {
        uploadFailed = true;
        failReason = errors.reduce(
          (sum, i) => `${sum}第${i.row}行数据异常，原因为：${i.reason}\n`,
          ''
        );
      } else {
        uploadFailed = true;
        failReason = '没有读取到有效的数据';
      }
    } catch (e: any) {
      uploadFailed = true;
      failReason = '文件上传异常' + e?.message;
    } finally {
    }
  }
  function fileChanged(fileList) {
    readFile(fileList[0].file);
  }
  let step = $ref(0);
  function downloadTemplate() {
    const content = generateNotifyTaskModel(notifyDetail?.sortingLabelCount ?? 5);
    const list = getNeededColumnsByArriveMedia(arriveMedia).map((it) => ({
      label: it.title,
      value: it.key,
    }));
    const data = [
      {
        sheet: 'sheet 1',
        columns: [...list],
        content: content,
      },
    ];
    const setting = {
      fileName: '到货预报模板' + dayjs().toString(),
      extraLength: 8,
    };
    xlsx(data, setting);
  }
  const canUpload = computed(() => {
    return (
      notifyDetail?.sortingLabelCount == notifyDetail?.taskList.length &&
      notifyDetail?.totalCount == totalRecordCount.value
    );
  });
</script>

<template>
  <n-space vertical>
    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      :scroll-x="1090"
    >
      <template #tableTitle v-if="editable">
        <n-space>
          <n-button @click="showAdd = true" type="primary"> 添加预报详情 </n-button>
          <n-button @click="startMassImport"> 批量导入 </n-button>
        </n-space>
      </template>
      <template #toolbar> </template>
    </BasicTable>
    <n-space v-if="editable">
      <n-tag
        size="large"
        :type="totalRecordCount == notifyDetail?.totalCount ? 'success' : 'warning'"
      >
        总件数: {{ totalRecordCount }}/{{ notifyDetail?.totalCount }}
      </n-tag>
      <n-tag
        size="large"
        :type="
          notifyDetail?.taskList.length == notifyDetail?.sortingLabelCount ? 'success' : 'warning'
        "
      >
        分拣码数量: {{ notifyDetail?.taskList.length }}/{{ notifyDetail?.sortingLabelCount }}
      </n-tag>
      <n-button v-if="editable" @click="emit('next')" :disabled="!canGoNext" type="success">
        下一步
      </n-button>
    </n-space>
  </n-space>

  <n-modal preset="dialog" title="添加预报详情" v-model:show="showAdd">
    <n-card>
      <normal-form :form-fields="addFormField" @submit="addNewDetailNotify" />
    </n-card>
  </n-modal>
  <n-modal preset="dialog" title="批量导入预报" v-model:show="showMassImport">
    <n-card>
      <template v-if="step === 0">
        <div class="flex items-center mt-4">
          <div> 上传任务详情</div>
          <div class="flex-grow"></div>
          <n-button type="info" text @click="downloadTemplate">下载模板 </n-button>
        </div>
        <n-upload :default-upload="false" class="mt-8" @update-file-list="fileChanged">
          <n-upload-dragger>
            <div style="margin-bottom: 12px">
              <n-icon size="48" :depth="3">
                <archive />
              </n-icon>
            </div>
            <n-text style="font-size: 16px"> 点击或者拖动文件到该区域来上传</n-text>
            <n-p depth="3" style="margin: 8px 0 0 0"> 请仔细检查您提交的文件 </n-p>
          </n-upload-dragger>
        </n-upload></template
      >
      <template v-else>
        <template>
          <template v-if="uploadFailed">
            <div class="p-4 flex flex-col justify-center items-center">
              <n-h4>上传失败</n-h4>
              <n-text code>{{ failReason }}</n-text>
              <n-button @click="step = 0" class="mt-2">重新上传 </n-button>
            </div>
          </template>
          <template v-else>
            <div class="flex items-center mt-4">
              <div>您上传的任务</div>
              <div class="flex-grow"></div>
            </div>
            <n-descriptions class="mt-4" column="2">
              <n-descriptions-item label="应有总数">
                {{ notifyDetail?.totalCount }}</n-descriptions-item
              >
              <n-descriptions-item label="实际总数">
                <n-text :type="notifyDetail?.totalCount != totalRecordCount ? 'error' : 'default'"
                  >{{ totalRecordCount }}
                </n-text>
              </n-descriptions-item>
              <n-descriptions-item label="应有分拣码数量">
                {{ notifyDetail?.sortingLabelCount }}
              </n-descriptions-item>
              <n-descriptions-item label="实际分拣码数量">
                <n-text
                  :type="
                    notifyDetail?.taskList.length != notifyDetail?.sortingLabelCount
                      ? 'error'
                      : 'default'
                  "
                >
                  {{ notifyDetail?.taskList.length }}
                </n-text>
              </n-descriptions-item>
            </n-descriptions>
            <div class="mt-8">
              <n-space>
                <n-button @click="step = 2" type="warning">重新上传 </n-button>
                <n-button :disabled="!canUpload" @click="showMassImport" type="primary"
                  >批量上传
                </n-button>
              </n-space>
            </div>
          </template>
        </template>
      </template>
    </n-card>
  </n-modal>
</template>

<style scoped lang="less"></style>
