import {
  deliveryMethodSelection,
  FormField,
} from '@/views/bolita-views/composable/form-field-type';
import { formFieldTargetCountrySelection } from '@/api/model/common/TargetCountry';
import { fbaDict, formFieldFBACodeSelection, generateFbaAddress } from '@/api/model/common/FBACode';
import { AddressType, formFieldAddressTypeSelection } from '@/api/model/common/AddressType';
import { generateOptionFromArray } from '@/utils/utils';
import { yesOrNo } from '@/api/operationType';

const deliveryAddressDetail: FormField[] = [
  { label: '收件人', field: 'contact' },
  { label: '电话／邮箱', field: 'email', required: false },
  { label: '街道', field: 'street' },
  { label: '门牌号', field: 'houseNo' },
  { label: '地址附加', field: 'appendAddress', required: false },
  { label: '邮编', field: 'postCode' },
  { label: '城市', field: 'city' },
  { label: '州', field: 'state' },
  { label: '国家', field: 'country' },
].map((it: FormField) => {
  it.displayCondition = (value) => {
    return value?.addressType && value.addressType != AddressType.AMZ;
  };
  return it;
});

export const commonDeliveryFields: FormField[] = [
  {
    field: 'deliveryAddress',
    label: '送货地址',
    componentProps: {
      type: 'textarea',
    },
    required: true,
    disableCondition(model) {
      return model?.addressType === AddressType.AMZ;
    },
    onFormUpdate(value) {
      if (value?.fbaCode) {
        value['deliveryAddress'] = generateFbaAddress(fbaDict[value.fbaCode]);
      }
    },
    displayCondition(model) {
      return model?.addressType === AddressType.AMZ;
    },
  },
  ...deliveryAddressDetail,
  {
    field: 'needPrice',
    label: '需要确认报价',
    component: 'NSelect',
    componentProps: {
      options: generateOptionFromArray(yesOrNo),
    },
  },
];
export const targetAddressSelectionGroup: FormField[] = [
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
  },
  { label: 'PO', field: 'po' },
  ...commonDeliveryFields,
  ...deliveryMethodSelection,
].map((it) => {
  console.log(it);
  it.group = '收件人地址信息';
  return it;
});
