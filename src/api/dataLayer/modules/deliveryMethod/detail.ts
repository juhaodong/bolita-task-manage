import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { generateOptionFromArray } from '@/store/utils/utils';
import { DeliveryMethod } from '@/api/dataLayer/modules/deliveryMethod/index';

export enum BoxDeliveryMethod {
  DHL = 'DHL',
  DPD = 'DPD',
  UPS = 'UPS',
  GLS = 'GLS',
}

export const boxDeliveryMethod = Object.values(BoxDeliveryMethod);

export enum AmazonDeliveryDetail {
  Amazon = '亚马逊',
  OtherAddress = '其他地址',
  SingleTruck = '散货派送',
}

export enum OtherDeliveryDetail {
  SelfPick = '自提',
  Stay = '留仓',
}

export const directDeliveryMethodDetail = ['DTM2', 'HAJ1', 'WRO5', '90451'];

const otherDeliveryMethodField: FormField = {
  field: 'deliveryDetail',
  label: '物流方式',
  component: 'NSelect',
  componentProps: {
    options: generateOptionFromArray(Object.values(OtherDeliveryDetail)),
  },
  displayCondition(value) {
    return value.deliveryMethod === DeliveryMethod.Other;
  },
};
const packageDeliveryMethodField: FormField = {
  field: 'deliveryDetail',
  label: '物流方式',
  component: 'NSelect',
  componentProps: {
    options: generateOptionFromArray(boxDeliveryMethod),
  },
  displayCondition(value) {
    return value.deliveryMethod === DeliveryMethod.Package;
  },
};
const directDeliveryMethodField: FormField = {
  field: 'deliveryDetail',
  label: '物流方式',
  component: 'NSelect',
  componentProps: {
    options: generateOptionFromArray(directDeliveryMethodDetail),
  },

  displayCondition(value) {
    return value.deliveryMethod === DeliveryMethod.Direct;
  },
};
const truckDeliveryMethodField: FormField = {
  field: 'deliveryDetail',
  label: '物流方式',
  component: 'NSelect',
  componentProps: {
    options: generateOptionFromArray(Object.values(AmazonDeliveryDetail)),
  },
  displayCondition(value) {
    return value.deliveryMethod === DeliveryMethod.AMZ;
  },
};
export const deliveryDetailMethods = [
  otherDeliveryMethodField,
  packageDeliveryMethodField,
  directDeliveryMethodField,
  truckDeliveryMethodField,
];

export function shouldUseFBACode(model) {
  return (
    model?.deliveryMethod == DeliveryMethod.Direct ||
    model?.deliveryDetail == AmazonDeliveryDetail.Amazon
  );
}
