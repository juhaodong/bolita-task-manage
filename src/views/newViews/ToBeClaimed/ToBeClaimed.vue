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
            新建待认领
          </n-button>
          <n-button>
            <template #icon>
              <n-icon>
                <Box20Filled />
              </n-icon>
            </template>
            扫描
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
      style="width: 90%; min-width: 600px; max-width: 800px"
      title="新建待认领"
    >
      <new-to-be-claimed-from @submit="createClaim" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicTable } from '@/components/Table';
  import { columns, createNewClaim, filters, loadAllClaim } from './columns';
  import { Box20Filled } from '@vicons/fluent';
  import NewToBeClaimedFrom from '@/views/newViews/ToBeClaimed/NewToBeClaimedFrom.vue';
  import { handleRequest } from '@/store/utils/utils';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';

  const showModal = ref(false);

  async function createClaim(model) {
    const res = await createNewClaim(model);
    await handleRequest(res, () => {
      reloadTable();
      showModal.value = false;
    });
  }

  const actionRef = ref();
  function reloadTable() {
    actionRef.value.reload();
  }
  async function loadDataTable() {
    return await loadAllClaim();
  }

  function addTable() {
    showModal.value = true;
  }
</script>

<style lang="less" scoped></style>
