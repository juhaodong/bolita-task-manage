<template>
  <div>
    <n-card v-if="hasAuthPower('outMissionView')" :bordered="false" class="proCard">
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
    </n-card>
    <no-power-page v-else />
  </div>
</template>

<script lang="ts" setup>
  import { Component, h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import { Folder32Filled } from '@vicons/fluent';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import { $ref } from 'vue/macros';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { OutBoundDetailManager } from '@/api/dataLayer/modules/OutBoundPlan/outboundDetail';
  import { getOutboundForecast } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';
  import { hasAuthPower } from '@/api/dataLayer/common/power';
  import NoPowerPage from '@/views/newViews/Common/NoPowerPage.vue';

  const showModal = ref(false);
  let showShareCarModel = $ref(false);
  let allOutboundForecastList = $ref([]);
  let checkedRows = $ref([]);
  const actionRef = ref();
  let filterObj: any | null = $ref(null);
  const loadDataTable = async () => {
    allOutboundForecastList = (await getOutboundForecast())
      .filter((it) => !it.interception || it.interception !== 1)
      .filter((x) => x.outStatus === '已出库');
    allOutboundForecastList.forEach((it) => {
      it.customerAddress = it?.country + it?.postcode + it?.FBACode + it?.AMZID;
    });
    return allOutboundForecastList;
  };
  function reloadTable() {
    actionRef.value.reload();
    showModal.value = false;
    showShareCarModel = false;
  }

  function updateFilter(value) {
    filterObj = value;
    reloadTable();
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
          fileAction('提单文件', 'files', Folder32Filled),
          fileAction('POD', 'POD'),
          fileAction('操作文件', 'operationFiles'),
          fileAction('问题图片', 'problemFiles'),
        ],
      });
    },
  });

  function addTable() {
    showModal.value = true;
  }
</script>

<style lang="less" scoped></style>
