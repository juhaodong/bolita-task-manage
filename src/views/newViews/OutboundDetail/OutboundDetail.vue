<template>
  <n-card :bordered="false" class="proCard">
    <div class="my-2"></div>
    <BasicTable
      ref="actionRef"
      :actionColumn="actionColumn"
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      :scroll-x="3000"
      @update:checked-row-keys="onCheckedRow"
    >
      <template #tableTitle>
        <n-space>
          <n-button @click="addTable(NotifyType.Container)">
            <template #icon>
              <n-icon>
                <Box20Filled />
              </n-icon>
            </template>
            批量导入
          </n-button>
        </n-space>
      </template>
    </BasicTable>

    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 1200px"
      title="新建到货预报"
    >
      <notify-form-index :type="notifyType" @saved="closeAddDialog" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns } from './columns';
  import { Box20Filled } from '@vicons/fluent';
  import { deleteNotify, NotifyStatus, NotifyType } from '@/api/notify/notify-api';
  import NotifyFormIndex from '@/views/bolita-views/notify/NotifyFormPage/NotifyFormIndex.vue';
  import { $ref } from 'vue/macros';
  import { PermissionEnums } from '@/api/user/baseUser';

  let notifyType: NotifyType = $ref(NotifyType.Container);

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
          },
          {
            label: '详情',
          },
          {
            label: '删除',
            popConfirm: {
              title: '是否确定删除此预报？',
              async confirm() {
                await deleteNotify(record.id);
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
            },
            ifShow: () => {
              return record.status == NotifyStatus.NotSubmit;
            },
            auth: [PermissionEnums.Manager, PermissionEnums.Customer, PermissionEnums.Technical],
          },
          {
            label: '审核',
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
</script>

<style lang="less" scoped></style>
