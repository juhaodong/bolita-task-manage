<template>
  <n-card :bordered="false" class="proCard">
    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      @update:checked-row-keys="onCheckedRow"
      :scroll-x="1090"
    >
      <template #tableTitle>
        <n-button type="primary" @click="addTable">
          <template #icon>
            <n-icon>
              <PlusOutlined />
            </n-icon>
          </template>
          新建其他卡派
        </n-button>
      </template>
    </BasicTable>

    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      preset="card"
      style="max-width: 800px"
      title="新建其他卡派"
    >
      <new-one-for-send-form-index :task-type="TaskType.NormalTray" />
    </n-modal>
    <n-modal v-model:show="showDetailModel">
      <task-detail-page
        @refresh="reloadTable"
        @close="
          showDetailModel = false;
          currentTaskId = '';
        "
        :id="currentTaskId"
      />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns } from './columns';
  import { PlusOutlined } from '@vicons/antd';
  import { changeTaskStatus, getTaskList } from '@/api/task/task-api';
  import { $ref } from 'vue/macros';
  import TaskDetailPage from '@/views/bolita-views/operation/OperationDetail/OperationDetailPage.vue';
  import { PermissionEnums } from '@/api/user/baseUser';
  import { TaskStatus, TaskType } from '@/api/task/task-types';
  import NewOneForSendFormIndex from '@/views/bolita-views/operation/new/NewOperationList.vue';

  const actionRef = ref();

  const showModal = ref(false);

  const formParams = reactive({
    name: '',
    address: '',
    date: null,
  });

  const params = ref({
    pageSize: 5,
    name: 'xiaoMa',
  });
  const actionColumn = reactive({
    width: 240,
    title: '操作',
    key: 'action',
    fixed: 'right',
    render(record) {
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '详情',
            onClick: handleEdit.bind(null, record),
          },

          {
            label: '提交到审核',
            onClick() {
              window['$dialog'].info({
                title: '您确定吗？',
                content: '一旦提交到审核就不能再修改该任务了',
                positiveText: '是的',
                negativeText: '取消',
                async onPositiveClick() {
                  await changeTaskStatus(record.id, TaskStatus.WaitForCheck);
                  reloadTable();
                },
                onNegativeClick() {},
              });
            },
            auth: [PermissionEnums.Customer],
            ifShow: () => {
              return [TaskStatus.NotSubmit, TaskStatus.Refused].includes(record.status);
            },
          },
          {
            label: '审核',
            onClick() {
              window['$dialog'].info({
                title: '资料是否可以通过审核？',
                content:
                  '请点击详情以查看任务详情，如果资料没有问题，请点击通过审核，否则请点击拒绝任务',
                positiveText: '通过审核',
                negativeText: '拒绝任务',
                async onPositiveClick() {
                  await changeTaskStatus(record.id, TaskStatus.NotHandled);
                  reloadTable();
                },
                async onNegativeClick() {
                  await changeTaskStatus(record.id, TaskStatus.Refused);
                  reloadTable();
                },
              });
            },
            auth: [PermissionEnums.Sales, PermissionEnums.Manager, PermissionEnums.Technical],
            ifShow: () => {
              return record.status == TaskStatus.WaitForCheck;
            },
          },
          {
            label: '物流回传',
            onClick() {},
            ifShow: () => {
              return [TaskStatus.Finished].includes(record.status);
            },
          },
        ],
        select: (key) => {
          window['$message'].info(`您点击了，${key} 按钮`);
        },
      });
    },
  });

  function addTable() {
    showModal.value = true;
  }

  const loadDataTable = async () => {
    return await getTaskList(TaskType.AmazonTray);
  };

  function onCheckedRow(rowKeys) {
    console.log(rowKeys);
  }

  function reloadTable() {
    actionRef.value.reload();
  }

  function handleEdit(record: Recordable) {
    showDetailModel = true;
    currentTaskId = record.id;
  }

  let showDetailModel = $ref(false);
  let currentTaskId = $ref('');
</script>

<style lang="less" scoped></style>
