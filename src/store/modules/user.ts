import { defineStore } from 'pinia';
import { store } from '@/store';
import { ACCESS_TOKEN, CURRENT_USER, CUSTOMER_ID, IS_SCREENLOCKED } from '@/store/mutation-types';
import { ResultEnum } from '@/store/enums/httpEnum';

import {
  BaseUser,
  getUserInfo as getUserInfoApi,
  login,
  PermissionEnums,
} from '@/api/dataLayer/modules/system/user/baseUser';
import { storage } from '@/store/utils/Storage';
import { generateOptionFromArray } from '@/store/utils/utils';
import { AccountPower } from '@/api/dataLayer/common/PowerModel';

export type UserInfoType = {
  username: string;
  id: string;
};

export interface IUserState {
  token: string;
  username: string;
  welcome: string;
  avatar: string;
  permissions: any[];
  info?: BaseUser;
  powerList: any[];
  authPower: any[];
}

export const useUserStore = defineStore({
  id: 'app-user',
  state: (): IUserState => ({
    token: storage.get(ACCESS_TOKEN, ''),
    username: '',
    welcome: '',
    avatar: '',
    permissions: [],
    powerList: [],
    info: storage.get(CURRENT_USER, {}),
    authPower: [],
  }),
  getters: {
    getPowerList(): [any][] {
      return this.powerList;
    },
    getToken(): string {
      return this.token;
    },
    getAvatar(): string {
      return this.avatar;
    },
    getNickname(): string {
      return this.username;
    },
    getRole(): PermissionEnums {
      return this.permissions?.[0]?.value;
    },
    getPermissions(): [any][] {
      return this.powerList;
    },
    getUserInfo(): BaseUser | undefined {
      return this.info;
    },
  },
  actions: {
    setToken(token: string) {
      this.token = token;
    },
    setAvatar(avatar: string) {
      this.avatar = avatar;
    },
    setPermissions(permissions) {
      this.permissions = permissions;
    },
    setPowerList(powerList) {
      this.powerList = generateOptionFromArray(powerList);
    },
    setUserInfo(info?: BaseUser) {
      this.info = info;
    },
    setAuthPower(list) {
      this.authPower = list;
    },
    // 登录
    async login(params: any) {
      const response = await login(params);
      const { result, code } = response;
      if (code === ResultEnum.SUCCESS) {
        const ex = 7 * 24 * 60 * 60;
        storage.set(ACCESS_TOKEN, result.token, ex);
        storage.set(CURRENT_USER, result, ex);
        storage.set(IS_SCREENLOCKED, false);
        storage.set(CUSTOMER_ID, result.belongsToId);
        this.setToken(result.token);
        this.setUserInfo(result);
      }
      return response;
    },

    // 获取用户信息
    async getInfo() {
      const { result } = await getUserInfoApi();
      console.log(result, 'result');
      if (result.permissions && result.permissions.length) {
        const permissionsList = generateOptionFromArray(result.permissions);
        this.setPermissions(permissionsList);
        const powerList = AccountPower.find((it) => it.name === result.userType)?.Power ?? [];
        result.powerList = powerList;
        storage.set(CUSTOMER_ID, result.belongsToId);
        this.setPowerList(powerList);
        this.setUserInfo(result);
        this.setAuthPower(result.authPower);
      } else {
        throw new Error('getInfo: permissionsList must be a non-null array !');
      }
      this.setAvatar('');
      return result;
    },

    // 登出
    async logout() {
      this.setPermissions([]);
      this.setUserInfo();
      storage.remove(ACCESS_TOKEN);
      storage.remove(CURRENT_USER);
    },
  },
});

// Need to be used outside the setup
export function useUser() {
  return useUserStore(store);
}
