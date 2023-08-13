<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar
      v-if="finished"
      :default-value-model="filterObj"
      :form-fields="filters"
      @clear="updateFilter(null)"
      @submit="updateFilter"
    />
    <div class="my-2"></div>
    <BasicTable
      ref="actionRef"
      :actionColumn="actionColumn"
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      v-model:checked-row-keys="checkedRows"
    >
      <template #tableTitle>
        <n-space>
          <n-button :disabled="checkedRows.length == 0" @click="startShareCar()">
            <template #icon>
              <n-icon>
                <Box20Filled />
              </n-icon>
            </template>
            订车
          </n-button>
          <n-button :disabled="checkedRows.length == 0" @click="cancelCar()">
            <template #icon>
              <n-icon>
                <Box20Filled />
              </n-icon>
            </template>
            取消订车
          </n-button>
        </n-space>
      </template>
    </BasicTable>
    <n-modal
      v-model:show="showShareCarModel"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="新建订车"
    >
      <new-carpool-management @saved="saveShareCar" :merged-out-ids="checkedRows" />
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
      <new-logistics-details :model="currentModel" @saved="reloadTable" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { Component, h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import { Box20Filled } from '@vicons/fluent';
  import NewLogisticsDetails from '@/views/newViews/LogisticsDetails/form/LogisticForm.vue';
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

  interface Prop {
    carpoolId?: string;
  }

  const props = defineProps<Prop>();
  let finished = $ref(false);
  let currentModel: any | null = $ref(null);
  let showShareCarModel = $ref(false);
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
      const fileAction = (label, key, icon?: Component, editable = false) => {
        return getFileActionButton(
          label,
          key,
          OutBoundPlanManager,
          reloadTable,
          record,
          icon,
          editable
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
          fileAction('附件', 'files', undefined, false),
          fileAction('提单', 'pickupFiles'),
          fileAction('POD', 'PODFiles'),
          fileAction('客户账单', 'billsForCustomer', undefined, true),
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
