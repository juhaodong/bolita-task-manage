<template>
  <n-card :bordered="false" class="proCard">
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
          <n-button @click="addTable(NotifyType.Container)">
            <template #icon>
              <n-icon>
                <Box20Filled />
              </n-icon>
            </template>
            新增物流明细
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
      <new-logistics-details />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicTable } from '@/components/Table';
  import { columns } from './columns';
  import { Box20Filled } from '@vicons/fluent';
  import NewLogisticsDetails from '@/views/newViews/LogisticsDetails/NewLogisticsDetails.vue';

  const showModal = ref(false);

  function addTable() {
    showModal.value = true;
  }
</script>

<style lang="less" scoped></style>
