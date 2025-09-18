import hillo from 'hillo';
import dayjs from 'dayjs';

const typeName = 'outboundForecast';

export async function getOutboundForecastList() {
  return (await hillo.jsonPost(typeName + '/list', {})).data.content;
}

export async function getOutboundForecastByBetweenDateRangeList(dateRange) {
  return (
    await hillo.jsonPost(typeName + '/list', {
      criteria: [
        {
          field: 'realOutDate',
          op: 'between',
          value: dateRange,
        },
      ],
    })
  ).data.content;
}

export async function getOutboundForecastById(id) {
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

export async function addOrUpdateOutboundForecast(item) {
  return await hillo.jsonPost(typeName + '/addOrUpdateWithRef', {
    ...item,
  });
}

export async function addOrUpdateWithRefOutboundForecast(item) {
  return await hillo.jsonPost(typeName + '/addOrUpdateWithRef', {
    ...item,
  });
}

export async function getOutboundForecastListByFilter(filter) {
  return (
    await hillo.jsonPost(typeName + '/list', {
      criteria: filter,
    })
  ).data.content;
}

export async function getOutboundForecastListByFilterWithPagination(filter, pagination) {
  return (
    await hillo.jsonPost(typeName + '/list', {
      ...pagination,
      criteria: filter,
    })
  ).data;
}

export async function deleteOutboundForecast(id) {
  return await hillo.jsonPost(typeName + '/deleteById/' + id, {});
}

export async function getOutboundRef(type, postcode, channel, id) {
  return await hillo.jsonPost(typeName + '/setRef', {
    id: id,
    forDate: dayjs().format('YYYY-MM-DD'),
    refType: type,
    postcode,
    targetPostcode: postcode,
    channel: channel,
  });
}

export const refTypeList = ['Other', 'Tray', 'Channel', 'WithoutCar'];

export const defaultOutboundList = {
  outboundDetailInfo: '',
  fcAddress: '',
  containerNum: 0,
  deliveryMethod: '',
  inStatus: '',
  needCar: '',
  needOfferPrice: '',
  postcode: '',
  totalVolume: '',
  totalWeight: '',
  trayNum: '',
  ref: '',
  isa: '',
  amzId: '',
  waybillId: '',
  fbaCode: '',
  orderCarPrice: '',
  reservationGetProductTime: '',
  reservationGetProductDetailTime: '',
  deliveryDetail: '',
  note: '',
  externalPrice: '',
  costPrice: '',
  suggestedPrice: '',
  carStatus: '',
  street: '',
  state: '',
  country: '',
  houseNo: '',
  city: '',
  appendAddress: '',
  waitPrice: '',
  waitCar: '',
  totalOutOffer: '',
  bookCarTimestamp: '',
  podFiles: '',
  cmrFiles: '',
  pickupFiles: '',
  unloadingFile: '',
  loadingCarDoc: '',
  alreadyChanged: '',
  logisticsCompany: '',
};

export const waitOperationStatusList = ['已定车', '无需定车', '已装车', '已完成', '全部出库'];
