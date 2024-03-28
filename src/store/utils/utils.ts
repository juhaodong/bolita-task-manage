import { ResultEnum } from '@/store/enums/httpEnum';
import { sumBy } from 'lodash-es';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { getFBACodeList } from '@/api/dataLayer/fieldDefination/common';
import { CustomerManager, WarehouseManager } from '@/api/dataLayer/modules/user/user';
import { useUserStore } from '@/store/modules/user';

export function generateOptionFromArray(arr?: any[]) {
  return (
    arr?.map((it) => ({
      label: it,
      value: it,
    })) ?? []
  );
}

export async function asyncFBACode(): Promise<FormField> {
  const FBACodeList = await getFBACodeList();
  const list = FBACodeList.map((it) => ({
    label: it,
    value: it,
  }));
  return {
    field: 'FBACode',
    label: 'FBACode',
    component: 'NSelect',
    componentProps: {
      options: list,
    },
    required: false,
  };
}

export async function asyncWarehouseList(): Promise<FormField> {
  const userStore = useUserStore();
  const customerId = userStore.info?.belongsToId ?? '';
  const currentCustomer = (await CustomerManager.load()).find((it) => it.id === customerId) ?? '';
  console.log(currentCustomer, 'currentCustomer');
  const warehouseList = await WarehouseManager.load();
  const list = warehouseList.map((it) => ({
    label: it.id,
    value: it.id,
  }));
  return {
    field: 'warehouseId',
    label: '仓库',
    component: 'NSelect',
    componentProps: {
      options: list,
    },
    defaultValue: currentCustomer.warehouseId ?? '',
  };
}

export async function asyncFCAddress(): Promise<FormField> {
  const FBACodeList = await getFBACodeList();
  const list = FBACodeList.map((it) => ({
    label: it,
    value: it,
  }));
  return {
    field: 'FCAddress',
    label: 'FC/送货地址',
    component: 'NSelect',
    componentProps: {
      options: list,
    },
  };
}

export async function asyncCustomer(): Promise<FormField> {
  const customerList = await CustomerManager.load();
  const list = customerList.map((it) => ({
    label: it.customerName,
    value: it.customerName,
  }));
  return {
    field: 'customerName',
    label: '客户',
    component: 'NSelect',
    componentProps: {
      options: list,
    },
  };
}

export async function asyncCustomerId(): Promise<FormField> {
  const customerList = await CustomerManager.load();
  const list = customerList.map((it) => ({
    label: it.customerName,
    value: it.customerId,
  }));
  return {
    field: 'customerId',
    label: '客户',
    component: 'NSelect',
    componentProps: {
      options: list,
    },
  };
}

export function toastError(message: string) {
  const $message = window['$message'];
  $message.error(message);
}
export function toastSuccess(message: string) {
  const $message = window['$message'];
  $message.success(message);
}

export function showErrorDialog(message: string) {
  const $dialog = window['$dialog'];
  $dialog.info({
    title: '出问题了！',
    content: message,
    positiveText: '确定',
    //negativeText: '取消',
    closable: false,
    maskClosable: false,
    onPositiveClick: () => {},
    onNegativeClick: () => {},
  });
}

export async function handleRequest(res, action) {
  if (res.code == ResultEnum.SUCCESS) {
    return await action(res.result);
  } else {
    toastError(res.message);
  }
}

export function getFileNameAndTypeForFirebaseLink(firebaseLink: string) {
  const res = firebaseLink.split('?')[0];
  const name = res.split('%2F').pop();
  return {
    name: name,
    type: '',
  };
}

export function safeParseInt(string: string | null) {
  return parseInt(string ?? 0) || 0;
}

export function safeParseFloat(string: string | null) {
  return parseFloat(string ?? 0) || 0;
}

export function safeSumBy(arr, key) {
  return sumBy(arr, (item: any) => {
    return safeParseFloat(item[key]);
  });
}

export function safeSumInt(arr, key) {
  return sumBy(arr, (item: any) => {
    return safeParseInt(item[key]);
  });
}
