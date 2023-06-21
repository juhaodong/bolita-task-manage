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
  Others = '其他',
}
export const deliveryMethods = Object.values(DeliveryMethod);
