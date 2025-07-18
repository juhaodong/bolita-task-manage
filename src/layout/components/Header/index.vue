<template>
  <div class="layout-header">
    <!--顶部菜单-->
    <div
      v-if="navMode === 'horizontal' || (navMode === 'horizontal-mix' && mixMenu)"
      class="layout-header-left"
    >
      <div v-if="navMode === 'horizontal'" class="logo">
        <img :src="websiteConfig.logo" alt="" />
        <h2 v-show="!collapsed" class="title">{{ websiteConfig.title }}</h2>
      </div>
      <AsideMenu
        v-model:collapsed="collapsed"
        v-model:location="getMenuLocation"
        :inverted="getInverted"
        mode="horizontal"
      />
    </div>
    <!--左侧菜单-->
    <div v-else class="layout-header-left">
      <!-- 菜单收起 -->
      <div
        class="ml-1 layout-header-trigger layout-header-trigger-min"
        @click="() => $emit('update:collapsed', !collapsed)"
      >
        <n-icon v-if="collapsed" size="18">
          <MenuUnfoldOutlined />
        </n-icon>
        <n-icon v-else size="18">
          <MenuFoldOutlined />
        </n-icon>
      </div>
      <!-- 刷新 -->
      <div
        v-if="headerSetting.isReload"
        class="mr-1 layout-header-trigger layout-header-trigger-min"
        @click="reloadPage"
      >
        <n-icon size="18">
          <ReloadOutlined />
        </n-icon>
      </div>
      <!-- 面包屑 -->
      <n-breadcrumb v-if="crumbsSetting.show">
        <template
          v-for="routeItem in breadcrumbList"
          :key="routeItem.name === 'Redirect' ? void 0 : routeItem.name"
        >
          <n-breadcrumb-item v-if="routeItem.meta.title">
            <n-dropdown
              v-if="routeItem.children.length"
              :options="routeItem.children"
              @select="dropdownSelect"
            >
              <span class="link-text">
                <component
                  :is="routeItem.meta.icon"
                  v-if="crumbsSetting.showIcon && routeItem.meta.icon"
                />
                {{ routeItem.meta.title }}
              </span>
            </n-dropdown>
            <span v-else class="link-text">
              <component
                :is="routeItem.meta.icon"
                v-if="crumbsSetting.showIcon && routeItem.meta.icon"
              />
              {{ routeItem.meta.title }}
            </span>
          </n-breadcrumb-item>
        </template>
      </n-breadcrumb>
    </div>
    <div class="layout-header-right">
      <div
        v-for="item in iconList"
        :key="item.icon"
        class="layout-header-trigger layout-header-trigger-min"
      >
        <n-tooltip placement="bottom">
          <template #trigger>
            <n-icon size="18">
              <component :is="item.icon" v-on="item.eventObject || {}" />
            </n-icon>
          </template>
          <span>{{ item.tips }}</span>
        </n-tooltip>
      </div>
      <!--切换全屏-->
      <div class="layout-header-trigger layout-header-trigger-min">
        <n-tooltip placement="bottom">
          <template #trigger>
            <n-icon size="18">
              <component :is="fullscreenIcon" @click="toggleFullScreen" />
            </n-icon>
          </template>
          <span>全屏</span>
        </n-tooltip>
      </div>
      <!-- 个人中心 -->
      <div class="layout-header-trigger layout-header-trigger-min">
        <n-dropdown :options="avatarOptions" trigger="hover" @select="avatarSelect">
          <div class="avatar"> 当前用户: {{ username }}</div>
        </n-dropdown>
      </div>
      <!--设置-->
      <!--      <div class="layout-header-trigger layout-header-trigger-min" @click="openSetting">-->
      <!--        <n-tooltip placement="bottom-end">-->
      <!--          <template #trigger>-->
      <!--            <n-icon size="18" style="font-weight: bold">-->
      <!--              <SettingOutlined />-->
      <!--            </n-icon>-->
      <!--          </template>-->
      <!--          <span>项目配置</span>-->
      <!--        </n-tooltip>-->
      <!--      </div>-->
    </div>
    <n-modal
      v-model:show="showDailyDialog"
      :show-icon="false"
      preset="card"
      style="width: 90%"
      title="报告"
    >
      <daily-report />
    </n-modal>
  </div>
  <!--项目配置-->
  <ProjectSetting ref="drawerSetting" />
