export enum DeliveryMethod {
  AMZ = 'AMZ卡派',
  Truck = '卡派',
  TrailAmz = '尾程直送',
  SelfPick = '自提',
  DHL = 'DHL',
  DPD = 'DPD',
  UPS = 'UPS',
  GLS = 'GLS',
  Others = '其他',
}

export const deliveryMethod = Object.values(DeliveryMethod);
