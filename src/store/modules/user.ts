import { defineStore } from 'pinia';
import { store } from '@/store';
import { ACCESS_TOKEN, CURRENT_USER, IS_SCREENLOCKED } from '@/store/mutation-types';
import { ResultEnum } from '@/enums/httpEnum';

import { getUserInfo as getUserInfoApi, login } from '@/api/user/baseUser';
import { storage } from '@/utils/Storage';
import { generateOptionFromArray } from '@/utils/utils';

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
  info: UserInfoType;
}

export const useUserStore = defineStore({
  id: 'app-user',
  state: (): IUserState => ({
    token: storage.get(ACCESS_TOKEN, ''),
    username: '',
    welcome: '',
    avatar: '',
    permissions: [],
    info: storage.get(CURRENT_USER, {}),
  }),
  getters: {
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
    getUserInfo(): UserInfoType {
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
    setUserInfo(info: UserInfoType) {
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
      this.setUserInfo({ id: '', username: '' });
      storage.remove(ACCESS_TOKEN);
      storage.remove(CURRENT_USER);
    },
  },
});

// Need to be used outside the setup
export function useUser() {
  return useUserStore(store);
}
