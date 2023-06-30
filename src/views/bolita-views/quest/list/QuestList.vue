<template>
  <n-card :bordered="false" class="proCard">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset">
      <template #statusSlot="{ model, field }">
        <n-input v-model:value="model[field]" />
      </template>
    </BasicForm>
    <div class="my-2"></div>
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
        <n-space>
          <n-button type="primary" @click="addNotify">
            <template #icon>
              <n-icon>
                <Bell />
              </n-icon>
            </template>
            新建预报
          </n-button>
          <n-button @click="addTask">
            <template #icon>
              <n-icon>
                <PlusOutlined />
              </n-icon>
            </template>
            新建任务
          </n-button>
        </n-space>
      </template>
    </BasicTable>

    <n-modal :mask-closable="false" v-model:show="showModal" :show-icon="false">
      <new-quest-form-index
        :operation-mode="operationMode"
        @submit="submit"
        :quest-id="currentTaskId"
        @close="close"
      />
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
  import { BasicForm, FormSchema, useForm } from '@/components/Form';
  import { columns } from './columns';
  import { PlusOutlined } from '@vicons/antd';
  import { salesNameList } from '@/api/sales';
  import { deliveryMethods } from '@/api/deliveryMethod';
  import { warehouseList } from '@/api/warehouse';
  import dayjs from 'dayjs';
  import { notifyStatusList } from '@/api/notify/notify-api';
  import NewQuestFormIndex from '@/views/bolita-views/quest/new/NewQuestFormIndex.vue';
  import { $ref } from 'vue/macros';
  import TaskDetailPage from '@/views/bolita-views/quest/QuestDetail/QuestDetailPage.vue';
  import { PermissionEnums } from '@/api/user/baseUser';
  import { Bell } from '@vicons/tabler';
  import { TaskStatus } from '@/api/task/task-types';
  import { QuestStatus } from '@/api/quest/quest-type';
  import { changeQuestStatus, checkQuest, deleteQuest, getQuestList } from '@/api/quest/quest-api';
  import { handleRequest, toastSuccess } from '@/utils/utils';
  import { useCheckDialog } from '@/store/modules/checkDialogState';

  function close() {
    showModal.value = false;
    reloadTable();
  }
  const schemas: FormSchema[] = [
    {
      field: 'salesName',
      component: 'NSelect',
      label: '负责人',
      componentProps: {
        placeholder: '请选择负责人',
        options: salesNameList.map((it) => {
          return {
            value: it,
            label: it,
          };
        }),
      },
    },
    {
      field: 'planArriveDate',
      component: 'NDatePicker',
      label: '预约时间',
      defaultValue: dayjs().valueOf(),
      componentProps: {
        type: 'date',
        clearable: true,
      },
    },
    {
      field: 'deliveryMethod',
      component: 'NSelect',
      label: '物流渠道',
      componentProps: {
        placeholder: '请选择物流渠道',
        options: deliveryMethods.map((it) => {
          return {
            value: it,
            label: it,
          };
        }),
      },
    },
    {
      field: 'arriveWarehouseName',
      component: 'NSelect',
      label: '到货仓库',
      componentProps: {
        placeholder: '请选择到货仓库',
        options: warehouseList.map((it) => {
          return {
            value: it,
            label: it,
          };
        }),
      },
    },
    {
      field: 'status',
      component: 'NSelect',
      label: '状态',
      componentProps: {
        placeholder: '状态',
        options: notifyStatusList.map((it) => {
          return {
            value: it,
            label: it,
          };
        }),
      },
    },
  ];

  const actionRef = ref();

  const showModal = ref(false);

  const actionColumn = reactive({
    width: 300,
    title: '操作',
    key: 'action',
    fixed: 'right',
    render(record) {
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '编辑',
            onClick: edit.bind(null, record.id, record.operationType),
            ifShow() {
              return record.status == QuestStatus.NotSubmit;
            },
          },
          {
            label: '删除',
            popConfirm: {
              title: '您是否确认删除本任务？',
              async confirm() {
                const res = await deleteQuest(record.id);
                await handleRequest(res, () => {
                  toastSuccess('删除成功');
                  reloadTable();
                });
              },
            },
            ifShow() {
              return record.status == QuestStatus.NotSubmit;
            },
          },
          {
            label: '详情',
            onClick: handleEdit.bind(null, record),
            ifShow: () => {
              return true;
            },
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
                  await changeQuestStatus(record.id, QuestStatus.WaitForCheck);
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
            async onClick() {
              //审核通过算作
              const res = await useCheckDialog().check();
              const re = await checkQuest(record.id, res);
              await handleRequest(re, () => {
                reloadTable();
              });
              console.log(res);
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
        dropDownActions: [],
        select: (key) => {
          window['$message'].info(`您点击了，${key} 按钮`);
        },
      });
    },
  });

  const [register, {}] = useForm({
    gridProps: { cols: '1 s:1 m:2 l:3 xl:4 2xl:4' },
    labelWidth: 80,
    schemas,
  });

  function addNotify() {
    showModal.value = true;
    currentTaskId = '';
    operationMode = 'all';
  }

  function addTask() {
    showModal.value = true;
    currentTaskId = '';
    operationMode = 'task';
  }

  function edit(id) {
    showModal.value = true;
    currentTaskId = id;
    operationMode = 'all';
  }

  const loadDataTable = async () => {
    return await getQuestList();
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

  function handleSubmit(values: Recordable) {
    console.log(values);
    reloadTable();
  }

  function handleReset(values: Recordable) {
    console.log(values);
  }

  async function submit(questId) {
    const res = await changeQuestStatus(questId, QuestStatus.WaitForCheck);
    await handleRequest(res, () => {
      showModal.value = false;
      reloadTable();
    });
  }

  let showDetailModel = $ref(false);
  let currentTaskId = $ref('');
  let operationMode: 'all' | 'task' = $ref('all');
</script>

<style lang="less" scoped></style>
