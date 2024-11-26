import hillo from 'hillo';

const typeName = 'outboundForecast';

export async function getOutboundForecastList() {
  return (await hillo.jsonPost(typeName + '/list', {})).data.content;
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
  return await hillo.jsonPost(typeName + '/addOrUpdate', {
    ...item,
  });
}

export async function addOrUpdateWithRefOutboundForecast(item) {
  if (item.customer || item.inventory) {
    item.customerId = item.customer.id;
    item.inventoryId = item.inventory.id;
  }
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

export async function deleteOutboundForecast(id) {
  return await hillo.jsonPost(typeName + '/deleteById/' + id, {});
}

export const defaultOutboundList = {
  outboundDetailInfo: '',
  FCAddress: '',
  containerNum: 0,
  deliveryMethod: '',
  inStatus: '',
  needCar: '',
  needOfferPrice: '',
  postcode: '',
  totalVolume: '',
  totalWeight: '',
  trayNum: '',
  REF: '',
  ISA: '',
  AMZID: '',
  waybillId: '',
  FBACode: '',
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
  bookCarTimestamp: 0,
  PODFiles: '',
  CMRFiles: '',
  pickupFiles: '',
  unloadingFile: '',
  loadingCarDoc: '',
  alreadyChanged: '',
  logisticsCompany: '',
};
