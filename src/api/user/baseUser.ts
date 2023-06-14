import { addDoc, collection, doc, query, setDoc, where } from 'firebase/firestore';
import { db, executeQuery } from '@/plugins/firebase';
import { Random } from 'mockjs';
import { resultError, resultSuccess } from '../../../mock/_util';
import { ACCESS_TOKEN } from '@/store/mutation-types';
import { storage } from '@/utils/Storage';

export type Permission = {
  label: string;
  value: PermissionEnums;
};

const userPath = 'bolita-user';

export enum PermissionEnums {
  Manager = '管理员',
  Sales = '业务员',
  Operator = '操作员',
  Logistic = '物流',
  Customer = '客户',
}

export type BaseUser = {
  id: string;
  username: string;
  realName: string;
  desc: string;
  password: string;
  token: string;
  permissions: Permission[];
};

export async function createUser(username, realName, password, permission: PermissionEnums) {
  if (await userExist(username)) {
    return resultError('用户已经存在');
  }
  const token = Random.string('upper', 32, 32);
  const doc = await addDoc(collection(db, userPath), {
    username,
    realName,
    password,
    permissions: [permission],
    token,
  });
  return resultSuccess(doc.id);
}

export async function updateUser(userInfo) {
  try {
    await setDoc(doc(db, userPath, userInfo.id), {
      username: userInfo.username,
      realName: userInfo.realName,
      password: userInfo.password,
      permissions: userInfo.permissions,
      token: userInfo.token,
    });
    return resultSuccess('');
  } catch (e) {
    // @ts-ignore
    return resultError(e?.message);
  }
}

export async function listUser(permission: PermissionEnums, userId = '') {
  const q = query(collection(db, userPath), where('permissions', 'array-contains', permission));
  return resultSuccess((await executeQuery(q)).filter((it) => !userId || it.id.includes(userId)));
}

export async function login(params: { username: string; password: string }) {
  const exist = (await findUserWithUsername(params.username)).find(
    (it) => it.password === params.password
  );
  if (exist) {
    return resultSuccess(exist.token);
  } else {
    return resultError('用户不存在');
  }
}

async function findUserWithUsername(username) {
  return await executeQuery(query(collection(db, userPath), where('username', '==', username)));
}

async function userExist(username) {
  return (await findUserWithUsername(username)).length > 0;
}

export async function getUserInfo() {
  const currentToken = storage.get(ACCESS_TOKEN, '');
  const exist = await executeQuery(
    query(collection(db, userPath), where('token', '==', currentToken))
  );
  if (exist[0]) {
    return resultSuccess(exist[0]);
  } else {
    return resultError('用户不存在');
  }
}