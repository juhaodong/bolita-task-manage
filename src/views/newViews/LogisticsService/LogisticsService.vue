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
      :scroll-x="3000"
      @update:checked-row-keys="onCheckedRow"
    >
      <template #tableTitle>
        <n-space>
          <n-button @click="addTable()">
            <template #icon>
              <n-icon>
                <Box20Filled />
              </n-icon>
            </template>
            新建物流售后
          </n-button>
          <n-button>
            <template #icon>
              <n-icon>
                <Box20Filled />
              </n-icon>
            </template>
            下载指导文件
          </n-button>
        </n-space>
      </template>
    </BasicTable>

    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 1200px"
      title="新建物流售后"
    >
      <new-logistics-service />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicTable } from '@/components/Table';
  import { columns, filters } from './columns';
  import { Box20Filled } from '@vicons/fluent';
  import NewLogisticsService from '@/views/newViews/LogisticsService/NewLogisticsService.vue';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';

  const showModal = ref(false);

  function addTable() {
    showModal.value = true;
  }
</script>

<style lang="less" scoped></style>
