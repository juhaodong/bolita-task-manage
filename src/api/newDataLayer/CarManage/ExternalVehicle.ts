import hillo from 'hillo';
import dayjs from 'dayjs';

const typeName = 'externalVehicleOrder';

export async function getExternalVehicleList() {
  return (await hillo.jsonPost(typeName + '/list', {})).data.content;
}

export async function getExternalVehicleListByFilter(filter) {
  return (
    await hillo.jsonPost(typeName + '/list', {
      criteria: filter,
    })
  ).data.content;
}

export async function getExternalVehicleListByFilterWithPagination(filter, pagination) {
  return (
    await hillo.jsonPost(typeName + '/list', {
      ...pagination,
      criteria: filter,
    })
  ).data;
}

export async function getExternalVehicleListByIdsAndFilter(ids, filter) {
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

export async function getExternalVehicleListByNotifyId(id) {
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

export async function getExternalVehicleListByOutboundId(id) {
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

export async function getExternalVehicleListById(id) {
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

export async function getExternalVehicleListByIds(ids) {
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

export async function addExternalVehicle(item) {
  return await hillo.jsonPost(typeName + '/addOrUpdateWithRef', {
    ...item,
  });
}

export async function updateExternalVehicle(item) {
  if (item.customer) {
    item.customerId = item.customer.id;
  }
  return await hillo.jsonPost(typeName + '/addOrUpdateWithRef', {
    ...item,
  });
}

export async function deleteExternalVehicleList(id) {
  return await hillo.jsonPost(typeName + '/deleteById/' + id, {});
}

export const defaultExternalVehicle = {
  orderDate: dayjs().format('YYYY-MM-DD'),
  channelType: '',
  vehicleType: '',
  customer: '',
  orderNumber: '',
  trayCount: '',
  boxCount: '',
  stackable: '',
  unloadingEquipmentRequired: '',
  pickupAddress: '',
  deliveryAddress: '',
  pickupDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  deliveryDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  logisticsOrderNumber: '',
  publicQuotation: '',
  dimensions: '',
  requirements: '',
  inquiryRequirements: '',
  hasWarehouseDocuments: '',
  logisticsCompany: '',
  baseCost: '',
  suggestedQuotation: '',
  note: '',
  files: '',
};

export const channelTypeList = [
  { label: '其他', value: '其他' },
  { label: 'Amzon散箱', value: 'Amzon散箱' },
  { label: '取消', value: '取消' },
];

export const vehicleTypeList = [
  { label: '零担', value: '零担' },
  { label: '整车', value: '整车' },
  { label: '专车', value: '专车' },
  { label: '拼车', value: '拼车' },
];
