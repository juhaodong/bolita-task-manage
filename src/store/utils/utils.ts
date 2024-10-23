import { ResultEnum } from '@/store/enums/httpEnum';
import { sumBy } from 'lodash-es';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { CustomerManager } from '@/api/dataLayer/modules/user/user';
import { useUserStore } from '@/store/modules/user';
import {
  getCustomerById,
  getCustomerList,
  getCustomerListByIds,
} from '@/api/newDataLayer/Customer/Customer';
import { getInventoryList } from '@/api/newDataLayer/Warehouse/Warehouse';
import { getFBACodeList } from '@/api/newDataLayer/FBACode/FBACode';

export function generateOptionFromArray(arr?: any[]) {
  return (
    arr?.map((it) => ({
      label: it,
      value: it,
    })) ?? []
  );
}

export function generateOptionFromTimeArray(arr?: any[]) {
  return (
    arr?.map((it) => ({
      label: it.start,
      value: it.start,
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

export async function asyncWarehouseList(defaultValue): Promise<FormField> {
  const userStore = useUserStore();
  let customerId = '';
  customerId = userStore.info?.customerIds.split(',')[0] ?? '';
  const currentCustomer = (await getCustomerById(customerId)) ?? '';
  const warehouseList = await getInventoryList();
  const list = warehouseList.map((it) => ({
    label: it.name,
    value: it.id,
  }));
  console.log(list, 'list');
  return {
    field: 'inventoryId',
    label: '仓库',
    component: 'NSelect',
    componentProps: {
      options: list,
    },
    defaultValue: defaultValue !== '' ? defaultValue : currentCustomer?.inventory?.id ?? '',
  };
}

export async function asyncFCAddress(): Promise<FormField> {
  const FBACodeList = await getFBACodeList();
  const list = FBACodeList.map((it) => ({
    label: it.code,
    value: it.id,
  }));
  return {
    field: 'fcaddress',
    label: 'FC/送货地址',
    component: 'NSelect',
    componentProps: {
      options: list,
      multiple: true,
    },
  };
}

export async function asyncStorage(): Promise<FormField> {
  const storageList = await getInventoryList();
  const list = storageList.map((it) => ({
    label: it.name,
    value: it.id,
  }));
  return {
    field: 'inventory.id',
    label: '仓库',
    component: 'NSelect',
    componentProps: {
      options: list,
    },
  };
}

export async function asyncUserCustomer(defaultValue): Promise<FormField> {
  const userStore = useUserStore();
  const idArray = userStore.info.customerIds.split(',');
  const customerList = await getCustomerListByIds(idArray);
  console.log(
    userStore.info.customerIds,
    await getCustomerListByIds(userStore.info.customerIds),
    '321'
  );
  const list = customerList.map((it) => ({
    label: it.customerName,
    value: it.id,
  }));
  if (userStore.info?.userType === '客户') {
    return {
      field: 'customerId',
      label: '客户',
      required: false,
      component: 'NSelect',
      componentProps: {
        options: list,
      },
      defaultValue: defaultValue !== '' ? defaultValue : customerList[0].id,
      disableCondition: () => {
        return true;
      },
    };
  } else {
    return {
      field: 'customerId',
      label: '客户',
      required: false,
      component: 'NSelect',
      componentProps: {
        options: list,
      },
      defaultValue: defaultValue !== '' ? defaultValue : customerList[0].id,
    };
  }
}

export async function asyncCustomer(): Promise<FormField> {
  const customerList = await getCustomerList();
  const list = customerList.map((it) => ({
    label: it.customerName,
    value: it.id,
  }));
  return {
    field: 'customer',
    label: '客户',
    required: false,
    component: 'NSelect',
    componentProps: {
      options: list,
    },
  };
}

export async function asyncMultipleCustomer(): Promise<FormField> {
  const customerList = await getCustomerList();
  const list = customerList.map((it) => ({
    label: it.customerName,
    value: it.id,
  }));
  list.unshift({ label: '全部', value: 'all' });
  return {
    field: 'customerIds',
    label: '客户',
    component: 'NSelect',
    required: false,
    componentProps: {
      multiple: true,
      options: list,
    },
  };
}

export async function asyncCustomerId(): Promise<FormField> {
  const customerList = await CustomerManager.load();
  const list = customerList.map((it) => ({
    label: it.id,
    value: it.id,
  }));
  return {
    field: 'customerId',
    label: '客户',
    component: 'NSelect',
    componentProps: {
      multiple: true,
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
