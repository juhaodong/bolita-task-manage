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
      <template #tableTitle></template>
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
      title="新建订车管理"
    >
      <new-carpool-management :model="currentModel" @saved="reloadTable" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { Component, computed, h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import NewCarpoolManagement from '@/views/newViews/CarpoolManagement/dialog/NewCarpoolManagement.vue';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { $ref } from 'vue/macros';
  import { CarpoolManager } from '@/api/dataLayer/modules/logistic/carpool';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import DocumentEdit16Filled from '@vicons/fluent/es/DocumentEdit16Filled';
  import { CurrencyEuro } from '@vicons/carbon';
  import CarPaymentDialog from '@/views/newViews/CarpoolManagement/dialog/CarPaymentDialog.vue';
  import { useUserStore } from '@/store/modules/user';
  import { CarpoolManagementPower } from '@/api/dataLayer/common/PowerModel';

  const showModal = ref(false);

  let filterObj: any | null = $ref(null);
  let currentModel: any | null = $ref(null);
  let paymentDialogShow: boolean = $ref(false);
  const loadDataTable = async () => {
    const res = await CarpoolManager.load();
    console.log(res, 'res');
    return res;
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

  const AccountPowerList = computed(() => {
    return useUserStore()?.info?.powerList;
  });
  const SubmitOrderOperate = computed(() => {
    return AccountPowerList.value.includes(CarpoolManagementPower.SubmitOrder);
  });
  const PODOperate = computed(() => {
    return AccountPowerList.value.includes(CarpoolManagementPower.POD);
  });
  const BillOperate = computed(() => {
    return AccountPowerList.value.includes(CarpoolManagementPower.Bill);
  });

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 120,
    render(record: any) {
      const fileAction = (label, key, disableClick, icon?: Component) => {
        return getFileActionButton(
          label,
          key,
          CarpoolManager,
          reloadTable,
          record,
          icon,
          true,
          disableClick
        );
      };
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '修改',
            icon: DocumentEdit16Filled,
            onClick() {
              console.log(!SubmitOrderOperate.value, '!SubmitOrderOperate.value');
              startEdit(record.id);
            },
          },
          fileAction('提单', 'pickupFiles', !SubmitOrderOperate.value),
          fileAction('POD', 'PODFiles', !PODOperate.value),
          fileAction('账单', 'bills', !BillOperate.value),
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
