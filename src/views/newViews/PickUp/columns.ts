import { DataTableColumns } from 'naive-ui';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { timeColumn } from '@/views/bolita-views/composable/useableColumns';
import { initModel } from '@/api/dataLayer/common/GeneralModel';

export const columns: DataTableColumns<any> = [
  timeColumn('selectedDate', '日期'),
  {
    title: 'Ref',
    key: 'Ref',
  },
  {
    title: 'ISA',
    key: 'ISA',
  },
  {
    title: 'AMZ. F Sendungs ID',
    key: 'AMZID',
  },
  {
    title: 'Zeit',
    key: 'detailTime',
  },
  {
    title: 'Halle',
    key: 'door',
  },
  {
    title: 'Kunden',
    key: 'customer',
  },
  {
    title: 'Adresse',
    key: 'address',
  },
  {
    title: 'Mitarbeiter',
    key: 'staff',
  },
  {
    title: 'Menge',
    key: 'number',
  },
  {
    title: 'Anmerkung',
    key: 'note',
  },
];

export const filters: FormField[] = [];

export const PickUpPlanManager = initModel({
  collectionName: 'pickUp',
  init(value): any {
    return value;
  },
  idPrefix: 'P',
});
