import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { AddressType } from '@/api/dataLayer/fieldDefination/AddressType';
import { fbaDict } from '@/api/dataLayer/fieldDefination/FBACode';

export const targetCountry = [
  { name: '奥地利', code: 'AT' },
  { name: '比利时', code: 'BE' },
  { name: '荷兰', code: 'NL' },
  { name: '卢森堡', code: 'LU' },
  { name: '瑞士', code: 'CH' },
  { name: '法国', code: 'FR' },
  { name: '意大利', code: 'IT' },
  { name: '西班牙', code: 'ES' },
  { name: '捷克', code: 'CZ' },
  { name: '波兰', code: 'PL' },
  { name: '丹麦', code: 'DK' },
  { name: '英国', code: 'GB' },
  { name: '匈牙利', code: 'HU' },
  { name: '爱尔兰', code: 'IE' },
  { name: '葡萄牙', code: 'PT' },
  { name: '瑞典', code: 'SE' },
  { name: '芬兰', code: 'FI' },
  { name: '希腊', code: 'GR' },
  { name: '列支敦士登Liechtenstein', code: 'LI' },
  { name: '摩纳哥', code: 'MC' },
  { name: '斯洛伐克', code: 'SK' },
  { name: '斯洛维尼亚', code: 'SI' },
  { name: '爱沙尼亚 Estland', code: 'EE' },
  { name: '克罗地亚', code: 'HR' },
  { name: '立陶宛 Litauen', code: 'LT' },
  { name: '拉脱维亚 Lettland', code: 'LV' },
  { name: '挪威', code: 'NO' },
  { name: '保加利', code: 'BG' },
  { name: '"波斯尼亚和', code: 'BA' },
  { name: '黑塞哥维那(波黑）"', code: 'IS' },
  { name: '冰岛', code: 'RO' },
  { name: '罗马尼亚', code: 'RS' },
  { name: '塞尔维亚 serbien', code: '' },
];

export const formFieldTargetCountrySelection: FormField = {
  label: '目的国',
  field: 'targetCountry',
  component: 'NSelect',
  componentProps: {
    options: targetCountry.map((it) => ({
      label: it.name + '(' + it.code + ')',
      value: it.code,
    })),
  },
  disableCondition(model) {
    return model?.addressType === AddressType.AMZ;
  },
  displayCondition(model) {
    return !model?.addressType && model?.addressType === AddressType.AMZ;
  },
  onFormUpdate(value) {
    if (value?.fbaCode) {
      value['targetCountry'] = fbaDict[value.fbaCode].countryCode;
    }
  },
};
