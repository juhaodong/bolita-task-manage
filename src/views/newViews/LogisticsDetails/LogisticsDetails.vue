<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar
      v-if="finished"
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
          <n-button :disabled="checkedRows.length == 0" @click="shareCar()">
            <template #icon>
              <n-icon>
                <Box20Filled />
              </n-icon>
            </template>
            拼车
          </n-button>
          <n-button :disabled="checkedRows.length == 0" @click="cancelCar()">
            <template #icon>
              <n-icon>
                <Box20Filled />
              </n-icon>
            </template>
            取消拼车
          </n-button>
        </n-space>
      </template>
    </BasicTable>

    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 1200px"
      title="新增物流明细"
    >
      <new-logistics-details :model="currentModel" @saved="reloadTable" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import { Box20Filled } from '@vicons/fluent';
  import NewLogisticsDetails from '@/views/newViews/LogisticsDetails/NewLogisticsDetails.vue';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { $ref } from 'vue/macros';
  import DocumentEdit16Filled from '@vicons/fluent/es/DocumentEdit16Filled';
  import { LogisticDetailManager } from '@/api/dataLayer/modules/logistic/logistic';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { CarpoolManager, carpoolSelfCheck } from '@/api/dataLayer/modules/logistic/carpool';

  interface Prop {
    carpoolId?: string;
  }

  const props = defineProps<Prop>();
  let finished = $ref(false);
  let currentModel: any | null = $ref(null);
  let checkedRows = $ref([]);
  onMounted(() => {
    if (props.carpoolId) {
      filterObj = { carpoolId: props.carpoolId };
    }
    finished = true;
  });

  const showModal = ref(false);

  function addTable() {
    showModal.value = true;
  }

  let filterObj: any | null = $ref(null);

  const loadDataTable = async () => {
    return await LogisticDetailManager.load(filterObj);
  };

  const actionRef = ref();

  async function startEdit(id) {
    currentModel = await LogisticDetailManager.getById(id);
    showModal.value = true;
  }

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  function reloadTable() {
    actionRef.value.reload();
    showModal.value = false;
  }

  async function shareCar() {
    await safeScope(async () => {
      const currentList: any[] = [];
      for (const checkedRow of checkedRows) {
        currentList.push(await LogisticDetailManager.getById(checkedRow));
      }
      const id = await CarpoolManager.addInternal({}, currentList);
      for (const checkedRow of checkedRows) {
        await LogisticDetailManager.editInternal({ carpoolId: id }, checkedRow);
      }

      reloadTable();
      checkedRows = [];
    });
  }

  async function cancelCar() {
    await safeScope(async () => {
      const currentList: any[] = [];
      for (const checkedRow of checkedRows) {
        currentList.push(await LogisticDetailManager.getById(checkedRow));
      }
      const affectIds = currentList.map((it) => it.carpoolId);
      for (const checkedRow of checkedRows) {
        await LogisticDetailManager.editInternal({ carpoolId: '' }, checkedRow);
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
    width: 60,
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
          },
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
