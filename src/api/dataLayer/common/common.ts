import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { getCustomerList } from '@/api/newDataLayer/Customer/Customer';
import { getInventoryList } from '@/api/newDataLayer/Warehouse/Warehouse';
import hillo from 'hillo';

export async function asyncCustomerByFilter(): Promise<FormField> {
  const customerList = await getCustomerList();
  const list = customerList.map((it) => ({
    label: it.customerName,
    value: it.customerName,
  }));
  return {
    key: 'customer.customerName',
    title: '客户',
    component: 'NSelect',
    componentProps: {
      options: list,
    },
  };
}

export async function asyncStorageByFilter(): Promise<FormField> {
  const storageList = await getInventoryList();
  const list = storageList.map((it) => ({
    label: it.name,
    value: it.name,
  }));
  return {
    key: 'inventory.name',
    title: '仓库',
    component: 'NSelect',
    componentProps: {
      options: list,
    },
  };
}

export const allInStatusNotifyList = [
  '等待审核',
  '等待卸柜',
  '等待入库',
  '部分操作',
  '入库待出库',
  '全部出库',
  '已取消',
  '已结算',
  '已拆分',
];

export const allInStatusOperationList = ['已完成', '已报价', '已订车', '待订车', '无需订车'];

export async function checkPrice(currentWeight, country, zipCode) {
  return (
    await hillo.jsonPost('price-kg-look-up-table/search', {
      maxFromWeightIncl: currentWeight,
      minToWeightExcl: currentWeight,
      country,
      leadingZipCode: zipCode,
    })
  ).data.rows;
}
