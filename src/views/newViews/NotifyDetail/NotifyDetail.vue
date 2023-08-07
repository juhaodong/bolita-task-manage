<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar :form-fields="filters" @clear="updateFilter(null)" @submit="updateFilter" />
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
            新建入库明细
          </n-button>
          <n-button>
            <template #icon>
              <n-icon>
                <Box20Filled />
              </n-icon>
            </template>
            转出库计划
          </n-button>
          <n-button>
            <template #icon>
              <n-icon>
                <Box20Filled />
              </n-icon>
            </template>
            查询
          </n-button>
        </n-space>
      </template>
    </BasicTable>

    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 1200px"
      title="入库明细"
    >
      <new-notify-detail-form />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicTable } from '@/components/Table';
  import { columns, filters } from './columns';
  import { Box20Filled } from '@vicons/fluent';
  import NewNotifyDetailForm from '@/views/newViews/NotifyDetail/NewNotifyDetailForm.vue';
  import { getNotifyDetailList } from '@/views/newViews/NotifyList/api/notify-detail';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';

  const showModal = ref(false);

  function addTable() {
    showModal.value = true;
  }

  const loadDataTable = async () => {
    return await getNotifyDetailList();
  };

  function reloadTable() {
    actionRef.value.reload();
  }
</script>

<style lang="less" scoped></style>
