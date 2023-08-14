import { collection, query, where } from 'firebase/firestore';
import { db, executeQuery } from '@/store/plugins/firebase';
import { Result, resultError, resultSuccess } from '@/store/request/_util';
import { ACCESS_TOKEN } from '@/store/mutation-types';
import { storage } from '@/store/utils/Storage';
import { userPath } from '@/api/dataLayer/modules/user/user';

export type Permission = {
  label: string;
  value: PermissionEnums;
};

export enum PermissionEnums {
  Manager = '管理员',
  Warehouse = '仓库',
  Customer = '客户',
  Operator = '操作员',
  Sales = '业务员',
  Logistic = '物流',
  Cash = '结算',
}

export type BaseUser = {
  id: string;
  username: string;
  realName: string;
  desc: string;
  password: string;
  token: string;
  permissions: PermissionEnums[];
  customerId?: string;
};

export async function login(params: { username: string; password: string }) {
  const exist = (await findUserWithUsername(params.username)).find(
    (it) => it.password === params.password
  );
  if (exist) {
    const res = await getUserInfo(exist.token);
    return resultSuccess(res);
  } else {
    return resultError('用户不存在');
  }
}

async function findUserWithUsername(username) {
  return await executeQuery(query(collection(db, userPath), where('userName', '==', username)));
}

export async function getUserInfo(token?): Promise<Result<BaseUser>> {
  const currentToken = token ?? storage.get(ACCESS_TOKEN, '');
  const exist = await executeQuery(
    query(collection(db, userPath), where('token', '==', currentToken))
  );
  if (exist[0]) {
    const info = exist[0];
    info.permissions = [info.userType];
    return resultSuccess(info);
  } else {
    return resultError('用户不存在');
  }
}
