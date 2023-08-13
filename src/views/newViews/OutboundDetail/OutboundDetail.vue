<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar
      v-if="finished"
      :form-fields="filters"
      :default-value-model="filterObj"
      @clear="updateFilter(null)"
      @submit="updateFilter"
    >
      <n-button :disabled="checkedRows.length == 0" @click="showCheck()">
        <template #icon>
          <n-icon>
            <Box20Filled />
          </n-icon>
        </template>
        审核
      </n-button>
    </filter-bar>
    <div class="my-2"></div>
    <BasicTable
      ref="actionRef"
      :action-column="actionColumn"
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      v-model:checked-row-keys="checkedRows"
    />

    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 1200px"
      title="编辑出库明细"
    >
      <new-outbound-detail :model="currentModel" @saved="reloadTable" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { Component, h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { CheckStatus, columns, filters } from './columns';
  import { Box20Filled } from '@vicons/fluent';
  import NewOutboundDetail from '@/views/newViews/OutboundDetail/NewOutboundDetail.vue';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { $ref } from 'vue/macros';
  import DocumentEdit16Filled from '@vicons/fluent/es/DocumentEdit16Filled';
  import { useCheckDialog } from '@/store/modules/checkDialogState';
  import { safeScope } from '@/api/dataLayer/common/GeneralModel';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import { OutBoundDetailManager } from '@/api/dataLayer/modules/OutBoundPlan/outboundDetail';

  interface Prop {
    outId?: string;
  }

  let finished = $ref(false);
  const props = defineProps<Prop>();
  onMounted(() => {
    if (props.outId) {
      filterObj = { outId: props.outId };
    }
    finished = true;
  });
  const showModal = ref(false);
  let checkedRows = $ref([]);
  let currentModel: any | null = $ref(null);

  async function startEdit(id) {
    currentModel = await OutBoundDetailManager.getById(id);
    showModal.value = true;
  }

  const checkDialog = useCheckDialog();

  async function showCheck() {
    const res = await checkDialog.check('请审核该明细');

    await safeScope(async () => {
      for (const id of checkedRows) {
        await OutBoundDetailManager.editInternal(
          {
            checkStatus: res.checkPassed ? CheckStatus.Checked : CheckStatus.NotPassed,
          },
          id
        );
      }
      checkedRows.length = 0;
      reloadTable();
    });
  }

  const loadDataTable = async () => {
    return await OutBoundDetailManager.load(filterObj);
  };

  function addTable() {
    showModal.value = true;
  }

  let filterObj: any | null = $ref(null);

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  const actionRef = ref();

  function reloadTable() {
    actionRef.value.reload();
    showModal.value = false;
  }

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 40,
    render(record: any) {
      const fileAction = (label, key, icon?: Component, editable = false) => {
        return getFileActionButton(
          label,
          key,
          OutBoundDetailManager,
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
import { OutBoundDetailManager } from '@/api/dataLayer/modules/OutBoundPlan/outBoundPlan';
