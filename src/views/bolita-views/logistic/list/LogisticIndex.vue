<template>
  <n-card :bordered="false" class="proCard">
    <BasicForm @register="register" @reset="handleReset" @submit="handleSubmit">
      <template #statusSlot="{ model, field }">
        <n-input v-model:value="model[field]" />
      </template>
    </BasicForm>
    <div class="my-2"></div>
    <BasicTable
      ref="actionRef"
      :actionColumn="actionColumn"
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      :scroll-x="1090"
      @update:checked-row-keys="onCheckedRow"
    >
      <template #tableTitle>
        <n-button type="primary" @click="addTable">
          <template #icon>
            <n-icon>
              <PlusOutlined />
            </n-icon>
          </template>
          新建
        </n-button>
      </template>
    </BasicTable>

    <n-modal v-model:show="showModal" :show-icon="false" preset="dialog" title="新建物流">
      <new-logistic-from-index @submit="createNewLogistic" />
    </n-modal>

    <n-modal v-model:show="showDetailModal">
      <logistic-detail @close="showDetailModal = false" :id="currentLogisticId" />
    </n-modal>

    <n-modal v-model:show="showAction" preset="dialog" title="提交物流更新信息">
      <logistic-status-form-index
        v-if="currentLogisticInfo"
        :logistic-type="currentLogisticInfo.logisticType"
        :status="currentLogisticInfo.status"
        @submit="handleStatusAction"
      />
    </n-modal>

    <n-modal v-model:show="showInputPrice">
      <n-card title="输入价格" style="max-width: 400px">
        <n-form-item label="价格">
          <n-input placeholder="请输入价格" v-model:value="price" />
        </n-form-item>
        <n-button type="primary" @click="submitPrice"> 确认报价 </n-button>
      </n-card>
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { BasicForm, useForm } from '@/components/Form';
  import { columns } from './columns';
  import { PlusOutlined } from '@vicons/antd';
  import { handleRequest } from '@/utils/utils';
  import {
    changeLogisticPrice,
    changeLogisticStatus,
    createLogistic,
    finishLogistic,
    getLogisticList,
    sendOutLogistic,
    submitLogisticFeedBack,
  } from '@/api/deliveryMethod/logistic-api';
  import { searchField } from '@/views/bolita-views/logistic/list/SearchField';
  import NewLogisticFromIndex from '@/views/bolita-views/logistic/newLogisticForm/NewLogisticFromIndex.vue';
  import { getFileListUrl } from '@/plugins/firebase';
  import LogisticDetail from '@/views/bolita-views/logistic/logisticDetail/LogisticDetail.vue';
  import { LogisticModel, LogisticStatus } from '@/api/deliveryMethod/logistic-type';
  import { PermissionEnums } from '@/api/user/baseUser';
  import LogisticStatusFormIndex from '@/views/bolita-views/logistic/StatusForms/LogisticStatusFormIndex.vue';
  import { resultError } from '../../../../utils/request/_util';

  const actionRef = ref();
  const [register, {}] = useForm({
    gridProps: { cols: '1 s:1 m:2 l:3 xl:4 2xl:4' },
    labelWidth: 80,
    schemas: searchField,
  });
  const showModal = ref(false);
  let showAction = $ref(false);
  let showInputPrice = $ref(false);
  let price: string = $ref('');
  function showPriceInput(id) {
    price = '';
    currentLogisticId = id;
    showInputPrice = true;
  }

  async function submitPrice() {
    showInputPrice = false;
    const res = await changeLogisticPrice(currentLogisticId, price);
    await handleRequest(res, () => {
      price = '';
      reloadTable();
    });
  }

  const actionColumn = reactive({
    width: 220,
    title: '操作',
    key: 'action',
    fixed: 'right',
    render(record: LogisticModel) {
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '详情',
            onClick: showDetail.bind(null, record),
          },
          {
            label: '提交',
            onClick: submitToCheck.bind(null, record),
            ifShow() {
              return (
                record.status === LogisticStatus.NotSubmit ||
                record.status === LogisticStatus.CheckRefused
              );
            },
            auth: [PermissionEnums.Technical, PermissionEnums.Manager, PermissionEnums.Customer],
          },
          {
            label: '审核',
            onClick: check.bind(null, record),
            ifShow() {
              return record.status === LogisticStatus.WaitForCheck;
            },
            auth: [PermissionEnums.Technical, PermissionEnums.Manager, PermissionEnums.Logistic],
          },
          {
            label: '提交报价',
            onClick: showPriceInput.bind(null, record.id),
            ifShow() {
              return (
                record.status === LogisticStatus.WaitForPrice ||
                record.status === LogisticStatus.PriceRefused
              );
            },
            auth: [PermissionEnums.Technical, PermissionEnums.Manager, PermissionEnums.Logistic],
          },
          {
            label: '确认报价',
            onClick: confirmPrice.bind(null, record),
            ifShow() {
              return record.status === LogisticStatus.WaitForPriceConfirm;
            },
            auth: [PermissionEnums.Technical, PermissionEnums.Manager, PermissionEnums.Customer],
          },
          {
            label: '提交文件',
            onClick: showStatusAction.bind(null, record),
            ifShow() {
              return record.status === LogisticStatus.WaitForFeedBack;
            },
            auth: [PermissionEnums.Technical, PermissionEnums.Manager, PermissionEnums.Logistic],
          },
          {
            label: '提交提货单',
            onClick: showStatusAction.bind(null, record),
            ifShow() {
              return record.status === LogisticStatus.ReadyToSend;
            },
            auth: [PermissionEnums.Technical, PermissionEnums.Manager, PermissionEnums.Logistic],
          },
          {
            label: '提交POD',
            onClick: showStatusAction.bind(null, record),
            ifShow() {
              return record.status === LogisticStatus.Sent;
            },
            auth: [PermissionEnums.Technical, PermissionEnums.Manager, PermissionEnums.Logistic],
          },
        ],
      });
    },
  });

  function addTable() {
    showModal.value = true;
  }

  const loadDataTable = async () => {
    return await getLogisticList({});
  };

  function onCheckedRow(rowKeys) {
    console.log(rowKeys);
  }

  function reloadTable() {
    actionRef.value.reload();
  }

  async function createNewLogistic(info) {
    console.log(info);
    info.files = await getFileListUrl(info.logisticDetail.files);
    delete info.logisticDetail.files;
    const res = await createLogistic(info);
    await handleRequest(res, () => {
      showModal.value = false;
      reloadTable();
    });
  }

  let showDetailModal = $ref(false);
  let currentLogisticId: string = $ref('');
  let currentLogisticInfo: LogisticModel | null = $ref(null);

  function showDetail(record: Recordable) {
    showDetailModal = true;
    currentLogisticId = record.id;
  }

  function submitToCheck(record) {
    window['$dialog'].info({
      title: '您确定吗？',
      content: '一旦提交到审核就不能再修改了',
      positiveText: '是的',
      negativeText: '取消',
      async onPositiveClick() {
        await changeLogisticStatus(record.id, LogisticStatus.WaitForCheck);
        reloadTable();
      },
      onNegativeClick() {},
    });
  }

  function check(record) {
    window['$dialog'].info({
      title: '资料是否可以通过审核？',
      content: '请点击详情以查看任务详情，如果资料没有问题，请点击通过审核，否则请点击拒绝',
      positiveText: '通过审核',
      negativeText: '拒绝',
      async onPositiveClick() {
        await changeLogisticStatus(record.id, LogisticStatus.WaitForPrice);
        reloadTable();
      },
      async onNegativeClick() {
        await changeLogisticStatus(record.id, LogisticStatus.CheckRefused);
        reloadTable();
      },
    });
  }

  function confirmPrice(record) {
    console.log(record);
    window['$dialog'].info({
      title: '目前仓库为您的物流计划给出的报价是' + record.price,
      content: '该报价是否可行？',
      positiveText: '接受报价',
      negativeText: '拒绝',
      async onPositiveClick() {
        await changeLogisticStatus(record.id, LogisticStatus.WaitForFeedBack);
        reloadTable();
      },
      async onNegativeClick() {
        await changeLogisticStatus(record.id, LogisticStatus.PriceRefused);
        reloadTable();
      },
    });
  }

  function handleSubmit(values: Recordable) {
    console.log(values);
    reloadTable();
  }

  function handleReset(values: Recordable) {
    console.log(values);
  }

  function showStatusAction(record) {
    currentLogisticInfo = record;
    showAction = true;
  }

  async function handleStatusAction(value) {
    if (currentLogisticInfo != null) {
      const { status } = currentLogisticInfo;
      let res = resultError('');
      if (status == LogisticStatus.WaitForFeedBack) {
        res = await submitLogisticFeedBack(currentLogisticInfo.id, value);
      } else if (status == LogisticStatus.ReadyToSend) {
        res = await sendOutLogistic(currentLogisticInfo.id, value);
      } else if (status == LogisticStatus.Sent) {
        res = await finishLogistic(currentLogisticInfo.id, value);
      }
      await handleRequest(res, () => {
        showAction = false;
        currentLogisticInfo = null;
        reloadTable();
      });
    }
  }
</script>

<style lang="less" scoped></style>
