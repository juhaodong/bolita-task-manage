<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar
      v-if="finished"
      :form-fields="filters"
      :default-value-model="filterObj"
      @clear="updateFilter(null)"
      @submit="updateFilter"
    />
    <div class="my-2"></div>
    <BasicTable
      ref="actionRef"
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
    >
      <template #tableTitle>
        <n-space>
          <n-button @click="addTable()">
            <template #icon>
              <n-icon>
                <Box20Filled />
              </n-icon>
            </template>
            新建出库明细
          </n-button>
          <n-button @click="addTable()">
            <template #icon>
              <n-icon>
                <Box20Filled />
              </n-icon>
            </template>
            审核
          </n-button>
          <n-button @click="addTable()">
            <template #icon>
              <n-icon>
                <Box20Filled />
              </n-icon>
            </template>
            明细
          </n-button>
        </n-space>
      </template>
    </BasicTable>

    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 1200px"
      title="新建出库明细"
    >
      <new-outbound-detail />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { BasicTable } from '@/components/Table';
  import { columns, filters } from './columns';
  import { Box20Filled } from '@vicons/fluent';
  import NewOutboundDetail from '@/views/newViews/OutboundDetail/NewOutboundDetail.vue';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { OutBoundDetailManager } from '@/api/dataLayer/modules/OutBoundPlan/outBoundPlan';
  import { $ref } from 'vue/macros';

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
  const loadDataTable = async () => {
    const res = await OutBoundDetailManager.load(filterObj);
    console.log(res);
    return res;
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
</script>

<style lang="less" scoped></style>
import { OutBoundDetailManager } from '@/api/dataLayer/modules/OutBoundPlan/outBoundPlan';
