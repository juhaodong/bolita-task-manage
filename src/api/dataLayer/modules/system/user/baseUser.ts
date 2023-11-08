import { collection, query, where } from 'firebase/firestore';
import { db, executeQuery } from '@/store/plugins/firebase';
import { Result, resultError, resultSuccess } from '@/store/request/_util';
import { ACCESS_TOKEN } from '@/store/mutation-types';
import { storage } from '@/store/utils/Storage';
import { CustomerManager, salesMan, userPath } from '@/api/dataLayer/modules/user/user';

export enum PermissionEnums {
  Manager = '管理员',
  CustomerManage = '客户管理员',
  CustomerService = '客户服务',
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
  userType: PermissionEnums;
  token: string;
  permissions: PermissionEnums[];
  customerId?: string;
  powerList: any;
};

export async function login(params: { username: string; password: string }) {
  const exist = (await findUserWithLoginName(params.username)).find(
    (it) => it.password === params.password
  );
  if (exist) {
    const res = await getUserInfo(exist.token);
    return resultSuccess(res.result);
  } else {
    return resultError('用户不存在');
  }
}

async function findUserWithLoginName(username) {
  const loginAll = await executeQuery(
    query(collection(db, userPath), where('loginName', '==', username))
  );
  const loginSales = await executeQuery(
    query(collection(db, salesMan), where('loginName', '==', username))
  );
  if (loginAll.length > 0) {
    return loginAll;
  } else if (loginSales.length > 0) {
    return loginSales;
  }
}

export async function getUserInfo(token?): Promise<Result<BaseUser>> {
  const currentToken = token ?? storage.get(ACCESS_TOKEN, '');
  const allUser = await executeQuery(
    query(collection(db, userPath), where('token', '==', currentToken))
  );
  const salesUser = await executeQuery(
    query(collection(db, salesMan), where('token', '==', currentToken))
  );
  let exist;
  if (allUser.length > 0) {
    exist = allUser;
  } else {
    exist = salesUser;
  }

  if (exist[0]) {
    const info = exist[0];
    info.customerId = (await CustomerManager.load(null, where('userId', '==', info.id)))?.[0]?.id;
    info.permissions = [info.userType];
    return resultSuccess(info);
  } else {
    return resultError('用户不存在');
  }
}
