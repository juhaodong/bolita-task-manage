<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar :form-fields="filters" @clear="updateFilter(null)" @submit="updateFilter" />
    <div class="my-2"></div>
    <BasicTable
      ref="actionRef"
      :actionColumn="actionColumn"
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
    >
      <template #tableTitle> </template>
    </BasicTable>

    <n-modal
      v-model:show="paymentDialogShow"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="费用支付情况管理"
    >
      <car-payment-dialog :model="currentModel" @saved="reloadTable" />
    </n-modal>
    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="新建拼车管理"
    >
      <new-carpool-management :model="currentModel" @saved="reloadTable" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { Component, h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import NewCarpoolManagement from '@/views/newViews/CarpoolManagement/dialog/NewCarpoolManagement.vue';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { $ref } from 'vue/macros';
  import { CarpoolManager } from '@/api/dataLayer/modules/logistic/carpool';
  import { NotifyModel } from '@/api/dataLayer/modules/notify/notify-api';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import DocumentEdit16Filled from '@vicons/fluent/es/DocumentEdit16Filled';
  import { CurrencyEuro } from '@vicons/carbon';
  import CarPaymentDialog from '@/views/newViews/CarpoolManagement/dialog/CarPaymentDialog.vue';

  const showModal = ref(false);

  let filterObj: any | null = $ref(null);
  let currentModel: any | null = $ref(null);
  let paymentDialogShow: boolean = $ref(false);
  const loadDataTable = async () => {
    return await CarpoolManager.load(filterObj);
  };
  const actionRef = ref();

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  function reloadTable() {
    actionRef.value.reload();
    showModal.value = false;
    paymentDialogShow = false;
  }
  async function startEdit(id) {
    currentModel = await CarpoolManager.getById(id);
    showModal.value = true;
  }

  async function doPayment(id) {
    currentModel = await CarpoolManager.getById(id);
    paymentDialogShow = true;
  }

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 120,
    render(record: NotifyModel) {
      const fileAction = (label, key, icon?: Component) => {
        return getFileActionButton(label, key, CarpoolManager, reloadTable, record, icon);
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
          fileAction('提单', 'pickupFiles'),
          fileAction('POD', 'PODFiles'),
          fileAction('账单', 'bills'),
          {
            label: '费用',
            icon: CurrencyEuro,
            highlight: () => {
              if (record?.paymentSubmit) {
                return 'success';
              } else if (record?.billedCompany) {
                return 'warning';
              } else {
                return 'error';
              }
            },
            onClick() {
              doPayment(record.id);
            },
          },
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
