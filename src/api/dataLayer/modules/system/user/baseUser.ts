import { collection, query, where } from 'firebase/firestore';
import { db, executeQuery } from '@/store/plugins/firebase';
import { Result, resultError, resultSuccess } from '@/store/request/_util';
import { ACCESS_TOKEN, CURRENT_USER, TOKEN_NAME, TOKEN_VALUE } from '@/store/mutation-types';
import { storage } from '@/store/utils/Storage';
import { CustomerManager, salesMan, userPath } from '@/api/dataLayer/modules/user/user';
import { loginNew } from '@/api/newDataLayer/User/Login';
import hillo from 'hillo';
import { useUserStore } from '@/store/modules/user';
import { getUserByLoginName } from '@/api/newDataLayer/User/User';

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
  const exist = await loginNew(params.username, params.password);
  const config = {
    isDebug: false,
    productionUrl: 'http://localhost:8080/',
    debugUrl: 'http://localhost:8080/',
    header: {
      post: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
    },
    LoadingUtils: {},
  };
  config.header.post[exist.tokenName] = exist.tokenValue;
  console.log(config, 'config');
  if (exist) {
    hillo.use(config);
    useUserStore().setTokenName(exist.tokenName);
    useUserStore().setTokenValue(exist.tokenValue);
    const userInfo = await getUserByLoginName(params.username);
    console.log(userInfo, 'info');
    useUserStore().setUserInfo(userInfo);
    const ex = 30 * 24 * 60 * 60;
    storage.set(TOKEN_NAME, exist.tokenName);
    storage.set(TOKEN_VALUE, exist.tokenValue);
    storage.set(CURRENT_USER, userInfo, ex);
    return resultSuccess('登录成功');
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
