import {
  FormField,
  getDeliveryMethodSelection,
} from '@/views/bolita-views/composable/form-field-type';
import { formFieldTargetCountrySelection } from '@/api/model/common/TargetCountry';
import { fbaDict, formFieldFBACodeSelection, generateFbaAddress } from '@/api/model/common/FBACode';
import { AddressType, formFieldAddressTypeSelection } from '@/api/model/common/AddressType';
import { generateOptionFromArray } from '@/utils/utils';
import { YesOrNo, yesOrNo } from '@/api/operationType';

export const deliveryAddressDetail: FormField[] = [
  { label: '收件人', field: 'contact' },
  { label: '电话／邮箱', field: 'email', required: false },
  { label: '街道', field: 'street' },
  { label: '门牌号', field: 'houseNo' },
  { label: '地址附加', field: 'appendAddress', required: false },
  { label: '城市', field: 'city' },
  { label: '州', field: 'state' },
];

function getDeliveryAddressDetail(): FormField[] {
  return deliveryAddressDetail.map((it: FormField) => {
    it.displayCondition = (value) => {
      return value?.addressType && value.addressType != AddressType.AMZ;
    };
    it.meta = 'detail';
    return it;
  });
}

function getCommonDeliveryField(isAmazon = false): FormField[] {
  return [
    {
      field: 'deliveryAddress',
      label: '送货地址',
      componentProps: {
        type: 'textarea',
      },
      required: true,
      disableCondition(model) {
        return isAmazon || model?.addressType === AddressType.AMZ;
      },
      onFormUpdate(value) {
        if (value?.fbaCode) {
          value['deliveryAddress'] = generateFbaAddress(fbaDict[value.fbaCode]);
        }
      },
      displayCondition(model) {
        return isAmazon || model?.addressType === AddressType.AMZ;
      },
    },
    ...getDeliveryAddressDetail(),
    {
      field: 'needPrice',
      label: '需要确认报价',
      component: 'NSelect',
      componentProps: {
        options: generateOptionFromArray(yesOrNo),
      },
      required: true,
      defaultValue: YesOrNo.No,
    },
  ];
}

export const commonDeliveryFields = getCommonDeliveryField();

export function getTargetAddressSelectionGroup(): FormField[] {
  return [
    formFieldAddressTypeSelection,
    formFieldFBACodeSelection,
    formFieldTargetCountrySelection,
    {
      label: '邮编',
      field: 'postCode',
      disableCondition(model) {
        return model?.addressType === AddressType.AMZ;
      },
      onFormUpdate(value) {
        if (value?.fbaCode) {
          value['postCode'] = fbaDict[value.fbaCode].postCode;
        }
      },
      displayCondition(model) {
        return model?.addressType && model?.addressType === AddressType.AMZ;
      },
    },
    {
      label: 'PO',
      field: 'po',
      required: false,
      displayCondition(model) {
        return model?.addressType && model?.addressType === AddressType.AMZ;
      },
    },
    ...getCommonDeliveryField(),
    ...deliveryMethodSelection,
  ].map((it: FormField) => {
    it.group = '收件人地址信息';
    return it;
  });
}
