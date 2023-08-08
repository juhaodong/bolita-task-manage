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
      :action-column="actionColumn"
      :row-key="(row) => row.id"
      v-model:checked-row-keys="checkedRows"
    >
      <template #tableTitle>
        <n-space>
          <n-button :disabled="checkedRows?.length == 0" @click="startEditStoreAddress()">
            批量设置库位
          </n-button>
          <n-button @click="transferToOutBoundPlan">
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
    <n-modal v-model:show="storeAddressDialog" :preset="'dialog'" title="请输入新的库位">
      <loading-frame :loading="loading">
        <n-input class="my-4" placeholder="请输入新的库位" v-model:value="storeAddress" />
        <n-button @click="realEditStoreAddress" type="primary"> 保存 </n-button>
      </loading-frame>
    </n-modal>
    <n-modal
      v-model:show="showOutBoundPlan"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 1200px"
      title="出库计划"
    >
      <new-outbound-plan @saved="reloadTable" />
    </n-modal>
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
  import { h, onMounted, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import { Box20Filled } from '@vicons/fluent';
  import NewNotifyDetailForm from '@/views/newViews/NotifyDetail/NewNotifyDetailForm.vue';
  import { NotifyDetailManager } from '@/api/dataLayer/modules/notify/notify-detail';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { $ref } from 'vue/macros';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import DocumentEdit16Filled from '@vicons/fluent/es/DocumentEdit16Filled';
  import { InBoundStatus } from '@/api/dataLayer/modules/notify/notify-api';
  import NewOutboundPlan from '@/views/newViews/OutboundPlan/NewOutboundPlan.vue';

  interface Prop {
    notifyId?: string;
  }

  const props = defineProps<Prop>();
  let finished = $ref(false);
  let currentModel: any | null = $ref(null);
  const showModal = ref(false);
  let filterObj: any | null = $ref(null);
  let loading: boolean = $ref(false);
  let checkedRows = $ref([]);
  let showOutBoundPlan = $ref(false);
  const actionRef = ref();

  let storeAddress: string = $ref('');
  let storeAddressDialog: boolean = $ref(false);

  onMounted(() => {
    if (props.notifyId) {
      filterObj = { notifyId: props.notifyId };
    }
    finished = true;
  });

  function transferToOutBoundPlan() {
    showOutBoundPlan = true;
  }

  async function startEdit(id) {
    currentModel = await NotifyDetailManager.getById(id);
    showModal.value = true;
  }

  const loadDataTable = async () => {
    return await NotifyDetailManager.load(filterObj);
  };

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }
  async function realEditStoreAddress() {
    loading = true;
    for (const it of checkedRows) {
      await NotifyDetailManager.edit({ storeAddress: storeAddress }, it);
    }
    storeAddressDialog = false;
    reloadTable();
    loading = false;
  }
  function startEditStoreAddress() {
    storeAddress = '';
    storeAddressDialog = true;
  }
  function reloadTable() {
    actionRef.value.reload();
    showModal.value = false;
    checkedRows = [];
  }
  const actionColumn = reactive({
    title: '操作',
    key: 'action',
    width: 60,
    render(record: any) {
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '修改',
            icon: DocumentEdit16Filled,
            ifShow() {
              return record.inStatus === InBoundStatus.Wait;
            },
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
