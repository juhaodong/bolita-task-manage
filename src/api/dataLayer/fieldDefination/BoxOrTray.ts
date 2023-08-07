import { generateOptionFromArray } from '@/store/utils/utils';
import { FormField } from '@/views/bolita-views/composable/form-field-type';

export enum BoxOrTray {
  Box = '箱',
  Tray = '托',
}

const boxOrTray = Object.values(BoxOrTray);
export const formFieldUnitSelection: FormField = {
  label: '单位',
  field: 'unit',
  component: 'NSelect',
  componentProps: {
    options: generateOptionFromArray(boxOrTray),
  },
};
