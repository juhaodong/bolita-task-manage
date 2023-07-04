<script setup lang="ts">
  import { BasicTable, TableAction } from '@/components/Table';
  import { computed, h, reactive, ref } from 'vue';
  import { NotifyType } from '@/api/notify/notify-api';
  import { NButton } from 'naive-ui';
  import NormalForm from '@/views/bolita-views/composable/NormalForm.vue';
  import { toastSuccess } from '@/utils/utils';
  import { Archive } from '@vicons/ionicons5';
  import dayjs from 'dayjs';
  import xlsx from 'json-as-xlsx';
  import readXlsxFile from 'read-excel-file';
  import { $ref } from 'vue/macros';
  import {
    getNeededColumnByNotifyType,
    getNeededFieldByNotifyType,
  } from '@/views/bolita-views/notify/NotifyRepository/NotifyRepository';

  const columns = computed(() => {
    const list = getNeededColumnByNotifyType(props.notifyType);
    return [...list];
  });
  const notifyStore = reactive<any[]>([]);

  const addFormField = computed(() => {
    return getNeededFieldByNotifyType(props.notifyType);
  });

  interface Props {
    editable?: boolean;
    notifyType: NotifyType;
  }
  const props = defineProps<Props>();
  const actionColumn = props.editable
    ? reactive({
        width: 120,
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
                    notifyStore.filter((it) => it.tempId != record.tempId);
                  },
                },
              },
              {
                label: '编辑',
                onClick() {
                  addNotify(record);
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
    return notifyStore;
  };
  const actionRef: null | any = ref(null);

  function tableReload() {
    actionRef.value?.reload();
    emit('tasks-update', notifyStore);
  }
  let taskModel: any = $ref(null);
  function addNotify(record = null) {
    taskModel = record;
    showAdd = true;
  }

  let tempId = 1;
  async function saveNotify(detailInfo) {
    console.log(detailInfo.tempId);
    if (!taskModel?.tempId) {
      detailInfo.tempId = tempId++;
      notifyStore.push(detailInfo);
    } else {
      const index = notifyStore.findIndex((it) => it.tempId == taskModel.tempId);
      detailInfo.tempId = taskModel.tempId;
      notifyStore[index] = detailInfo;
    }
    toastSuccess('添加成功');
    showAdd = false;
    tableReload();
  }

  const emit = defineEmits(['tasks-update']);

  let showMassImport = $ref(false);

  function startMassImport() {
    showMassImport = true;
    detailedTasks = [];
    step = 0;
  }

  function submitMassImport() {
    notifyStore.push(...detailedTasks);
    detailedTasks = [];
    showMassImport = false;
  }
  function generateNotifyTaskModel(count) {
    const res: any[] = [];

    for (let i = 1; i <= count; i++) {
      res.push({
        count: 0,
        sortCode: '分拣码:' + i,
      });
    }
    return res;
  }
  let uploadFailed = $ref(false);
  let failReason = $ref('');
  let detailedTasks: any[] = $ref([]);
  async function readFile(file) {
    const schema = Object.fromEntries(
      getNeededColumnByNotifyType(props.notifyType).map((it) => {
        return [it.title, { prop: it.key, type: String }];
      })
    );
    console.log(schema);
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
      step = 1;
    }
  }
  function fileChanged(fileList) {
    readFile(fileList[0].file);
  }
  let step = $ref(0);
  function downloadTemplate() {
    const content = generateNotifyTaskModel(5);
    const list = getNeededColumnByNotifyType(props.notifyType).map((it) => ({
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
</script>

<template>
  <n-space vertical>
    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      ref="actionRef"
      scroll-x="2500px"
      :actionColumn="actionColumn"
    >
      <template #tableTitle v-if="editable">
        <n-space>
          <n-button @click="addNotify()" type="primary"> 添加预报详情 </n-button>
          <n-button @click="startMassImport"> 批量导入 </n-button>
        </n-space>
      </template>
      <template #toolbar> </template>
    </BasicTable>
  </n-space>

  <n-modal preset="card" style="max-width: 700px" title="添加预报详情" v-model:show="showAdd">
    <n-card>
      <normal-form
        :form-fields="addFormField"
        @submit="saveNotify"
        :default-value-model="taskModel"
      />
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
            <n-descriptions-item label="总数">
              {{ detailedTasks?.length }}
            </n-descriptions-item>
          </n-descriptions>
          <div class="mt-8">
            <n-space>
              <n-button @click="step = 0" type="warning">重新上传 </n-button>
              <n-button @click="submitMassImport" type="primary">保存 </n-button>
            </n-space>
          </div>
        </template>
      </template>
    </n-card>
  </n-modal>
</template>

<style scoped lang="less"></style>
