import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { formFieldTargetCountrySelection } from '@/api/dataLayer/fieldDefination/TargetCountry';
import {
  fbaDict,
  formFieldFBACodeSelection,
  getAddressByCode,
} from '@/api/dataLayer/fieldDefination/FBACode';
import { deliveryMethodSelection } from '@/api/dataLayer/fieldDefination/common';
import {
  boxDeliveryMethod,
  DeliveryMethod,
  fbaBasedDeliveryMethod,
  truckDeliveryMethod,
} from '@/api/dataLayer/modules/deliveryMethod';

export const deliveryAddressDetail: FormField[] = [
  { label: '收件人', field: 'contact' },
  { label: '电话／邮箱', field: 'email', required: false },
  { label: '街道', field: 'street' },
  { label: '门牌号', field: 'houseNo' },
  { label: '地址附加', field: 'appendAddress', required: false },
  { label: '城市', field: 'city' },
  { label: '州', field: 'state' },
  { label: '国家', field: 'country' },
];

export function isAmazon(value) {
  return (
    value['deliveryMethod'] == DeliveryMethod.AMZ ||
    value['deliveryMethod'] == DeliveryMethod.TrailAmz
  );
}

function getDeliveryAddressDetail(): FormField[] {
  return deliveryAddressDetail.map((it: FormField) => {
    it.displayCondition = (value) => {
      return value['deliveryMethod'] == DeliveryMethod.Truck;
    };
    it.meta = 'detail';
    return it;
  });
}

export function getCommonDeliveryField(): FormField[] {
  return [
    {
      field: 'deliveryAddress',
      label: '送货地址',
      componentProps: {
        type: 'textarea',
      },
      required: true,
      disableCondition(model) {
        return isAmazon(model);
      },
      onFormUpdate(value) {
        if (value?.fbaCode) {
          value['deliveryAddress'] = getAddressByCode(value.fbaCode);
        }
      },
      displayCondition(model) {
        return isAmazon(model);
      },
    },
    ...getDeliveryAddressDetail(),
  ];
}

export const commonDeliveryFields = getCommonDeliveryField();

export function getTargetAddressSelectionGroup(): FormField[] {
  return [
    ...deliveryMethodSelection,
    formFieldFBACodeSelection,
    formFieldTargetCountrySelection,
    {
      label: '邮编',
      field: 'postCode',
      disableCondition(model) {
        return isAmazon(model);
      },
      onFormUpdate(value) {
        if (value?.fbaCode) {
          value['postCode'] = fbaDict[value.fbaCode].postCode;
        }
      },
      displayCondition(model) {
        return truckDeliveryMethod.includes(model?.deliveryMethod);
      },
    },
    {
      label: 'PO',
      field: 'po',
      required: false,
    },
    ...getCommonDeliveryField(),
  ].map((it: FormField) => {
    it.group = '收件人地址信息';
    return it;
  });
}

export function generateAddress(value: any) {
  return `${value.street} ${value.houseNo}
  ${value.appendAddress}
${value.city} ${value.postCode}
${value.state}/${value.countryCode}
`;
}

export function formatItemAddress(item) {
  const clean = () => {
    deliveryAddressDetail.forEach((key) => {
      item[key.field] = '';
    });
  };
  item.deliveryAddress = '';
  if (boxDeliveryMethod.includes(item.deliveryMethod)) {
    clean();
  } else if (fbaBasedDeliveryMethod.includes(item.deliveryMethod)) {
    clean();
    item.deliveryAddress = getAddressByCode(item.fbaCode);
    item.targetCountry = fbaDict[item.fbaCode].countryCode;
    item.postCode = fbaDict[item.fbaCode].postCode;
  } else if (item.deliveryMethod == DeliveryMethod.Truck) {
    item.deliveryAddress = generateAddress(item);
  } else {
    clean();
  }
}
