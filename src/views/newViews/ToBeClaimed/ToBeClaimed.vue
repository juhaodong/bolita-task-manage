<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar
      v-if="finished"
      :default-value-model="filterObj"
      :form-fields="filters"
      @clear="updateFilter(null)"
      @submit="updateFilter"
    >
      <n-button v-if="addBtn" type="primary" @click="showAdd">新建待认领</n-button>
      <n-button v-if="claimedBtn" type="warning" @click="startClaim">认领</n-button>
    </filter-bar>
    <div class="my-2"></div>
    <n-tabs v-model:value="selectedMonth" tab-style="min-width: 80px;" type="card">
      <n-tab-pane
        v-for="currentMonth in monthTab"
        :key="currentMonth"
        :name="currentMonth"
        :tab="currentMonth"
      >
        <BasicTable
          ref="actionRef"
          v-model:checked-row-keys="checkedRows"
          :action-column="actionColumn"
          :columns="columns"
          :request="loadDataTable"
          :row-key="(row) => row.id"
        />
      </n-tab-pane>
    </n-tabs>
    <n-modal
      v-model:show="showClaim"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="认领"
    >
      <claim-form @saved="reloadTable" />
    </n-modal>
    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="新建/编辑待认领"
    >
      <new-to-be-claimed-from :model="currentModel" @saved="reloadTable" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { computed, h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { ClaimManager, ClaimStatus, columns, filters } from './columns';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { $ref } from 'vue/macros';
  import DocumentEdit16Filled from '@vicons/fluent/es/DocumentEdit16Filled';
  import NewToBeClaimedFrom from '@/views/newViews/ToBeClaimed/form/NewToBeClaimedFrom.vue';
  import ClaimForm from '@/views/newViews/ToBeClaimed/form/ClaimForm.vue';
  import { usePermission } from '@/hooks/web/usePermission';
  import { useUserStore } from '@/store/modules/user';
  import { ToBeClaimedPower } from '@/api/dataLayer/common/PowerModel';
  import { OneYearMonthTab } from '@/api/dataLayer/common/MonthDatePick';
  import dayjs from 'dayjs';

  const { hasPermission } = usePermission();

  let selectedMonth: any | null = $ref('');
  let monthTab: any | null = $ref(null);

  interface Prop {
    outId?: string;
  }
  const AccountPowerList = computed(() => {
    return useUserStore()?.info?.powerList;
  });
  const addBtn = computed(() => {
    return AccountPowerList.value.includes(ToBeClaimedPower.Add);
  });
  const claimedBtn = computed(() => {
    return AccountPowerList.value.includes(ToBeClaimedPower.ClaimedGoodsBtn);
  });
  const editOperate = computed(() => {
    return AccountPowerList.value.includes(ToBeClaimedPower.Edit);
  });
  const claimedOperate = computed(() => {
    return AccountPowerList.value.includes(ToBeClaimedPower.ClaimedGoodsOperate);
  });

  let finished = $ref(false);
  const props = defineProps<Prop>();
  onMounted(() => {
    monthTab = OneYearMonthTab();
    selectedMonth = monthTab[0];
    if (props.outId) {
      filterObj = { outId: props.outId };
    }
    finished = true;
  });
  const showModal = ref(false);
  let showClaim = $ref(false);
  let checkedRows = $ref([]);
  let currentModel: any | null = $ref(null);

  async function startEdit(id) {
    currentModel = await ClaimManager.getById(id);
    showModal.value = true;
  }

  async function startClaim(id) {
    showClaim = true;
  }

  const loadDataTable = async () => {
    return (await ClaimManager.load(filterObj)).filter(
      (x) => dayjs(x.createTimestamp).format('YYYY-MM') === selectedMonth
    );
  };

  let filterObj: any | null = $ref(null);

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  function showAdd() {
    currentModel = null;
    showModal.value = true;
  }

  const actionRef = ref();

  async function reloadTable(value?) {
    if (value?.customerId) {
      await ClaimManager.massiveUpdate(
        checkedRows.map((it) => {
          return {
            id: it,
            customerId: value.customerId,
            claimStatus: ClaimStatus.Claimed,
          };
        })
      );
    }
    checkedRows.length = 0;
    actionRef.value[0].reload();
    showModal.value = false;

    showClaim = false;
  }

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 80,
    render(record: any) {
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '修改',
            icon: DocumentEdit16Filled,
            onClick() {
              startEdit(record.id);
            },
            ifShow: editOperate.value,
          },
          {
            label: '认领',
            ifShow() {
              return record.claimStatus == ClaimStatus.Waiting && claimedOperate.value;
            },
            onClick() {
              startClaim(record.id);
            },
          },
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
