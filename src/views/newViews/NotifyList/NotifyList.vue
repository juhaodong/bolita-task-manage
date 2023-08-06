<template>
  <n-card :bordered="false" class="proCard">
    <div class="my-2"></div>
    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      @update:checked-row-keys="onCheckedRow"
      :scroll-x="1090"
    >
      <template #tableTitle>
        <n-space>
          <n-button @click="addTable(NotifyType.Container)">
            <template #icon>
              <n-icon>
                <Box20Filled />
              </n-icon>
            </template>
            新建货柜预报
          </n-button>
          <n-button @click="addTable(NotifyType.TrayOrBox)">
            <template #icon>
              <n-icon>
                <TruckDelivery />
              </n-icon>
            </template>
            新建散货/托盘预报
          </n-button>
        </n-space>
      </template>
    </BasicTable>

    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      preset="card"
      title="新建入库计划"
      style="width: 90%; min-width: 600px; max-width: 800px"
    >
      <notify-form-index @saved="closeAddDialog" :type="notifyType" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicTable } from '@/components/Table';
  import { columns, getActionColumn } from './columns';
  import { Box20Filled } from '@vicons/fluent';
  import { getNotifyList, NotifyType } from '@/views/newViews/NotifyList/api/notify-api';
  import NotifyFormIndex from '@/views/newViews/NotifyList/form/NotifyFormIndex.vue';
  import { $ref } from 'vue/macros';
  import { TruckDelivery } from '@vicons/tabler';

  let notifyType: NotifyType = $ref(NotifyType.Container);

  const actionRef = ref();

  const showModal = ref(false);

  function addTable(type: NotifyType) {
    notifyType = type;
    showModal.value = true;
  }

  const loadDataTable = async () => {
    return await getNotifyList();
  };

  function reloadTable() {
    actionRef.value.reload();
  }

  async function closeAddDialog() {
    reloadTable();
    showModal.value = false;
  }

  const actionColumn = getActionColumn(reloadTable);
</script>

<style lang="less" scoped></style>
