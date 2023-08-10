import { generateOptionFromArray } from '@/store/utils/utils';
import { FormField } from '@/views/bolita-views/composable/form-field-type';

export enum DeliveryMethod {
  DHL = 'DHL',
  DPD = 'DPD',
  UPS = 'UPS',
  GLS = 'GLS',
  AMZ = 'AMZ卡派',
  Truck = '卡派',
  TrailAmz = '尾程直送',
  SelfPick = '自提',
  Others = '其他',
}

export const deliveryMethod = Object.values(DeliveryMethod);

export enum TruckDeliveryMethod {
  AMZ = 'AMZ卡派',
  Truck = '卡派',
  TrailAmz = '尾程直送',
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
