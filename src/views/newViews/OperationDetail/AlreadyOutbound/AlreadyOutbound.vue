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
  import { CarpoolManager } from '@/api/dataLayer/modules/logistic/carpool';

  const { hasPermission } = usePermission();

  const showModal = ref(false);
  let showShareCarModel = $ref(false);
  let checkedRows = $ref([]);
  const actionRef = ref();
  let filterObj: any | null = $ref(null);
  const loadDataTable = async () => {
    const res = (await OutBoundDetailManager.load(filterObj)).filter(
      (it) => it.outStatus === '已出库'
    );
    const carPool = await CarpoolManager.load();
    res.forEach((it) => {
      let carpoolInfo = carPool.find((x) => x.id === it.carpoolId);
      it.Ref = carpoolInfo?.REF ?? '';
      it.ISA = carpoolInfo?.ISA ?? '';
      it.customerAddress =
        carpoolInfo?.country + carpoolInfo?.postcode + carpoolInfo?.FBACode + carpoolInfo?.AMZID;
      it.outboundDate = carpoolInfo?.reservationGetProductTime ?? '';
      it.outboundTime = carpoolInfo?.reservationGetProductDetailTime ?? '';
      it.AMZID = carpoolInfo?.AMZID ?? '';
      it.Kunden = carpoolInfo?.contact ?? '';
    });
    console.log(carPool, 'carPool');
    console.log(res, 'res');
    return res;
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
          // {
          //   label: '订车',
          //   icon: Hammer,
          //   ifShow: () => {
          //     return record?.needCar === '1';
          //   },
          //   highlight: () => {
          //     return 'error';
          //   },
          //   onClick() {
          //     showShareCarModel = true;
          //   },
          // },
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
