import { generateOptionFromArray } from '@/store/utils/utils';
import { DeliveryMethod } from '@/api/dataLayer/modules/deliveryMethod/index';

export enum expressDelivery {
  handPDP = '交DPD',
  handDHL = '交DHL',
  handUPS = '交UPS',
  handGLS = '交GLS',
  stickPDP = '贴PDP',
  stickDHL = '贴DHL',
  stickUPS = '贴UPS',
  stickGLS = '贴GLS',
  stickSKU = '贴SKU',
  stickFBA = '贴FBA',
}

export enum trayDelivery {
  AMZ = 'AMZ',
  trayOther = '托盘其他',
}

export enum looseBoxDelivery {
  FBA = 'FBA卡车派送',
  LooseBoxOther = '散箱其他',
}

export enum retainWarehouse {
  retainWarehouse = '留仓',
}

export enum transfer {
  otherSystem = '其他系统',
  transferSales = '销售',
}

export enum AmazonDeliveryDetail {
  Amazon = '亚马逊',
  OtherAddress = '其他地址',
  SingleTruck = '散货派送',
}

export const deliveryDetailMethods = [
  generateOptionFromArray(Object.values(expressDelivery)),
  generateOptionFromArray(Object.values(trayDelivery)),
  generateOptionFromArray(Object.values(looseBoxDelivery)),
  generateOptionFromArray(Object.values(retainWarehouse)),
  generateOptionFromArray(Object.values(transfer)),
];

export function getSelectedDeliveryMethods(item) {
  console.log(item, 'item');
  return generateOptionFromArray(Object.values(retainWarehouse));
}

export function shouldUseFBACode(model) {
  return (
    model?.deliveryMethod == DeliveryMethod.Direct ||
    model?.deliveryDetail == AmazonDeliveryDetail.Amazon
  );
}

export const outboundMethodList = ['散货', '标准托盘', '大件托盘', '存仓'];

export const deliveryMethodList = ['FBA卡车派送', 'DHL', 'DPD', 'UPS', 'GLS', '其他', '客户自提'];
