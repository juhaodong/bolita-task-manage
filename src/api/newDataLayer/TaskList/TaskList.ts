import hillo from 'hillo';
import dayjs from 'dayjs';
import { checkPrice } from '@/api/dataLayer/common/common';
import { getQuery } from '@/api/newDataLayer/Common/Common';
import { toastError } from '@/store/utils/utils';

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

export async function getTaskListBySourceId(id) {
  return (
    await hillo.jsonPost(typeName + '/search', {
      sourceId: id,
    })
  ).data.rows;
}

export async function getTaskListByFilterWithPagination(filter, pagination) {
  return (
    await hillo.jsonPost(
      typeName + '/searchForFull' + getQuery(pagination) + '&orderCodes=createTimestamp desc',
      {
        ...filter,
      }
    )
  ).data;
}

export async function getTaskListByFilterAndSort(filter, sort) {
  return (
    await hillo.jsonPost(typeName + '/searchForFull' + '?&orderCodes=' + sort, {
      criteria: filter,
    })
  ).data.rows;
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
    await hillo.jsonPost(typeName + '/searchForFull?pageNumber=0&pageSize=100', {
      inStatusNotIn: ['已取消', '已拆分'],
      notifyId: id,
    })
  ).data.rows;
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
    await hillo.jsonPost(typeName + '/searchOne', {
      id,
    })
  ).data;
}
export async function getTaskListByIds(ids) {
  return (
    await hillo.jsonPost(typeName + '/searchForFull', {
      idIn: ids,
    })
  ).data.rows;
}

export async function getTaskGroupByNotifyId(id) {
  return (
    await hillo.jsonPost(typeName + '/getGroupedTask', {
      inStatusNotIn: ['已取消', '已拆分'],
      notifyId: id,
    })
  ).data;
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

export async function updateTask(item) {
  if (item.customer || item.inventory) {
    item.customerId = item.customer.id;
    item.inventoryId = item.inventory.id;
  }
  if (item.notify) {
    item.notifyId = item.notify.id;
  }
  return await hillo.jsonPost(typeName + '/updateWithRef', {
    ...item,
  });
}

export async function addTask(item) {
  if (item.customer || item.inventory) {
    item.customerId = item.customer.id;
    item.inventoryId = item.inventory.id;
  }
  return await hillo.jsonPost(typeName + '/addWithRef', {
    ...item,
  });
}

export async function deleteTask(ids) {
  return await hillo.jsonPost(typeName + '/deleteBySpec', {
    idIn: ids,
  });
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
  planArriveDateTime: dayjs().format('YYYY-MM-DDT00:00:00'),
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
  tailgate: '',
};

export async function searchTaskPrice(
  size,
  weight,
  country,
  outboundMethod,
  number,
  zipCode,
  deliveryMethod
) {
  if (deliveryMethod !== 'DHL') {
    toastError(deliveryMethod !== 'DHL');
    return '人工询价';
  }
  const sizeFormat = /^\d*\.?\d+\*\d*\.?\d+\*\d*\.?\d+$/.test(size);
  if (!sizeFormat) {
    toastError('size不符合标准!');
    return '人工询价';
  }
  if (!zipCode) {
    toastError('zipCode不符合标准!');
    return '人工询价';
  }
  const [long, width, height] = size.split('*');
  // Convert dimensions from cm to m
  const longInMeters = long / 100;
  const widthInMeters = width / 100;
  const heightInMeters = height / 100;
  let currentWeight = 0;
  if (longInMeters > 2.4 || widthInMeters > 1.2 || heightInMeters > 2.2 || weight > 1500) {
    toastError('尺寸无法计算或者重量超重!');
    return '人工询价';
  }
  const isGermany = country.toLowerCase() === 'de';
  const maxItems = isGermany ? 8 : 4;

  if (number > maxItems) {
    toastError('数量太大!');
    return '人工询价';
  }
  const densityFactor = isGermany ? 150 : 330;
  const volumeWeight = longInMeters * widthInMeters * heightInMeters * densityFactor;

  if (outboundMethod !== '大件托盘' && outboundMethod !== '标准托盘') {
    currentWeight = Math.max(volumeWeight, weight);
  } else {
    currentWeight = Math.max(volumeWeight, weight, densityFactor);
  }
  const res = await checkPrice(currentWeight, country, zipCode);
  return res.length > 0 ? res.map((it) => it.price).join(',') : '人工询价';
}

export const errorStatus = ['存仓', '入库待出库'];
