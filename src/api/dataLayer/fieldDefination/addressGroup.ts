import { FormField } from '@/views/bolita-views/composable/form-field-type';
import {
  formFieldPostCodeInput,
  formFieldTargetCountrySelection,
} from '@/api/dataLayer/fieldDefination/TargetCountry';
import {
  fbaDict,
  formFieldFBACodeSelection,
  getAddressByCode,
} from '@/api/dataLayer/fieldDefination/FBACode';
import { getDeliveryMethodSelection } from '@/api/dataLayer/fieldDefination/common';
import {
  deliveryMethod,
  DeliveryMethod,
  fbaBasedDeliveryMethod,
} from '@/api/dataLayer/modules/deliveryMethod';
import { cloneDeep } from 'lodash-es';
import {
  AmazonDeliveryDetail,
  boxDeliveryMethod,
  OtherDeliveryDetail,
  shouldUseFBACode,
} from '@/api/dataLayer/modules/deliveryMethod/detail';

export const deliveryAddressDetail: FormField[] = [
  { label: '收件人', field: 'contact' },
  { label: '电话／邮箱', field: 'email', required: false },
  { label: '街道', field: 'street' },
  { label: '门牌号', field: 'houseNo' },
  { label: '地址附加', field: 'appendAddress', required: false },
  { label: '城市', field: 'city' },
  { label: '州', field: 'state', required: false },
  { label: '国家', field: 'country', required: false },
];

function getDeliveryAddressDetail(): FormField[] {
  return cloneDeep(deliveryAddressDetail).map((it: FormField) => {
    it.displayCondition = (value) => {
      return [OtherDeliveryDetail.SingleTruck, AmazonDeliveryDetail.OtherAddress].includes(
        value.detailDeliveryMethod
      );
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
        return shouldUseFBACode(model);
      },
      onFormUpdate(value) {
        if (value?.fbaCode) {
          value['deliveryAddress'] = getAddressByCode(value.fbaCode);
        }
      },
      displayCondition(model) {
        return shouldUseFBACode(model);
      },
    },
    ...getDeliveryAddressDetail(),
  ];
}

export function getTargetAddressSelectionGroup(dm = deliveryMethod): FormField[] {
  return [
    ...getDeliveryMethodSelection(dm),
    formFieldFBACodeSelection,
    formFieldTargetCountrySelection,
    formFieldPostCodeInput,
    {
      field: 'FBA号',
      label: 'FBANo',
      required: false,
      displayCondition(model) {
        return shouldUseFBACode(model);
      },
    },
    {
      label: 'PO',
      field: 'po',
      required: false,
      displayCondition(model) {
        return shouldUseFBACode(model);
      },
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
${value.state}/${value.countryCode ?? value.country}
`;
}

export function formatItemAddress(item) {
  const clean = () => {
    deliveryAddressDetail.forEach((key) => {
      item[key.field] = '';
    });
    item.postCode = '';
  };
  const fbaCode = item.fbaCode;
  item.fbaCode = '';
  item.deliveryAddress = '';
  item.targetCountry = '';
  if (boxDeliveryMethod.includes(item.deliveryMethod)) {
    clean();
  } else if (fbaBasedDeliveryMethod.includes(item.deliveryMethod)) {
    clean();
    if (fbaDict[fbaCode]) {
      item.deliveryAddress = getAddressByCode(fbaCode);
      item.targetCountry = fbaDict[fbaCode].countryCode;
      item.postCode = fbaDict[fbaCode].postCode;
      item.fbaCode = fbaCode;
    }
  } else if (item.deliveryMethod == DeliveryMethod.Truck) {
    item.deliveryAddress = generateAddress(item);
  } else {
    clean();
  }
  return item;
}
