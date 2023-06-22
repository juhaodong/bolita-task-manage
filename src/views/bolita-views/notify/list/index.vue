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
          <n-button type="primary" @click="addTable">
            <template #icon>
              <n-icon>
                <PlusOutlined />
              </n-icon>
            </template>
            新建
          </n-button>
          <n-button type="default" @click="showScanInput">
            <template #icon>
              <n-icon>
                <ScanOutlined />
              </n-icon>
            </template>
            扫描
          </n-button>
        </n-space>
      </template>
    </BasicTable>
    <n-modal v-model:show="showDetailModal">
      <notify-detail-page
        @refresh="reloadTable"
        v-if="currentNotifyId != null"
        @close="showDetailModal = false"
        :notify-id="currentNotifyId"
      />
    </n-modal>

    <n-modal v-model:show="showModal" :show-icon="false" preset="dialog" title="新建到货预报">
      <notify-form-index @submit="createNewNotify" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { h, reactive, ref } from 'vue';
  // import { useMessage } from 'naive-ui';
  import { BasicTable, TableAction } from '@/components/Table';
  import { BasicForm, FormSchema, useForm } from '@/components/Form';
  import { columns } from './columns';
  import { PlusOutlined, ScanOutlined } from '@vicons/antd';
  import {
    arriveMedia,
    changeNotifyStatus,
    createNotify,
    getNotifyList,
    NotifyModel,
    NotifyStatus,
    notifyStatusList,
  } from '@/api/notify/notify-api';
  import { salesNameList } from '@/api/sales';
  import { deliveryMethods } from '@/api/deliveryMethod';
  import { warehouseList } from '@/api/warehouse';
  import dayjs from 'dayjs';
  import NotifyFormIndex from '@/views/bolita-views/notify/NotifyFormPage/NotifyFormIndex.vue';
  import { generateOptionFromArray, handleRequest } from '@/utils/utils';
  import { useUserStore } from '@/store/modules/user';
  import NotifyDetailPage from '@/views/bolita-views/notify/NotifyDetail/NotifyDetailPage.vue';
  import { $ref } from 'vue/macros';
  import { PermissionEnums } from '@/api/user/baseUser';

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
        onUpdateValue: (e: any) => {
          console.log(e);
        },
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
        onUpdateValue: (e: any) => {
          console.log(e);
        },
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
        onUpdateValue: (e: any) => {
          console.log(e);
        },
      },
    },
    {
      field: 'arriveMedia',
      component: 'NSelect',
      label: '到货类型',
      componentProps: {
        placeholder: '请选择到货类型',
        options: generateOptionFromArray(arriveMedia),
        onUpdateValue: (e: any) => {
          console.log(e);
        },
      },
    },

    {
      field: 'customerId',
      component: 'NInput',
      label: '客户代码',
      componentProps: {
        placeholder: '请输入客户代码',
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
        onUpdateValue: (e: any) => {
          console.log(e);
        },
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
        onUpdateValue: (e: any) => {
          console.log(e);
        },
      },
    },
  ];

  const actionRef = ref();
  let showDetailModal = $ref(false);

  const showModal = ref(false);

  const actionColumn = reactive({
    width: 220,
    title: '可用动作',
    key: 'action',
    fixed: 'right',
    render(record) {
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '详情',
            onClick: goDetail.bind(null, record),
          },
          {
            label: '提交',
            onClick: submitToCheck.bind(null, record),
            ifShow: () => {
              return record.status == NotifyStatus.NotSubmit;
            },
            auth: [PermissionEnums.Manager, PermissionEnums.Customer, PermissionEnums.Technical],
          },
          {
            label: '审核',
            onClick: check.bind(null, record),
            ifShow: () => {
              return record.status == NotifyStatus.WaitForCheck;
            },
            auth: [PermissionEnums.Manager, PermissionEnums.Sales, PermissionEnums.Technical],
          },
        ],
        dropDownActions: [
          {
            label: '编辑',
            onClick: goDetail.bind(null, record),
            ifShow: () => {
              return true;
            },
          },
          {
            label: '取消预报',
          },
        ],
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

  function addTable() {
    showModal.value = true;
  }

  const loadDataTable = async () => {
    return await getNotifyList({});
  };

  function onCheckedRow(rowKeys) {
    console.log(rowKeys);
  }
  function reloadTable() {
    actionRef.value.reload();
  }
  const user = useUserStore();
  async function createNewNotify(notifyInfo) {
    const info: NotifyModel = {
      arriveDetail: notifyInfo.arriveDetail,
      arriveMedia: notifyInfo.arriveMedia,
      arriveWarehouseId: notifyInfo.arriveWarehouseId,
      arrivedCount: 0,
      customerId: user.info.id,
      note: notifyInfo.arriveDetail.note ?? '',
      planArriveDateTime: notifyInfo.arriveDetail.planArriveDateTime,
      sortingLabelCount: notifyInfo.arriveDetail.sortingLabelCount,
      status: NotifyStatus.NotSubmit,
      taskList: notifyInfo.taskList,
      totalCount: notifyInfo.totalCount,
    };
    const res = await createNotify(info);
    await handleRequest(res, () => {
      showModal.value = false;
      reloadTable();
    });
  }

  let currentNotifyId: string | null = $ref(null);
  function goDetail(record: Recordable) {
    currentNotifyId = record.id;
    showDetailModal = true;
  }

  function check(record) {
    window['$dialog'].info({
      title: '资料是否可以通过审核？',
      content: '请点击详情以查看任务详情，如果资料没有问题，请点击通过审核，否则请点击拒绝任务',
      positiveText: '通过审核',
      negativeText: '拒绝任务',
      async onPositiveClick() {
        await changeNotifyStatus(record.id, NotifyStatus.WaitFroArrive);
        reloadTable();
      },
      async onNegativeClick() {
        await changeNotifyStatus(record.id, NotifyStatus.Refused);
        reloadTable();
      },
    });
  }

  function submitToCheck(record) {
    window['$dialog'].info({
      title: '您确定吗？',
      content: '一旦提交到审核就不能再修改了',
      positiveText: '是的',
      negativeText: '取消',
      async onPositiveClick() {
        await changeNotifyStatus(record.id, NotifyStatus.WaitForCheck);
        reloadTable();
      },
      onNegativeClick() {},
    });
  }

  function handleSubmit(values: Recordable) {
    console.log(values);
    reloadTable();
  }

  function handleReset(values: Recordable) {
    console.log(values);
  }

  let scanModal = $ref(false);
  let scanInput = $ref('');
  function showScanInput() {
    scanModal = true;
  }
</script>

<style lang="less" scoped></style>
