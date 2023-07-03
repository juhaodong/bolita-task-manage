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
          <n-button type="primary" @click="addTable(NotifyType.Container)">
            <template #icon>
              <n-icon>
                <Box20Filled />
              </n-icon>
            </template>
            新建货柜预报
          </n-button>
          <n-button type="primary" @click="addTable(NotifyType.TrayOrBox)">
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
      <notify-form-index :type="notifyType" @submit="createNewNotify" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns } from './columns';
  import { Box20Filled } from '@vicons/fluent';
  import { TruckDelivery } from '@vicons/tabler';
  import {
    changeNotifyStatus,
    createNotify,
    getNotifyList,
    NotifyCreateDTO,
    NotifyStatus,
    NotifyType,
  } from '@/api/notify/notify-api';
  import NotifyFormIndex from '@/views/bolita-views/notify/NotifyFormPage/NotifyFormIndex.vue';
  import { handleRequest } from '@/utils/utils';
  import { useUserStore } from '@/store/modules/user';
  import NotifyDetailPage from '@/views/bolita-views/notify/NotifyDetail/NotifyDetailPage.vue';
  import { $ref } from 'vue/macros';
  import { PermissionEnums } from '@/api/user/baseUser';

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

  function addTable(type: NotifyType) {
    notifyType = type;
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
    const info: NotifyCreateDTO = {
      files: [],
      arriveDetail: notifyInfo.arriveDetail,
      arriveMedia: notifyInfo.arriveMedia,
      customerId: user.info.id,
      planArriveDateTime: notifyInfo.arriveDetail.planArriveDateTime,
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
</script>

<style lang="less" scoped></style>
