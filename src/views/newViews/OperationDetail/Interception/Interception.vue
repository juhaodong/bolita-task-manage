<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar :form-fields="filters" @clear="updateFilter(null)" @submit="updateFilter" />
    <div class="my-2"></div>
    <BasicTable
      ref="actionRef"
      v-model:checked-row-keys="checkedRows"
      :actionColumn="actionColumn"
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
    />
    <n-modal
      v-model:show="showShareCarModel"
      :show-icon="false"
      preset="card"
      style="width: 90%; min-width: 600px; max-width: 600px"
      title="新建订车"
    >
      <new-carpool-management :merged-out-ids="checkedRows" @saved="saveShareCar" />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { Component, h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import { $ref } from 'vue/macros';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { usePermission } from '@/hooks/web/usePermission';
  import { OutBoundDetailManager } from '@/api/dataLayer/modules/OutBoundPlan/outboundDetail';
  import NewCarpoolManagement from '@/views/newViews/CarpoolManagement/dialog/NewCarpoolManagement.vue';
  import { getOutboundForecast } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';

  const { hasPermission } = usePermission();

  const showModal = ref(false);
  let showShareCarModel = $ref(false);
  let allOutboundForecastList = $ref([]);
  let checkedRows = $ref([]);
  const actionRef = ref();
  let filterObj: any | null = $ref(null);
  const loadDataTable = async () => {
    allOutboundForecastList = (await getOutboundForecast()).filter((it) => it.interception === 1);
    allOutboundForecastList.forEach((it) => {
      it.customerAddress = it?.country + it?.postcode + it?.FBACode + it?.AMZID;
    });
    return allOutboundForecastList;
  };
  function startShareCar() {
    console.log(checkedRows, 'check');
    showShareCarModel = true;
  }
  function reloadTable() {
    actionRef.value.reload();
    showModal.value = false;
    showShareCarModel = false;
  }

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
  }

  async function saveShareCar() {
    reloadTable();
    checkedRows = [];
  }

  const actionColumn = reactive({
    title: '可用动作',
    key: 'action',
    width: 120,
    render(record) {
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
            async onClick() {
              console.log(record, 'record');
            },
          },
        ],
      });
    },
  });

  function addTable() {
    showModal.value = true;
  }
</script>

<style lang="less" scoped></style>