</template>

<script lang="ts">
  import { computed, defineComponent, reactive, ref, toRefs, unref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import components from './components';
  import { NDialogProvider, useDialog, useMessage } from 'naive-ui';
  import { TABS_ROUTES } from '@/store/mutation-types';
  import { useUserStore } from '@/store/modules/user';
  import { useScreenLockStore } from '@/store/modules/screenLock';
  import ProjectSetting from './ProjectSetting.vue';
  import { AsideMenu } from '@/layout/components/Menu';
  import { useProjectSetting } from '@/hooks/setting/useProjectSetting';
  import { websiteConfig } from '@/store/config/website.config';
  import DailyReport from '@/views/newViews/Common/DailyReport.vue';

  export default defineComponent({
    name: 'PageHeader',
    components: { DailyReport, ...components, NDialogProvider, ProjectSetting, AsideMenu },
    props: {
      collapsed: {
        type: Boolean,
      },
      inverted: {
        type: Boolean,
      },
    },
    setup(props) {
      const userStore = useUserStore();
      const useLockscreen = useScreenLockStore();
      const message = useMessage();
      const dialog = useDialog();
      const { navMode, navTheme, headerSetting, menuSetting, crumbsSetting } = useProjectSetting();

      const { realName, userType, userName } = userStore?.info || {};
      console.log(userStore.info, '321');

      const drawerSetting = ref();

      const state = reactive({
        username: realName ? realName : userName + '/[' + userType + ']' ?? '',
        fullscreenIcon: 'FullscreenOutlined',
        navMode,
        navTheme,
        headerSetting,
        crumbsSetting,
      });

      const getInverted = computed(() => {
        return ['light', 'header-dark'].includes(unref(navTheme))
          ? props.inverted
          : !props.inverted;
      });

      const mixMenu = computed(() => {
        return unref(menuSetting).mixMenu;
      });

      const getChangeStyle = computed(() => {
        const { collapsed } = props;
        const { minMenuWidth, menuWidth } = unref(menuSetting);
        return {
          left: collapsed ? `${minMenuWidth}px` : `${menuWidth}px`,
          width: `calc(100% - ${collapsed ? `${minMenuWidth}px` : `${menuWidth}px`})`,
        };
      });

      const getMenuLocation = computed(() => {
        return 'header';
      });

      const router = useRouter();
      const route = useRoute();

      const generator: any = (routerMap) => {
        return routerMap.map((item) => {
          const currentMenu = {
            ...item,
            label: item.meta.title,
            key: item.name,
            disabled: item.path === '/',
          };
          // 是否有子菜单，并递归处理
          if (item.children && item.children.length > 0) {
            // Recursion
            currentMenu.children = generator(item.children, currentMenu);
          }
          return currentMenu;
        });
      };

      const breadcrumbList = computed(() => {
        return generator(route.matched);
      });

      const dropdownSelect = (key) => {
        router.push({ name: key });
      };

      // 刷新页面
      const reloadPage = () => {
        router.push({
          path: '/redirect' + unref(route).fullPath,
        });
      };

      // 退出登录
      const doLogout = () => {
        dialog.info({
          title: '提示',
          content: '您确定要退出登录吗',
          positiveText: '确定',
          negativeText: '取消',
          onPositiveClick: () => {
            userStore.logout().then(() => {
              message.success('成功退出登录');
              // 移除标签页
              localStorage.removeItem(TABS_ROUTES);
              router
                .replace({
                  name: 'Login',
                  query: {
                    redirect: route.fullPath,
                  },
                })
                .finally(() => location.reload());
            });
          },
          onNegativeClick: () => {},
        });
      };

      // 切换全屏图标
      const toggleFullscreenIcon = () =>
        (state.fullscreenIcon =
          document.fullscreenElement !== null ? 'FullscreenExitOutlined' : 'FullscreenOutlined');

      // 监听全屏切换事件
      document.addEventListener('fullscreenchange', toggleFullscreenIcon);

      // 全屏切换
      const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          }
        }
      };

      // 图标列表
      const iconList = [
        {
          icon: 'SearchOutlined',
          tips: '搜索',
          eventObject: {
            click: () => {
              openReport();
            },
          },
        },
        // {
        //   icon: 'GithubOutlined',
        //   tips: 'github',
        //   eventObject: {
        //     click: () => window.open('https://github.com/jekip/naive-ui-admin'),
        //   },
        // },
        {
          icon: 'LockOutlined',
          tips: '锁屏',
          eventObject: {
            click: () => useLockscreen.setLock(true),
          },
        },
      ];
      const avatarOptions = [
        {
          label: '退出登录',
          key: 2,
        },
      ];

      //头像下拉菜单
      const avatarSelect = (key) => {
        switch (key) {
          case 1:
            router.push({ name: 'Setting' });
            break;
          case 2:
            doLogout();
            break;
        }
      };
      const showDailyDialog = ref(false);
      function openReport() {
        showDailyDialog.value = true;
      }

      function openSetting() {
        const { openDrawer } = drawerSetting.value;
        openDrawer();
      }

      return {
        showDailyDialog,
        ...toRefs(state),
        iconList,
        toggleFullScreen,
        doLogout,
        route,
        dropdownSelect,
        avatarOptions,
        getChangeStyle,
        avatarSelect,
        breadcrumbList,
        reloadPage,
        drawerSetting,
        openSetting,
        getInverted,
        getMenuLocation,
        mixMenu,
        websiteConfig,
      };
    },
  });
