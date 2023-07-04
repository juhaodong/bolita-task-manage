<template>
  <n-card
    title="到货预报详情"
    v-if="notifyId"
    size="small"
    style="width: 90%; min-width: 600px; max-width: 1200px"
    @close="emit('close')"
    closable
  >
    <n-tabs v-model:value="currentTab" type="line" animated class="mt-4">
      <n-tab-pane name="信息">
        <div id="notifyDetail">
          <notify-detail-basic-info @task-update="updateTaskList" :notify-id="notifyId" />
        </div>
      </n-tab-pane>
      <n-tab-pane name="到货详情列表">
        <div style="overflow-x: scroll">
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
        <change-log-time-line :log-ref="notifyId" />
      </n-tab-pane>
    </n-tabs>
    <n-modal v-model:show="showNumberEditModal">
      <n-card style="width: 600px" title="修改到货数量">
        <n-form :rules="rules" :model="formValue" ref="formRef" :label-width="80">
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
    <template v-if="currentTab == '信息'" #action>
      <n-space>
        <n-button v-print="'#notifyDetail'">
          <template #icon>
            <n-icon> <print16-filled /> </n-icon>
          </template>
          打印任务单
        </n-button>
        <n-button :disabled="currentTaskList.length == 0" type="primary" @click="submitEdit">
          <template #icon>
            <n-icon> <save /> </n-icon>
          </template>
          提交修改
        </n-button>
      </n-space>
    </template>
  </n-card>
</template>

<script setup lang="ts">
  import { getNotifyById } from '@/api/notify/notify-api';
  import { computed, Ref, ref, watch, watchEffect } from 'vue';
  import { NButton } from 'naive-ui';
  import { toastSuccess } from '@/utils/utils';
  import { uploadFile } from '@/plugins/firebase';
  import ChangeLogTimeLine from '@/views/bolita-views/composable/ChangeLogTimeLine.vue';
  import { changeArriveCountForNotifyTask } from '@/api/notify/notify-detail';
  import NotifyDetailBasicInfo from '@/views/bolita-views/notify/NotifyDetail/Fragment/NotifyDetailBasicInfo.vue';
  import { getNeededColumnByNotifyType } from '@/views/bolita-views/notify/NotifyRepository/NotifyRepository';
  import { $ref } from 'vue/macros';
  import { Print16Filled } from '@vicons/fluent';
  import { Archive, Save } from '@vicons/ionicons5';
  import { Printd } from 'printd';

  const formValue: Ref<{ note: string; files: any[] }> = ref({
    note: '',
    files: [],
  });

  let currentTab = ref('信息');

  watch(currentTab, () => {
    console.log(currentTab);
  });
  const rules = ref({
    note: {},
    files: {},
  });

  async function submitChange() {
    const files = formValue.value.files;
    for (const key in files) {
      files[key] = await uploadFile(files[key].file);
    }
    for (const task of currentTaskList) {
      await changeArriveCountForNotifyTask(
        props.notifyId,
        task.id,
        task.arrivedCount,
        formValue.value.note,
        files
      );
    }

    await reload();

    showNumberEditModal = false;
    toastSuccess('更新成功');
  }

  let showNumberEditModal = $ref(false);
  function submitEdit() {
    formValue.value = {
      note: '',
      files: [],
    };
    showNumberEditModal = true;
  }

  let currentTaskList: any[] = $ref([]);
  function updateTaskList(newTaskList) {
    currentTaskList = newTaskList;
  }
  const columns = computed(() => {
    return getNeededColumnByNotifyType(notifyDetail?.notifyType);
  });
  interface Props {
    notifyId: string;
  }
  function doPrint() {
    const d = new Printd();
    d.print(document.getElementById('notifyDetail'));
  }
  const props = defineProps<Props>();
  let notifyDetail: any | null = $ref(null);
  const emit = defineEmits(['close', 'refresh']);
  watchEffect(async () => {
    await reload();
  });
  async function reload() {
    if (props.notifyId != null) {
      notifyDetail = await getNotifyById(props.notifyId);
      emit('refresh');
    }
  }
</script>

<style scoped></style>
