<template>
  <n-card :bordered="false" class="proCard">
    <filter-bar :form-fields="filters" @clear="updateFilter(null)" @submit="updateFilter">
      <n-button :disabled="checkedRows.length == 0" type="warning" @click="confirmOutbound()">
        确认出库
      </n-button>
    </filter-bar>
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
      v-model:show="showOutboundOrderDetail"
      :show-icon="false"
      preset="dialog"
      style="width: 90%; min-width: 600px; max-width: 800px"
      title="出库单"
    >
      <outbound-order
        :amz-id="AMZID"
        :data="currentData"
        :delivery-method="currentDeliveryMethod"
        :fba-code="FBACode"
        :pick-date="pickDate"
        :ref-code="RefCode"
        @saved="closeDetail"
      />
    </n-modal>
    <n-modal
      v-model:show="showOutboundChange"
      :show-icon="false"
      preset="dialog"
      style="width: 90%; min-width: 600px; max-width: 800px"
      title="出库单"
    >
      <change-forecast
        :id="currentId"
        :amz-id="AMZID"
        :change-note="changeNote"
        :isa="ISACode"
        :operator="operator"
        :pick-date="pickDate"
        :pick-time="pickTime"
        :ref-code="RefCode"
        @saved="closeChange"
      />
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { Component, h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns, filters } from './columns';
  import { Folder32Filled } from '@vicons/fluent';
  import { getFileActionButton } from '@/views/bolita-views/composable/useableColumns';
  import { $ref } from 'vue/macros';
  import FilterBar from '@/views/bolita-views/composable/FilterBar.vue';
  import { usePermission } from '@/hooks/web/usePermission';
  import { OutBoundDetailManager } from '@/api/dataLayer/modules/OutBoundPlan/outboundDetail';
  import { toastSuccess } from '@/store/utils/utils';
  import { NotifyManager } from '@/api/dataLayer/modules/notify/notify-api';
  import {
    getOutboundForecast,
    updateOutboundForecast,
  } from '@/api/dataLayer/modules/OutboundForecast/OutboundForecast';
  import OutboundOrder from '@/views/newViews/OutboundForecast/OutboundOrder.vue';
  import dayjs from 'dayjs';
  import ChangeForecast from '@/views/newViews/OutboundForecast/ChangeForecast.vue';

  const { hasPermission } = usePermission();

  const showModal = ref(false);
  let allOutboundForecastList = $ref([]);
  let currentData = $ref('');
  let RefCode = $ref('');
  let FBACode = $ref('');
  let pickDate = $ref('');
  let pickTime = $ref('');
  let AMZID = $ref('');
  let currentId = $ref('');
  let ISACode = $ref('');
  let changeNote = $ref('');
  let operator = $ref('');
  let currentDeliveryMethod = $ref('');
  let showOutboundOrderDetail = $ref(false);
  let showOutboundChange = $ref(false);
  let checkedRows = $ref([]);
  const actionRef = ref();
  let filterObj: any | null = $ref(null);
  const loadDataTable = async () => {
    allOutboundForecastList = (await getOutboundForecast())
      .filter((it) => !it.interception || it.interception !== 1)
      .filter((x) => x.outStatus !== '已出库');
    allOutboundForecastList.forEach((it) => {
      it.customerAddress = it?.country + it?.postcode + it?.FBACode + it?.AMZID;
    });
    return allOutboundForecastList;
  };
  async function confirmOutbound() {
    for (const item of checkedRows) {
      console.log(item, 'item');
      await updateOutboundForecast(item, { outStatus: '已出库' });
    }
    toastSuccess('success');
    reloadTable();
  }

  async function checkOutboundOrder(id) {
    const res = allOutboundForecastList.find((it) => it.id === id);
    currentData = res.outboundDetailInfo;
    currentDeliveryMethod = res.deliveryDetail;
    AMZID = res.AMZID;
    pickDate = dayjs(res.reservationGetProductTime).format('YYYY-MM-DD');
    FBACode = res.FBACode;
    RefCode = res.REF;
    showOutboundOrderDetail = true;
  }

  async function changeForecastOrder(id) {
    const res = allOutboundForecastList.find((it) => it.id === id);
    currentId = id;
    AMZID = res.AMZID;
    pickDate = dayjs(res.reservationGetProductTime).format('YYYY-MM-DD');
    pickTime = res.reservationGetProductDetailTime;
    RefCode = res.REF;
    pickTime = res.reservationGetProductDetailTime;
    ISACode = res.ISA;
    operator = res.changeOperator ?? '';
    changeNote = res.changeNote ?? '';
    showOutboundChange = true;
  }

  async function closeDetail() {
    showOutboundOrderDetail = false;
    await loadDataTable();
  }

  async function closeChange() {
    showOutboundChange = false;
    await loadDataTable();
  }

  async function startEdit(id) {
    currentModel = await NotifyManager.getById(id);
    showModal.value = true;
  }
  function reloadTable() {
    actionRef.value.reload();
    showModal.value = false;
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
          fileAction('CMR', 'CMRFilesOut'),
          {
            label: '出库单',
            onClick() {
              checkOutboundOrder(record.id);
            },
          },
          {
            label: '变更',
            onClick() {
              changeForecastOrder(record.id);
            },
          },
          {
            label: '截停',
            async onClick() {
              await updateOutboundForecast(record.id, { interception: 1 });
              await loadDataTable();
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
