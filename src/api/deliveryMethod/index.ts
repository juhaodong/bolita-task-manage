import { LogisticType } from '@/api/deliveryMethod/logistic-type';

export enum DeliveryMethod {
  DHL = 'DHL',
  DPD = 'DPD',
  UPS = 'UPS',
  GLS = 'GLS',
  toCPal = 'to C（Pal）',
  toBPal = 'to B（Pal）',
  toAPal = 'to A（Pal）',
  ExpressA = 'Express-A',
  ExpressB = 'Express-B',
  SelfPickCTN = '自提-CTN.',
  SelfPickPAL = '自提-PAL.',
  OversizeTray = '超标卡派',
  DBSchenker = 'DB Schenker',
  Fedex = 'Fedex',
  DirectSend = '直送',
  Others = '其他',
}

export const canHaveLogisticMethods = [
  DeliveryMethod.toAPal,
  DeliveryMethod.toBPal,
  DeliveryMethod.toCPal,
  DeliveryMethod.ExpressA,
  DeliveryMethod.ExpressB,
  DeliveryMethod.OversizeTray,
  DeliveryMethod.Others,
  DeliveryMethod.DirectSend,
];

export function getLogisticTypeByDeliveryMethod(deliveryMethod: DeliveryMethod): LogisticType {
  switch (deliveryMethod) {
    case DeliveryMethod.DHL:
    case DeliveryMethod.DPD:
    case DeliveryMethod.UPS:
    case DeliveryMethod.GLS:
    case DeliveryMethod.SelfPickCTN:
    case DeliveryMethod.SelfPickPAL:
    case DeliveryMethod.DBSchenker:
    case DeliveryMethod.Fedex:
      return LogisticType.None;
    case DeliveryMethod.toCPal:
    case DeliveryMethod.toBPal:
    case DeliveryMethod.OversizeTray:
      return LogisticType.OtherTray;
    case DeliveryMethod.toAPal:
      return LogisticType.AmazonTray;
    case DeliveryMethod.ExpressA:
    case DeliveryMethod.ExpressB:
      return LogisticType.Box;
    case DeliveryMethod.DirectSend:
    case DeliveryMethod.Others:
      return LogisticType.DirectSent;
  }
}

export const deliveryMethods = Object.values(DeliveryMethod);
