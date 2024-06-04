import { initModel } from '@/api/dataLayer/common/GeneralModel';

export const OutWarehouseOffer = 'OutWarehouseOffer';
export const OutWarehouseManager = initModel({
  collectionName: OutWarehouseOffer,
  init(value): any {
    return value;
  },
  idPrefix: 'OW',
});
