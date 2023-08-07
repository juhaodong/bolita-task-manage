<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar
      v-if="finished"
      :default-value-model="filterObj"
      :form-fields="filters"
      @clear="updateFilter(null)"
      @submit="updateFilter"
    />
    <div class="my-2"></div>
    <BasicTable
      ref="actionRef"
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      v-model:checked-row-keys="checkedRows"
    >
      <template #tableTitle>
        <n-space>
          <n-button :disabled="checkedRows?.length != 1" @click="startEdit()"> 编辑 </n-button>
          <n-button>
            <template #icon>
              <n-icon>
                <Box20Filled />
              </n-icon>
            </template>
            转出库计划
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
      <new-notify-detail-form :model="currentModel" @saved="reloadTable" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { BasicTable } from '@/components/Table';
  import { columns, filters } from './columns';
  import { Box20Filled } from '@vicons/fluent';
  import NewNotifyDetailForm from '@/views/newViews/NotifyDetail/NewNotifyDetailForm.vue';
  import { NotifyDetailManager } from '@/api/dataLayer/modules/notify/notify-detail';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { $ref } from 'vue/macros';

  interface Prop {
    notifyId?: string;
  }

  const props = defineProps<Prop>();
  let finished = $ref(false);
  let currentModel: any | null = $ref(null);
  onMounted(() => {
    if (props.notifyId) {
      filterObj = { notifyId: props.notifyId };
    }
    finished = true;
  });

  const showModal = ref(false);
  let filterObj: any | null = $ref(null);

  async function startEdit() {
    const key = checkedRows[0];
    currentModel = await NotifyDetailManager.getById(key);
    console.log(currentModel);
    showModal.value = true;
  }

  const loadDataTable = async () => {
    return await NotifyDetailManager.load(filterObj);
  };

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  let checkedRows = $ref([]);
  const actionRef = ref();

  function reloadTable() {
    actionRef.value.reload();
    showModal.value = false;
    checkedRows = [];
  }
</script>

<style lang="less" scoped></style>
