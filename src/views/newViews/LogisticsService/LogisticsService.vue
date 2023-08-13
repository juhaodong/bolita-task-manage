<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar
      v-if="finished"
      :form-fields="filters"
      :default-value-model="filterObj"
      @clear="updateFilter(null)"
      @submit="updateFilter"
    >
      <n-button @click="showAdd">新建物流售后</n-button>
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
      title="编辑售后信息"
    >
      <new-logistics-service :model="currentModel" @saved="reloadTable" />
    </n-modal>
    <n-modal
      v-model:show="showFeedBackDialog"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 1200px"
      title="编辑售后信息"
    >
      <service-feed-back :model="currentModel" @saved="reloadTable" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { Component, h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { $ref } from 'vue/macros';
  import DocumentEdit16Filled from '@vicons/fluent/es/DocumentEdit16Filled';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import NewLogisticsService from '@/views/newViews/LogisticsService/form/NewLogisticsService.vue';
  import { LogisticServiceManager } from '@/api/dataLayer/modules/logistic/logistcService';
  import ServiceFeedBack from '@/views/newViews/LogisticsService/form/ServiceFeedBack.vue';
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
  let showFeedBackDialog = $ref(false);

  async function startEdit(id) {
    currentModel = await LogisticServiceManager.getById(id);
    showModal.value = true;
  }

  async function startFeedBack(id) {
    currentModel = await LogisticServiceManager.getById(id);
    showFeedBackDialog = true;
  }

  const loadDataTable = async () => {
    return await LogisticServiceManager.load(filterObj);
  };

  let filterObj: any | null = $ref(null);

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  function showAdd() {
    showModal.value = true;
    currentModel = null;
  }
  const actionRef = ref();

  function reloadTable() {
    actionRef.value.reload();
    showModal.value = false;
    showFeedBackDialog = false;
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
          {
            label: '反馈',
            onClick() {
              startFeedBack(record.id);
            },
          },
          fileAction('附件', 'files'),
        ],
      });
    },
  });
</script>

<style lang="less" scoped></style>
