import hillo from 'hillo';
import dayjs from 'dayjs';
import { checkPrice } from '@/api/dataLayer/common/common';
import { getQuery } from '@/api/newDataLayer/Common/Common';

const typeName = 'bolitaTask';

export async function getTaskList() {
  return (await hillo.jsonPost(typeName + '/list', {})).data.content;
}

export async function getTaskListByFilter(filter) {
  return (
    await hillo.jsonPost(typeName + '/searchOne', {
      criteria: filter,
    })
  ).data.rows;
}

export async function getTaskListByFilterWithPagination(filter, pagination) {
  return (
    await hillo.jsonPost(typeName + '/searchForFull' + getQuery(pagination), {
      ...filter,
    })
  ).data;
}

export async function getTaskListByIdsAndFilter(ids, filter) {
  return (
    await hillo.jsonPost(typeName + '/list', {
      criteria: [
        {
          field: 'id',
          op: 'in',
          value: ids,
        },
        ...filter,
      ],
    })
  ).data.content;
}

export async function getTaskListByNotifyId(id) {
  return (
    await hillo.jsonPost(typeName + '/list', {
      criteria: [
        {
          field: 'notifyId',
          op: '==',
          value: id,
        },
        {
          field: 'inStatus',
          op: '!=',
          value: '已拆分',
        },
        {
          field: 'inStatus',
          op: '!=',
          value: '已取消',
        },
      ],
    })
  ).data.content;
}

export async function getTaskListByOutboundId(id) {
  return (
    await hillo.jsonPost(typeName + '/list', {
      criteria: [
        {
          field: 'outboundId',
          op: '==',
          value: id,
        },
      ],
    })
  ).data.content;
}

export async function getTaskListById(id) {
  return (
    await hillo.jsonPost(typeName + '/list', {
      criteria: [
        {
          field: 'id',
          op: '==',
          value: id,
        },
      ],
    })
  ).data.content[0];
}

export async function getTaskListByIds(ids) {
  return (
    await hillo.jsonPost(typeName + '/list', {
      criteria: [
        {
          field: 'id',
          op: 'in',
          value: ids,
        },
      ],
    })
  ).data.content;
}

export async function addOrUpdateTask(item) {
  if (item.customer || item.inventory) {
    item.customerId = item.customer.id;
    item.inventoryId = item.inventory.id;
  }
  return await hillo.jsonPost(typeName + '/addOrUpdateWithRef', {
    ...item,
  });
}

export async function deleteTask(id) {
  return await hillo.jsonPost(typeName + '/deleteById/' + id, {});
}

export const defaultTask = {
  fbaDeliveryCode: '',
  fcAddress: '',
  po: '',
  arriveTime: '',
  arrivedContainerNum: 0,
  arrivedCount: 0,
  arrivedTrayNum: 0,
  cashStatus: '',
  changeOrderFiles: '',
  containerId: '',
  country: '',
  customerId: '',
  customerName: '',
  deliveryMethod: '',
  files: '',
  inHouseTime: '',
  inStatus: '',
  inStorageContainerNum: 0,
  inStorageTrayNum: 0,
  note: '',
  notifyId: '',
  notifyType: '',
  number: 0,
  operateInStorage: '',
  operationRequire: '',
  outboundMethod: '',
  outPrice: '',
  planArriveDateTime: dayjs().valueOf(),
  salesName: '',
  size: '',
  stayTime: '',
  storagePosition: '',
  timeLine: [],
  uploadFileTime: '',
  volume: 0.0,
  warehouseId: '',
  weight: 0.0,
  ticketId: '',
  trayNum: '',
  normalNote: '',
  postcode: '',
  operationNote: '',
  transportationNote: '',
  sign: '',
  packing: '',
  industrialTrayNum: '',
  productName: '',
  unNumber: '',
  recipient: '',
  phone: '',
  email: '',
  needReserve: '',
  industrialNote: '',
  pod: '',
  operationFiles: '',
  problemFiles: '',
  trayFiles: '',
  changeOrder: '',
  detailTray: '',
  trayType: '',
  alreadyChanged: 0,
  outboundId: '',
  needOfferPrice: '',
  waitPrice: '',
  suggestedPrice: '',
  costPrice: '',
  ref: '',
  bookingCarTime: '',
  mergedId: '',
  waitCar: '',
};

export async function searchTaskPrice(
  long,
  width,
  height,
  weight,
  country,
  outboundMethod,
  number,
  zipCode
) {
  let currentWeight = 0;
  if (long > 2.4 || width > 1.2 || height > 2.2 || weight > 1500) {
    return '人工询价';
  }
  const isGermany = country.toLowerCase() === 'de';
  const maxItems = isGermany ? 8 : 4;

  if (number > maxItems) {
    return '人工询价';
  }
  const densityFactor = isGermany ? 150 : 330;
  const volumeWeight = long * width * height * densityFactor;

  if (outboundMethod !== '大件托盘' && outboundMethod !== '标准托盘') {
    currentWeight = Math.max(volumeWeight, weight);
  } else {
    currentWeight = Math.max(volumeWeight, weight, densityFactor);
  }
  const res = await checkPrice(currentWeight, country, zipCode);
  return res.length > 0 ? res.map((it) => it.price).join(',') : '人工询价';
}
