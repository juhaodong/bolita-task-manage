import { initModel } from '@/api/dataLayer/common/GeneralModel';
import { UserType } from '@/views/newViews/UserManage/columns';
import { where } from 'firebase/firestore';

export const userPath = 'user';
export const UserManager = initModel({
  collectionName: userPath,
  init(value): any {
    return value;
  },
  uniqKeys: ['loginName'],
  idPrefix: 'U',
});

export async function getUserWithType(userType: UserType) {
  return await UserManager.load(null, where('userType', '==', userType));
}

export const inventoryPath = 'inventory';
export const InventoryManager = initModel({
  collectionName: inventoryPath,
  init(value): any {
    return value;
  },
  idPrefix: 'W',
});
export const customerPath = 'customer';
export const CustomerManager = initModel({
  collectionName: customerPath,
  init(value): any {
    return value;
  },
  idPrefix: 'U',
});
