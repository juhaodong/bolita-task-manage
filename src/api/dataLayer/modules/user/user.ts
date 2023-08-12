import { initModel } from '@/api/dataLayer/common/GeneralModel';

export const userPath = 'user';
export const UserManager = initModel({
  collectionName: userPath,
  init(value): any {
    return value;
  },
  uniqKeys: ['loginName'],
});

export const inventoryPath = 'inventory';
export const InventoryManager = initModel({
  collectionName: inventoryPath,
  init(value): any {
    return value;
  },
});
