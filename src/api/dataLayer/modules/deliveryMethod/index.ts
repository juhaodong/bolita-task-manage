export enum DeliveryMethod {
  Package = '快递',
  Direct = '直送',
  AMZ = '卡派',
  Other = '其他',
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
