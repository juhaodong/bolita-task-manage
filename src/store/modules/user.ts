import { defineStore } from 'pinia';
import { store } from '@/store';
import { ACCESS_TOKEN, CURRENT_USER, CUSTOMER_ID, IS_SCREENLOCKED } from '@/store/mutation-types';
import { ResultEnum } from '@/store/enums/httpEnum';

import {
  BaseUser,
  getUserInfo as getUserInfoApi,
  login,
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
    getPermissions(): [any][] {
      return this.permissions;
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
      this.powerList = powerList;
    },
    setUserInfo(info?: BaseUser) {
      this.info = info;
    },
    // 登录
    async login(params: any) {
      const response = await login(params);
      const { result, code } = response;
      console.log(result);
      if (code === ResultEnum.SUCCESS) {
        const ex = 7 * 24 * 60 * 60;
        storage.set(ACCESS_TOKEN, result.token, ex);
        storage.set(CURRENT_USER, result, ex);
        storage.set(IS_SCREENLOCKED, false);
        storage.set(CUSTOMER_ID, result.customerId);
        this.setToken(result.token);
        this.setUserInfo(result);
      }
      return response;
    },

    // 获取用户信息
    async getInfo() {
      const { result } = await getUserInfoApi();
      if (result.permissions && result.permissions.length) {
        const permissionsList = generateOptionFromArray(result.permissions);
        this.setPermissions(permissionsList);
        const powerList = AccountPower.find((it) => it.name === result.realName)?.Power;
        result.powerList = powerList;
        this.setPowerList(powerList);
        this.setUserInfo(result);
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
