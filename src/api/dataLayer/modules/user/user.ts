import { initModel } from '@/api/dataLayer/common/GeneralModel';
import { UserType } from '@/views/newViews/UserManage/columns';
import { where } from 'firebase/firestore';
import { FormField } from '@/views/bolita-views/composable/form-field-type';
import { usePermission } from '@/hooks/web/usePermission';
import { PermissionEnums } from '@/api/dataLayer/modules/system/user/baseUser';
import { generateOptionFromArray } from '@/store/utils/utils';
import { Random } from 'mockjs';

export const userPath = 'user';
export const UserManager = initModel({
  collectionName: userPath,
  init(value): any {
    value.token = Random.string('upper', 32, 32);
    value.permissions = [value.userType];
    return value;
  },
  uniqKeys: ['loginName'],
  idPrefix: 'U',
});

export async function getUserWithType(userType: UserType) {
  return await UserManager.load(null, where('userType', '==', userType));
}

export async function asyncUserTypeFormField(params: {
  userType: UserType;
  field: string;
  label: string;
}): Promise<FormField> {
  const { userType, field, label } = params;
  const { hasPermission } = usePermission();
  const userList = (await getUserWithType(userType)).map((it) => ({
    label: it.realName,
    value: it.id,
  }));
  return {
    field: field,
    label: label,
    component: 'NSelect',
    componentProps: {
      options: userList,
    },
    displayCondition() {
      return !hasPermission([PermissionEnums.CustomerManage, PermissionEnums.CustomerService]);
    },
  };
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

export async function asyncInventoryFormField(
  params: {
    field: string;
    label: string;
  } = { field: 'warehouseId', label: '仓库' }
): Promise<FormField> {
  const { field, label } = params;
  const { hasPermission } = usePermission();
  const userList = (await InventoryManager.load()).map((it) => ({
    label: it.companyName,
    value: it.id,
  }));
  return {
    field: field,
    label: label,
    component: 'NSelect',
    componentProps: {
      options: userList,
    },
    displayCondition() {
      return !hasPermission([
        PermissionEnums.Operator,
        PermissionEnums.Sales,
        PermissionEnums.Logistic,
        PermissionEnums.Cash,
      ]);
    },
  };
}

export enum CustomerStatus {
  Normal = '正常',
  Warning = '关注',
  Suspend = '停止',
}

export const customerStatus = Object.values(CustomerStatus);
export const customerStatusSelection: FormField = {
  label: '客户状态',
  field: 'status',
  component: 'NSelect',
  componentProps: {
    options: generateOptionFromArray(customerStatus),
  },
};
