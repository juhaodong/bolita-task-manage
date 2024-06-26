<script lang="ts" setup>
  import {
    InBoundDetailStatus,
    NotifyManager,
    NotifyType,
  } from '@/api/dataLayer/modules/notify/notify-api';
  import LoadingFrame from '@/views/bolita-views/composable/LoadingFrame.vue';
  import { getNeededColumnByNotifyType } from '@/api/dataLayer/modules/notify/NotifyRepository';
  import NewContainerForecast from '@/views/newViews/ContainerForecast/form/NewContainerForecast.vue';
  import { handleRequest } from '@/store/utils/utils';
  import { useUserStore } from '@/store/modules/user';
  import readXlsxFile from 'read-excel-file';
  import { CustomerManager, FBACodeManager } from '@/api/dataLayer/modules/user/user';
  import { difference } from 'lodash-es';
  import { allDeliveryList, allKeysList } from '@/api/dataLayer/common/AllKeys';
  import { $ref } from 'vue/macros';
  import ErrorMessageDialog from '@/views/newViews/ContainerForecast/form/ErrorMessageDialog.vue';
  import dayjs from 'dayjs';

  interface Prop {
    currentModel?: any;
    type: NotifyType;
  }

  const prop = defineProps<Prop>();
  const emit = defineEmits(['saved']);
  let loading: boolean = $ref(false);
  let defaultValue = {
    customerName: '',
    containerNo: '',
    warehouseId: '',
    planArriveDateTime: dayjs().valueOf(),
    inHouseTime: '',
    note: '',
  };

  function startLoading() {
    loading = true;
  }

  function stop() {
    loading = false;
  }

  let errorMessage = $ref([]);

  async function readFile(file, notifyType) {
    if (!file) {
      return [];
    }
    const schema = Object.fromEntries(
      getNeededColumnByNotifyType(notifyType).map((it) => {
        return [it.title, { prop: it.key }];
      })
    );
    const allFBACodeList = await FBACodeManager.load();
    try {
      let { rows, errors } = await readXlsxFile(file, { schema });
      rows = rows.slice(2);
      rows.forEach((it, index) => {
        const keys = Object.keys(it);
        const res = difference(
          allKeysList.map((x) => x.field),
          keys
        );
        it.uploadFileTime = dayjs().format('YYYY-MM-DD');
        if (it.outboundMethod !== '存仓') {
          if (it.outboundMethod === '散货') {
            if (it.deliveryMethod === 'FBA卡车派送') {
              if (!it.FBADeliveryCode) {
                errorMessage.push({ index: index + 4, detail: 'FBA单号' });
              }
              if (!it.PO) {
                errorMessage.push({ index: index + 4, detail: 'PO' });
              }
            }
            if (!allDeliveryList.includes(it.deliveryMethod) && !it.FCAddress) {
              errorMessage.push({ index: index + 4, detail: 'FC/送货地址' });
            }
          }
          if (it.deliveryMethod === 'FBA卡车派送') {
            if (!it.FCAddress) {
              errorMessage.push({ index: index + 4, detail: 'FC/送货地址' });
            }
            if (!it.postcode) {
              const currentFBACode = allFBACodeList.find((b) => b.code === it.FCAddress);
              if (!currentFBACode) {
                errorMessage.push({ index: index + 4, detail: 'FC/送货地址' });
              } else {
                it.postcode = currentFBACode.postcode;
              }
            }
          }
        }
        if (it.changeOrderFiles === '是') {
          it.inStatus = InBoundDetailStatus.WaitSubmit;
          it.operateInStorage = '是';
        } else {
          it.inStatus = InBoundDetailStatus.WaitCheck;
        }
        if (res.length > 0) {
          const realMessageDetail = [];
          res.forEach((it) => {
            const detailInfo = allKeysList.find((x) => x.field === it).label;
            realMessageDetail.push(detailInfo);
          });
          errorMessage.push({ index: index + 4, detail: realMessageDetail });
        }
      });
      // if (errorMessage.length > 0) {
      //   errorMessage = uniqBy(errorMessage, (x) => {
      //     `${x.index} + ${x.detail}`;
      //   });
      //   return [];
      // }
      if (rows.length > 0 && errors.length == 0) {
        rows.slice(2);
        return rows.map((it) => ({ ...it, arrivedCount: 0 }));
      }
    } catch (e: any) {
      console.log(e?.message);
    }
    return [];
  }

  function closeDialog() {
    errorMessage = [];
  }

  async function saveNotify(value: any) {
    defaultValue = value;
    startLoading();
    const userStore = useUserStore();
    const customerList = await CustomerManager.load();
    const currentCustomer = customerList.find((it) => it.id === value.customerId) ?? '';
    value.customerId = customerList.find((it) => it.customerName === value.customerName).id ?? '';
    value.notifyType = prop.type;
    value.salesName = currentCustomer.belongSalesMan ?? userStore.info?.userName;
    let taskList = [
      ...(await readFile(value.files?.[0].file, value.notifyType)),
      ...(value?.trayTaskList ?? []),
    ];
    delete value.uploadFile;
    if (errorMessage.length === 0) {
      const res = await NotifyManager.add(value, taskList);
      await handleRequest(res, async () => {
        emit('saved');
      });
    } else {
      // emit('saved');
    }
    stop();
  }
</script>

<template>
  <loading-frame :loading="loading">
    <template v-if="errorMessage.length === 0">
      <new-container-forecast
        :default-value="defaultValue"
        :model="currentModel"
        @closed="closeDialog"
        @submit="saveNotify"
      />
    </template>
    <template v-else>
      <error-message-dialog :error-message="errorMessage" @closed="closeDialog" />
    </template>
    <!--    <template v-else-if="type == NotifyType.TrayOrBox">-->
    <!--      <notify-tray-form :model="currentModel" @submit="saveNotify" />-->
    <!--    </template>-->
  </loading-frame>
</template>

<style lang="less" scoped></style>
