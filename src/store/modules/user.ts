import { defineStore } from 'pinia';
import { store } from '@/store';
import { ACCESS_TOKEN, CURRENT_USER } from '@/store/mutation-types';

import { BaseUser, login, PermissionEnums } from '@/api/dataLayer/modules/system/user/baseUser';
import { storage } from '@/store/utils/Storage';
import { generateOptionFromArray } from '@/store/utils/utils';

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
      return await login(params);
    },

    // 获取用户信息
    async getInfo() {
      const result = this.getUserInfo;
      console.log(result, 'result');
      this.setAuthPower(result.powerTypeItems);
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
