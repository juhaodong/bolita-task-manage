<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar @submit="updateFilter" :form-fields="filters" @clear="updateFilter(null)">
      <n-button size="small" type="info" @click="addTable(NotifyType.Container)">
        <template #icon>
          <n-icon>
            <Box20Filled />
          </n-icon>
        </template>
        新建货柜预报
      </n-button>
      <n-button @click="downloadFiles" size="small" type="info">
        <template #icon>
          <n-icon>
            <Box20Filled />
          </n-icon>
        </template>
        卸柜业务流程
      </n-button>
      <n-button @click="downloadFiles" size="small" type="info">
        <template #icon>
          <n-icon>
            <Box20Filled />
          </n-icon>
        </template>
        货柜预报填写注意事项
      </n-button>
      <n-button size="small" @click="clearAllData()">
        <template #icon>
          <n-icon>
            <TruckDelivery />
          </n-icon>
        </template>
        清除数据
      </n-button>
    </filter-bar>
    <div class="my-2"></div>
    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
    />
    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      preset="card"
      title="新建货柜预报"
      :style="{ maxWidth: notifyType === NotifyType.TrayOrBox ? '1600px' : '800px' }"
      style="width: 90%; min-width: 600px"
    >
      <container-forecast-index
        :current-model="currentModel"
        @saved="closeAddDialog"
        :type="notifyType"
      />
    </n-modal>
    <n-modal
      v-model:show="showOperationTable"
      :show-icon="false"
      preset="dialog"
      title="卸柜表"
      style="width: 90%; min-width: 600px; max-width: 800px"
    >
      <notify-unload-form @save="reloadTable" :notify-id="currentNotifyId!" />
    </n-modal>
    <n-modal
      v-model:show="showFeeDialog"
      :show-icon="false"
      preset="dialog"
      title="费用表"
      style="width: 90%; min-width: 600px; max-width: 800px"
    >
      <notify-fee-dialog :notify-id="currentNotifyId!" @save="reloadTable" />
    </n-modal>
    <n-modal
      v-model:show="showWarehouseDialog"
      :show-icon="false"
      preset="dialog"
      title="仓库信息"
      style="width: 90%; min-width: 600px; max-width: 800px"
    >
      <warehouse-info-dialog :notify-id="currentNotifyId!" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { Component, h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import { Box20Filled } from '@vicons/fluent';
  import { NotifyManager, NotifyType } from '@/api/dataLayer/modules/notify/notify-api';
  import { $ref } from 'vue/macros';
  import { TruckDelivery } from '@vicons/tabler';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import Delete28Filled from '@vicons/fluent/es/Delete28Filled';
  import { Hammer } from '@vicons/ionicons5';
  import NotifyUnloadForm from '@/views/newViews/ContainerForecast/form/NotifyUnloadForm.vue';
  import WarehouseInfoDialog from '@/views/newViews/ContainerForecast/form/WarehouseInfoDialog.vue';
  import NotifyFeeDialog from '@/views/newViews/ContainerForecast/form/NotifyFeeDialog.vue';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { clearAllData } from '@/api/dataLayer/clearAllData';
  import ContainerForecastIndex from '@/views/newViews/ContainerForecast/form/ContainerForecastIndex.vue';
  import DocumentEdit16Filled from '@vicons/fluent/es/DocumentEdit16Filled';
  import { handleRequest, toastSuccess } from '@/store/utils/utils';

  let notifyType: NotifyType = $ref(NotifyType.Container);
  let currentModel: any | null = $ref(null);

  const showModal = ref(false);

  let showOperationTable = $ref(false);
  let currentNotifyId: string | null = $ref(null);
  let showWarehouseDialog = $ref(false);
  let showFeeDialog = $ref(false);
  let filterObj: any | null = $ref(null);

  function addTable(type: NotifyType) {
    notifyType = type;
    currentModel = null;
    showModal.value = true;
  }

  const loadDataTable = async () => {
    const res = await NotifyManager.load(filterObj);
    console.log(res, 'res');
    return res;
  };

  const actionRef = ref();

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  async function startEdit(id) {
    currentModel = await NotifyManager.getById(id);
    showModal.value = true;
  }

  function reloadTable() {
    actionRef.value.reload();
    showOperationTable = false;
    showFeeDialog = false;
  }

  async function downloadFiles() {
    window.open(
      'https://firebasestorage.googleapis.com/v0/b/bolita-task-manage.appspot.com/o/bolita%2F1704376613996-%E6%AD%A3%E6%96%B9%E5%BD%A2%E8%BF%AA%E8%BF%A6.png?alt=media&token=9ad0dc83-b898-4309-9d7f-c600fa4123de',
      '_blank'
    );
  }

  async function closeAddDialog() {
    reloadTable();
    showModal.value = false;
  }

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 120,
    render(record: any) {
      const fileAction = (label, key, icon?: Component) => {
        return getFileActionButton(label, key, NotifyManager, reloadTable, record, icon);
      };
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '修改',
            icon: DocumentEdit16Filled,
            onClick() {
              startEdit(record.id);
            },
          },
          fileAction('CMR', 'CMRFiles'),
          {
            label: '卸柜单',
            icon: Hammer,
            onClick() {
              currentNotifyId = record.id!;
              showOperationTable = true;
            },
          },
          {
            label: '预报文件',
            icon: DocumentEdit16Filled,
            onClick() {
              window.open(record.files[0]);
            },
          },
          {
            label: '取消',
            icon: Delete28Filled,
            async onClick() {
              const res = await NotifyManager.edit(
                {
                  inStatus: '已取消',
                },
                record.id
              );
              await handleRequest(res, () => {
                toastSuccess('sucees');
                reloadTable();
              });
            },
          },
          {
            label: '结算',
            icon: DocumentEdit16Filled,
            onClick() {
              currentNotifyId = record.id!;
              showFeeDialog = true;
            },
          },
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
