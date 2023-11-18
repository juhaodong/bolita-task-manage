import { generateOptionFromArray } from '@/store/utils/utils';
import { FormField } from '@/views/bolita-views/composable/form-field-type';

export enum DeliveryMethod {
  Package = '快递',
  TrailAmz = '直送',
  AMZ = 'AMZ卡派',
  Truck = '其他卡派',
  SelfPick = '自提',
  PrivateTruck = '散货派送',
}

export const deliveryMethod = Object.values(DeliveryMethod);

export enum TruckDeliveryMethod {
  AMZ = 'AMZ卡派',
  Truck = '卡派',
  TrailAmz = '尾程直送',
  PrivateTruck = '私人卡派',
}
export const truckDeliveryMethod = Object.values(TruckDeliveryMethod);

export enum FBABasedDeliveryMethod {
  AMZ = 'AMZ卡派',
  TrailAmz = '尾程直送',
}
export const fbaBasedDeliveryMethod = Object.values(FBABasedDeliveryMethod);

export enum BoxDeliveryMethod {
  DHL = 'DHL',
  DPD = 'DPD',
  UPS = 'UPS',
  GLS = 'GLS',
}

export const boxDeliveryMethod = Object.values(BoxDeliveryMethod);

export const boxDeliveryMethodField: FormField = {
  field: 'deliveryMethod',
  label: '出库方式',
  component: 'NSelect',
  componentProps: {
    options: generateOptionFromArray(boxDeliveryMethod),
  },
};
