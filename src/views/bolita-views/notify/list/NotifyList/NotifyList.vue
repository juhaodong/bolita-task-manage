<template>
  <n-card :bordered="false" class="proCard">
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
          <n-button @click="addTable(NotifyType.Container)">
            <template #icon>
              <n-icon>
                <Box20Filled />
              </n-icon>
            </template>
            新建货柜预报
          </n-button>
          <n-button @click="addTable(NotifyType.TrayOrBox)">
            <template #icon>
              <n-icon>
                <TruckDelivery />
              </n-icon>
            </template>
            新建托盘/散包裹预报
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

    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      preset="card"
      title="新建到货预报"
      style="width: 90%; min-width: 600px; max-width: 1200px"
    >
      <notify-form-index @saved="closeAddDialog" :type="notifyType" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns } from './columns';
  import { Box20Filled } from '@vicons/fluent';
  import {
    changeNotifyStatus,
    deleteNotify,
    getNotifyList,
    NotifyStatus,
    NotifyType,
  } from '@/api/notify/notify-api';
  import NotifyFormIndex from '@/views/bolita-views/notify/NotifyFormPage/NotifyFormIndex.vue';
  import NotifyDetailPage from '@/views/bolita-views/notify/NotifyDetail/NotifyDetailPage.vue';
  import { $ref } from 'vue/macros';
  import { PermissionEnums } from '@/api/user/baseUser';
  import { useCheckDialog } from '@/store/modules/checkDialogState';
  import { handleRequest } from '@/utils/utils';
  import { TruckDelivery } from '@vicons/tabler';

  let notifyType: NotifyType = $ref(NotifyType.Container);

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
            label: '删除',
            popConfirm: {
              title: '是否确定删除此预报？',
              async confirm() {
                await deleteNotify(record.id);
                reloadTable();
              },
            },
            ifShow: () => {
              return record.status == NotifyStatus.NotSubmit;
            },
            auth: [PermissionEnums.Manager, PermissionEnums.Customer, PermissionEnums.Technical],
          },
          {
            label: '提交',
            popConfirm: {
              title: '是否确定提交到审核？',
              confirm() {
                submitToCheck(record);
              },
            },
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
        select: (key) => {
          window['$message'].info(`您点击了，${key} 按钮`);
        },
      });
    },
  });

  function addTable(type: NotifyType) {
    notifyType = type;
    showModal.value = true;
  }

  const loadDataTable = async () => {
    return (await getNotifyList({})).filter((it) => it.notifyType === NotifyType.Container);
  };

  function onCheckedRow(rowKeys) {
    console.log(rowKeys);
  }
  function reloadTable() {
    actionRef.value.reload();
  }
  async function closeAddDialog() {
    reloadTable();
    showModal.value = false;
  }

  let currentNotifyId: string | null = $ref(null);
  function goDetail(record: Recordable) {
    currentNotifyId = record.id;
    showDetailModal = true;
  }

  async function check(record) {
    const res = await useCheckDialog().check();
    const newStatus = res.checkPassed ? NotifyStatus.WaitFroArrive : NotifyStatus.Refused;
    const re = await changeNotifyStatus(record.id, newStatus, res.warehouseId);
    await handleRequest(re, () => {
      reloadTable();
    });
  }

  async function submitToCheck(record) {
    await changeNotifyStatus(record.id, NotifyStatus.WaitForCheck);
    reloadTable();
  }
</script>

<style lang="less" scoped></style>
