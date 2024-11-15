import hillo from 'hillo';
import dayjs from 'dayjs';

const typeName = 'bolitaTask';

export async function getTaskList() {
  return (await hillo.jsonPost(typeName + '/list', {})).data.content;
}

export async function getTaskListByFilter(filter) {
  return (
    await hillo.jsonPost(typeName + '/list', {
      criteria: filter,
    })
  ).data.content;
}

export async function getTaskListByFilterWithPagination(filter, pagination) {
  return (
    await hillo.jsonPost(typeName + '/list', {
      ...pagination,
      criteria: filter,
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
  FBADeliveryCode: '',
  FCAddress: '',
  PO: '',
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
  UNNumber: '',
  recipient: '',
  phone: '',
  email: '',
  needReserve: '',
  industrialNote: '',
  POD: '',
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
  REF: '',
  bookingCarTime: '',
  mergedId: '',
  waitCar: '',
};
