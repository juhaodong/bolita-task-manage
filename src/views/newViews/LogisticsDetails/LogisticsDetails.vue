<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar
      v-if="finished"
      :default-value-model="filterObj"
      :form-fields="filters"
      @clear="updateFilter(null)"
      @submit="updateFilter"
    >
      <n-button type="primary" @click="showOutStorageDeliveryDialog = true">
        <template #icon>
          <n-icon>
            <Box20Filled />
          </n-icon>
        </template>
        新建仓外物流
      </n-button>
      <n-button
        v-if="bookCarBtn"
        :disabled="checkedRows.length == 0"
        type="warning"
        @click="startShareCar()"
      >
        订车
      </n-button>
      <n-button
        v-if="cancelBookBtn"
        :disabled="checkedRows.length == 0"
        type="error"
        @click="cancelCar()"
      >
        取消订车
      </n-button>
    </filter-bar>
    <div class="my-2"></div>
    <BasicTable
      ref="actionRef"
      v-model:checked-row-keys="checkedRows"
      :actionColumn="actionColumn"
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
    />
    <n-modal
      v-model:show="showOutStorageDeliveryDialog"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="新建订车"
    >
      <new-logistic-detail @saved="reloadTable" />
    </n-modal>
    <n-modal
      v-model:show="showShareCarModel"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="新建订车"
    >
      <new-carpool-management :merged-out-ids="checkedRows" @saved="saveShareCar" />
    </n-modal>
    <n-modal
      v-model:show="showFeeDialog"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="报价确认"
    >
      <logistic-fee-dialog :model="currentModel" @saved="reloadTable" />
    </n-modal>
    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 1200px"
      title="编辑物流明细"
    >
      <logistic-form :model="currentModel" @saved="reloadTable" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { Component, computed, h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import { Box20Filled } from '@vicons/fluent';
  import LogisticForm from '@/views/newViews/LogisticsDetails/form/LogisticForm.vue';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { $ref } from 'vue/macros';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { carpoolSelfCheck } from '@/api/dataLayer/modules/logistic/carpool';
  import NewCarpoolManagement from '@/views/newViews/CarpoolManagement/dialog/NewCarpoolManagement.vue';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import { OutBoundPlanManager } from '@/api/dataLayer/modules/OutBoundPlan/outBoundPlan';
  import { where } from 'firebase/firestore';
  import { truckDeliveryMethod } from '@/api/dataLayer/modules/deliveryMethod';
  import { CurrencyEuro } from '@vicons/carbon';
  import { CashStatus } from '@/api/dataLayer/modules/notify/notify-api';
  import LogisticFeeDialog from '@/views/newViews/LogisticsDetails/form/LogisticFeeDialog.vue';
  import NewLogisticDetail from '@/views/newViews/LogisticsDetails/form/NewLogisticDetail.vue';
  import { usePermission } from '@/hooks/web/usePermission';
  import { useUserStore } from '@/store/modules/user';
  import { LogisticsDetailPower } from '@/api/dataLayer/common/PowerModel';
  import { OperationType, saveCash } from '@/api/dataLayer/modules/cash/cash';

  interface Prop {
    carpoolId?: string;
  }

  const { hasPermission } = usePermission();
  const props = defineProps<Prop>();
  let finished = $ref(false);
  let currentModel: any | null = $ref(null);
  let showShareCarModel = $ref(false);
  let showOutStorageDeliveryDialog = $ref(false);
  let showFeeDialog = $ref(false);
  let checkedRows = $ref([]);
  onMounted(() => {
    if (props.carpoolId) {
      filterObj = { carpoolId: props.carpoolId };
    }
    finished = true;
  });

  const showModal = ref(false);

  let filterObj: any | null = $ref(null);

  const loadDataTable = async () => {
    return await OutBoundPlanManager.load(
      filterObj,
      where('deliveryMethod', 'in', truckDeliveryMethod)
    );
  };

  const actionRef = ref();

  const AccountPowerList = computed(() => {
    return useUserStore()?.info?.powerList;
  });
  const bookCarBtn = computed(() => {
    return AccountPowerList.value.includes(LogisticsDetailPower.BookCar);
  });
  const cancelBookBtn = computed(() => {
    return AccountPowerList.value.includes(LogisticsDetailPower.CancelBookCar);
  });
  const costOperate = computed(() => {
    return AccountPowerList.value.includes(LogisticsDetailPower.CostOperate);
  });
  const customerBills = computed(() => {
    return AccountPowerList.value.includes(LogisticsDetailPower.CustomerBills);
  });

  async function startEdit(id) {
    currentModel = await OutBoundPlanManager.getById(id);
    showModal.value = true;
  }

  async function startFee(id) {
    currentModel = await OutBoundPlanManager.getById(id);
    showFeeDialog = true;
  }

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  function reloadTable() {
    actionRef.value.reload();
    showModal.value = false;
    showShareCarModel = false;
    showFeeDialog = false;
    showOutStorageDeliveryDialog = false;
  }

  function startShareCar() {
    showShareCarModel = true;
  }

  async function saveShareCar() {
    reloadTable();
    checkedRows = [];
  }

  async function cancelCar() {
    await safeScope(async () => {
      const currentList: any[] = [];
      for (const checkedRow of checkedRows) {
        currentList.push(await OutBoundPlanManager.getById(checkedRow));
      }
      const affectIds = currentList.map((it) => it.carpoolId);
      for (const checkedRow of checkedRows) {
        await OutBoundPlanManager.editInternal({ carpoolId: '' }, checkedRow);
      }
      for (const affectId of affectIds) {
        await carpoolSelfCheck(affectId);
      }
      reloadTable();
      checkedRows = [];
    });
  }

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 120,
    render(record: any) {
      const fileAction = (
        label,
        key,
        icon?: Component,
        editable = true,
        permissions: any = null
      ) => {
        return getFileActionButton(
          label,
          key,
          OutBoundPlanManager,
          reloadTable,
          record,
          icon,
          editable,
          permissions
        );
      };
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '费用',
            icon: CurrencyEuro,
            onClick() {
              startEdit(record.id);
            },
            ifShow: costOperate.value,
            highlight: () => {
              if (record?.logisticCashStatus == CashStatus.Done) {
                return 'success';
              } else if (record?.logisticCashStatus == CashStatus.WaitConfirm) {
                return 'warning';
              } else {
                return 'error';
              }
            },
          },
          {
            label: '报价',
            highlight: () => {
              if (!record?.price) {
                return 'error';
              } else if (!record?.priceConfirmed) {
                return 'warning';
              } else {
                return 'success';
              }
            },
            onClick() {
              startFee(record.id);
            },
          },
          fileAction('附件', 'files', undefined, true),
          fileAction('提单', 'pickupFiles', undefined, true),
          fileAction('pod', 'PODFiles'),
          fileAction('客户账单', 'billsForCustomer', undefined, customerBills.value),
          {
            label: '确认结算',
            highlight: () => {
              if (record?.logisticCashStatus === CashStatus.Done) {
                return 'success';
              }
            },
            ifShow: () => {
              return record.logisticCashId;
            },
            async onClick() {
              if (record.logisticCashStatus !== CashStatus.Done) {
                const editValue = {
                  logisticCashStatus: CashStatus.Done,
                };
                await safeScope(async () => {
                  await saveCash(
                    {
                      customerId: record?.customerId,
                      containerNo: record?.containerNo ?? '',
                      operationId: record.id,
                      operationType: OperationType.Delivery,
                      amount: parseFloat(record.totalPrice) + parseFloat(record.specialCharges),
                      note: record.note,
                      cashStatus: CashStatus.Done,
                    },
                    record?.logisticCashId
                  );
                  await OutBoundPlanManager.edit(editValue, record.id);
                });
                await reloadTable();
              }
            },
          },
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
