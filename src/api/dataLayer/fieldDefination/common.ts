import { deliveryMethod } from '@/api/dataLayer/modules/deliveryMethod';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { usePermission } from '@/hooks/web/usePermission';
import dayjs from 'dayjs';
import {
  CustomerManager,
  FBACodeManager,
  WarehouseManager,
} from '@/api/dataLayer/modules/user/user';
import { keyBy } from 'lodash-es';
import { storage } from '@/store/utils/Storage';
import { CUSTOMER_ID } from '@/store/mutation-types';
import { useUserStore } from '@/store/modules/user';
import { generateOptionFromArray } from '@/store/utils/utils';
import { getUserList } from '@/api/newDataLayer/User/User';
import { getInventoryList } from '@/api/newDataLayer/Warehouse/Warehouse';

export function getFilesUploadFormField(
  key = 'files',
  required = true,
  uploadTemplate: any = null
): FormField {
  return {
    field: key,
    label: '附件',
    component: 'NUpload',
    componentProps: {
      multiple: true,
      uploadTemplate,
    },
    required: required,
  };
}

export function getCheckFormField(): FormField[] {
  return [
    { field: 'note', label: '备注', required: false },
    getFilesUploadFormField('files', false),
  ];
}

export function getDeliveryMethodSelection(dm = deliveryMethod): FormField[] {
  return [
    {
      field: 'deliveryMethod',
      label: '出库方式',
      component: 'NSelect',
      required: false,
      defaultValue: '',
      componentProps: {
        options: generateOptionFromArray(dm),
      },
    },
  ];
}

export async function asyncCustomerFormField(): Promise<FormField> {
  const { isCustomer } = usePermission();
  const customers = await CustomerManager.load();
  const customerDict = keyBy(customers, 'id');
  const customerList = customers.map((it) => ({
    label: it.customerName,
    value: it.id,
  }));
  return {
    field: 'customerId',
    label: '客户',
    component: 'NSelect',
    componentProps: {
      options: customerList,
    },
    defaultValue: isCustomer() ? storage.get(CUSTOMER_ID) : null,
    disableCondition() {
      return isCustomer();
    },
    onFormUpdate(value) {
      if (value?.customerId) {
        value['warehouseId'] = customerDict[value?.customerId]?.warehouseId;
      }
    },
  };
}

export async function asyncCustomerWarehouseFormField(multiple): Promise<FormField> {
  const warehouseList = await getInventoryList();
  const warehouseIdList = warehouseList.map((it) => ({
    label: it.name,
    value: it.id,
  }));
  return {
    field: 'inventoryId',
    label: '仓库',
    component: 'NSelect',
    componentProps: {
      options: warehouseIdList,
      multiple: multiple,
    },
    required: false,
  };
}

export async function asyncSalesManFormField(): Promise<FormField> {
  const salesManList = (await getUserList()).filter((it) => it.userType === '运营部前端');
  console.log(salesManList, 'list');
  const salesManIdList = salesManList.map((it) => ({
    label: it.realName,
    value: it.id,
  }));
  return {
    field: 'belongSalesId',
    label: '业务员',
    component: 'NSelect',
    componentProps: {
      options: salesManIdList,
    },
  };
}

export const deliveryMethodSelection: FormField[] = getDeliveryMethodSelection();

export function formFieldBuilder() {
  const fieldForm: FormField[] = [];
  let group = '基本信息';
  const add = (field: FormField) => {
    field.group = group;
    fieldForm.push(field);
  };
  const addAll = (fields: FormField[]) => {
    fields.forEach(add);
  };
  const setGroup = (newGroup: string) => {
    group = newGroup;
  };
  const build = () => {
    return fieldForm;
  };

  const toColumn = () => {
    return fieldForm.map((it) => ({
      render: it.render,
      title: it.label,
      key: it.field,
      meta: it.meta,
    }));
  };

  return {
    add,
    addAll,
    build,
    setGroup,
    toColumn,
  };
}
export function getDatePickerFormField(key = 'date', title = '日期', powerList = []): FormField {
  return {
    field: key,
    component: 'NDatePicker',
    disableCondition() {
      const AccountPowerList = useUserStore()?.info?.powerList;
      if (powerList.length < 1) {
        return false;
      } else {
        return !AccountPowerList.includes(powerList);
      }
    },
    label: title,
    defaultValue: dayjs().valueOf(),
    componentProps: {
      type: 'date',
      clearable: true,
    },
  };
}

export const salesFormField = {
  field: 'salesName',
  label: '业务员',
  required: false,
};
export const noteFormField = {
  field: 'note',
  label: '备注',
  required: false,
};

export async function getFBACodeList() {
  return (await FBACodeManager.load()).map((it) => it.code);
}

export async function getStorageList() {
  return (await WarehouseManager.load()).map((it) => it.id);
}
