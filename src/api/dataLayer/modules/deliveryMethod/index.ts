export enum DeliveryMethod {
  Package = '快递',
  Direct = '直送',
  AMZ = '卡派',
  Other = '其他',
}

export const deliveryMethod = Object.values(DeliveryMethod);

export enum TruckDeliveryMethod {
  Direct = '直送',
  AMZ = '卡派',
}

export const truckDeliveryMethod = Object.values(TruckDeliveryMethod);
