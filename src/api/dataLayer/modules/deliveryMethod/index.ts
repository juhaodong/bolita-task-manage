export enum DeliveryMethod {
  Express = '快递',
  Tray = '托盘',
  LooseBox = '散箱',
  RetainWarehouse = '留仓',
  Transfer = '移交',
}

export const deliveryMethod = Object.values(DeliveryMethod);

export enum TruckDeliveryMethod {
  Direct = '直送',
  AMZ = '卡派',
}

export const truckDeliveryMethod = Object.values(TruckDeliveryMethod);