</script>

<style lang="less" scoped>
  .layout-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0;
    height: 64px;
    box-shadow: 0 1px 4px rgb(0 21 41 / 8%);
    transition: all 0.2s ease-in-out;
    width: 100%;
    z-index: 11;

    &-left {
      display: flex;
      align-items: center;

      .logo {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 64px;
        line-height: 64px;
        overflow: hidden;
        white-space: nowrap;
        padding-left: 10px;

        img {
          width: auto;
          height: 32px;
          margin-right: 10px;
        }

        .title {
          margin-bottom: 0;
        }
      }

      ::v-deep(.ant-breadcrumb span:last-child .link-text) {
        color: #515a6e;
      }

      .n-breadcrumb {
        display: inline-block;
      }

      &-menu {
        color: var(--text-color);
      }
    }

    &-right {
      display: flex;
      align-items: center;
      margin-right: 20px;

      .avatar {
        display: flex;
        align-items: center;
        height: 64px;
      }

      > * {
        cursor: pointer;
      }
    }

    &-trigger {
      display: inline-block;
      width: 64px;
      height: 64px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease-in-out;

      .n-icon {
        display: flex;
        align-items: center;
        height: 64px;
        line-height: 64px;
      }

      &:hover {
        background: hsla(0, 0%, 100%, 0.08);
      }

      .anticon {
        font-size: 16px;
        color: #515a6e;
      }
    }

    &-trigger-min {
      width: auto;
      padding: 0 12px;
    }
  }

  .layout-header-light {
    background: #fff;
    color: #515a6e;

    .n-icon {
      color: #515a6e;
    }

    .layout-header-left {
      ::v-deep(.n-breadcrumb .n-breadcrumb-item:last-child .n-breadcrumb-item__link) {
        color: #515a6e;
      }
    }

    .layout-header-trigger {
      &:hover {
        background: #f8f8f9;
      }
    }
  }

  .layout-header-fix {
    position: fixed;
    top: 0;
    right: 0;
    left: 200px;
    z-index: 11;
  }

  //::v-deep(.menu-router-link) {
  //  color: #515a6e;
  //
  //  &:hover {
  //    color: #1890ff;
  //  }
  //}
</style>
