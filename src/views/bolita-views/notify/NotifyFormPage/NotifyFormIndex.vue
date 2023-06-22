<script setup lang="ts">
  import NewNotifyForm from '@/views/bolita-views/notify/NotifyFormPage/NewNotifyForm.vue';
  import { $ref } from 'vue/macros';
  import xlsx from 'json-as-xlsx';
  import BoxForm from '@/views/bolita-views/notify/NotifyFormPage/BoxForm.vue';
  import TrayForm from '@/views/bolita-views/notify/NotifyFormPage/TrayForm.vue';
  import NotifyContainerForm from '@/views/bolita-views/notify/NotifyFormPage/NotifyContainerForm.vue';
  import { ArriveMediaTypes, NotifyTaskModel } from '@/api/notify/notify-api';
  import { Archive } from '@vicons/ionicons5';
  import dayjs from 'dayjs';
  import readXlsxFile from 'read-excel-file';
  import { computed } from 'vue';
  import { uniqBy } from 'lodash-es';

  let currentStep = $ref(0);
  let arriveMedia: ArriveMediaTypes = $ref(ArriveMediaTypes.Container);

  let basicInfo: any = $ref(null);

  const emit = defineEmits(['submit']);

  function firstFormResult(result) {
    basicInfo = result;
    arriveMedia = result.arriveMedia;
    currentStep++;
  }

  function fileChanged(fileList) {
    console.log(fileList);
    readFile(fileList[0].file);
  }

  function generateNotifyTaskModel(count) {
    const res: NotifyTaskModel[] = [];

    for (let i = 1; i <= count; i++) {
      res.push({
        arrivedCount: 0,
        actualWeight: '',
        address: '',
        addressType: '',
        count: 0,
        fba: '',
        fbaCode: '',
        height: '',
        length: '',
        operationType: '',
        po: '',
        postCode: '',
        sku: '',
        sortCode: '分拣码:' + i,
        targetCountry: '',
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
      currentStep++;
    }
  }

  function downloadTemplate() {
    const content = generateNotifyTaskModel(requiredDifferentSortCode);
    const data = [
      {
        sheet: 'sheet 1',
        columns: [
          { label: '分拣码', value: 'sortCode' },
          { label: '物流追踪号', value: 'trackingCode' },
          { label: '托盘号（选填）', value: 'trayCode' },
          { label: '托盘长度', value: 'trayLength' },
          { label: '托盘宽度', value: 'trayWidth' },
          { label: '托盘高度', value: 'trayHeight' },
          { label: '件数', value: 'count' },
          { label: '实重', value: 'actualWeight' },
          { label: '体积', value: 'volume' },
          { label: '长', value: 'length' },
          { label: '宽', value: 'width' },
          { label: '高', value: 'height' },
          { label: 'SKU', value: 'sku' },
          { label: '操作类型', value: 'operationType' },
          { label: '地址类型', value: 'addressType' },
          { label: '目的地', value: 'targetCountry' },
          { label: '邮编', value: 'postCode' },
          { label: 'FBA Code', value: 'fbaCode' },
          { label: 'FBA', value: 'fba' },
          { label: 'PO', value: 'po' },
          { label: '物流渠道', value: 'deliveryMethod' },
          { label: '地址', value: 'address' },
        ],
        content: content,
      },
    ];
    const setting = {
      fileName: '到货预报模板' + dayjs().toString(),
      extraLength: 8,
    };
    xlsx(data, setting);
  }

  let detailInfo: any = $ref(null);
  const differentSortCode = computed(() => {
    return uniqBy(detailedTasks, 'sortCode').length;
  });
  const requiredDifferentSortCode = $computed(() => {
    return detailInfo?.sortingLabelCount ?? 0;
  });
  const requiredTotalCount = computed(() => {
    return basicInfo.totalCount;
  });
  const totalCount = computed(() => {
    return detailedTasks.reduce((sum, i) => sum + parseInt(i.count), 0);
  });
  const canUpload = computed(() => {
    return (
      requiredDifferentSortCode.value == differentSortCode.value &&
      requiredTotalCount.value == totalCount.value
    );
  });

  function secondFormResult(result) {
    console.log(result);
    console.log(basicInfo);
    detailInfo = result;
    currentStep++;
  }

  function complete() {
    if (basicInfo != null) {
      emit('submit', {
        ...basicInfo,
        arriveDetail: detailInfo,
        taskList: detailedTasks,
      });
    }
  }
</script>

<template>
  <div>
    <new-notify-form v-if="currentStep == 0" @submit="firstFormResult" />
    <template v-if="currentStep === 1">
      <box-form @submit="secondFormResult" v-if="arriveMedia == ArriveMediaTypes.Box" />
      <tray-form v-else-if="arriveMedia == ArriveMediaTypes.Tray" @submit="secondFormResult" />
      <notify-container-form v-else @submit="secondFormResult" />
    </template>
    <template v-else-if="currentStep === 2">
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
      </n-upload>
    </template>
    <template v-else-if="currentStep === 3">
      <template v-if="uploadFailed">
        <div class="p-4 flex flex-col justify-center items-center">
          <n-h4>上传失败</n-h4>
          <n-text code>{{ failReason }}</n-text>
          <n-button @click="currentStep = 2" class="mt-2">重新上传 </n-button>
        </div>
      </template>
      <template v-else>
        <div class="flex items-center mt-4">
          <div>您上传的任务</div>
          <div class="flex-grow"></div>
        </div>
        <n-descriptions class="mt-4" column="2">
          <n-descriptions-item label="应有总数"> {{ requiredTotalCount }}</n-descriptions-item>
          <n-descriptions-item label="实际总数">
            <n-text :type="totalCount != requiredTotalCount ? 'error' : 'default'"
              >{{ totalCount }}
            </n-text>
          </n-descriptions-item>
          <n-descriptions-item label="应有分拣码数量">
            {{ requiredDifferentSortCode }}
          </n-descriptions-item>
          <n-descriptions-item label="实际分拣码数量">
            <n-text :type="requiredDifferentSortCode != differentSortCode ? 'error' : 'default'">
              {{ differentSortCode }}
            </n-text>
          </n-descriptions-item>
        </n-descriptions>
        <div class="mt-8">
          <n-space>
            <n-button @click="currentStep = 2" type="warning">重新上传 </n-button>
            <n-button :disabled="!canUpload" @click="complete" type="primary">新建任务 </n-button>
          </n-space>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped lang="less"></style>
