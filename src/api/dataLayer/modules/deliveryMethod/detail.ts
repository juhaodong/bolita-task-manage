import { FormField } from '@/views/bolita-views/composable/form-field-type';
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
}

export enum trayDelivery {
  AMZ = 'AMZ',
  trayOther = '其他',
}

export enum looseBoxDelivery {
  AMZ = 'FBA',
  LooseBoxOther = '其他',
}

export enum retainWarehouse {
  retainWarehouse = '流仓',
}

export enum transfer {
  otherSystem = '其他系统',
  transferOther = '其他',
}

export enum AmazonDeliveryDetail {
  Amazon = '亚马逊',
  OtherAddress = '其他地址',
  SingleTruck = '散货派送',
}

const expressDeliveryMethodField: FormField = {
  field: 'deliveryDetail',
  label: '物流方式',
  component: 'NSelect',
  componentProps: {
    options: generateOptionFromArray(Object.values(expressDelivery)),
  },
};
const trayDeliveryMethodField: FormField = {
  field: 'deliveryDetail',
  label: '物流方式',
  component: 'NSelect',
  componentProps: {
    options: generateOptionFromArray(Object.values(trayDelivery)),
  },
};
const looseBoxDeliveryMethodField: FormField = {
  field: 'deliveryDetail',
  label: '物流方式',
  component: 'NSelect',
  componentProps: {
    options: generateOptionFromArray(Object.values(looseBoxDelivery)),
  },
};
const retainWarehouseMethodField: FormField = {
  field: 'deliveryDetail',
  label: '物流方式',
  component: 'NSelect',
  componentProps: {
    options: generateOptionFromArray(Object.values(retainWarehouse)),
  },
};
const transferMethodField: FormField = {
  field: 'deliveryDetail',
  label: '物流方式',
  component: 'NSelect',
  componentProps: {
    options: generateOptionFromArray(Object.values(transfer)),
  },
};
export const deliveryDetailMethods = [
  expressDeliveryMethodField,
  trayDeliveryMethodField,
  looseBoxDeliveryMethodField,
  retainWarehouseMethodField,
  transferMethodField,
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
