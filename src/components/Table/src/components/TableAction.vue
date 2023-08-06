<template>
  <div class="tableAction">
    <n-space>
      <template v-for="(action, index) in getActions" :key="`${index}-${action.label}`">
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-popconfirm
              :show-icon="false"
              @positive-click="action.popConfirm.confirm"
              v-if="action.popConfirm"
            >
              <template #trigger>
                <n-button
                  style="font-size: 18px; padding: 4px !important"
                  text
                  v-bind="action"
                  :type="(action.highlight ? action.highlight() : false) ? 'warning' : 'default'"
                >
                  <template v-if="action.icon">
                    <n-icon :component="action.icon" />
                  </template>
                  <template v-else>
                    <div style="font-size: xx-small" class="font-bold">
                      {{ action.label }}
                    </div>
                  </template>
                </n-button>
              </template>
              {{ action.popConfirm.title }}
            </n-popconfirm>
            <n-button
              text
              style="font-size: 18px; padding: 4px !important"
              v-else
              v-bind="action"
              :type="(action.highlight ? action.highlight() : false) ? 'success' : 'default'"
            >
              <template v-if="action.icon">
                <n-icon :component="action.icon" />
              </template>
              <template v-else>
                <div style="font-size: 8px; scale: 0.8" class="font-bold">
                  {{ action.label }}
                </div>
              </template>
            </n-button>
          </template>
          {{ action.label }}
        </n-tooltip>
      </template>
      <n-dropdown
        v-if="dropDownActions && getDropdownList.length"
        trigger="hover"
        :options="getDropdownList"
        @select="select"
      >
        <slot name="more"></slot>
        <n-button v-bind="getMoreProps" class="mx-2" v-if="!$slots.more" icon-placement="right">
          <div class="flex items-center">
            <span>更多</span>
            <n-icon size="14" class="ml-1">
              <DownOutlined />
            </n-icon>
          </div>
          <!--          <template #icon>-->
          <!--            -->
          <!--          </template>-->
        </n-button>
      </n-dropdown>
    </n-space>
  </div>
</template>

<script lang="ts">
  import { computed, defineComponent, PropType, toRaw } from 'vue';
  import { ActionItem } from '@/components/Table';
  import { usePermission } from '@/hooks/web/usePermission';
  import { isBoolean, isFunction } from '@/utils/is';
  import { DownOutlined } from '@vicons/antd';

  export default defineComponent({
    name: 'TableAction',
    components: { DownOutlined },
    props: {
      actions: {
        type: Array as PropType<ActionItem[]>,
        default: null,
        required: true,
      },
      dropDownActions: {
        type: Array as PropType<ActionItem[]>,
        default: null,
      },
      style: {
        type: String as PropType<String>,
        default: 'button',
      },
      select: {
        type: Function as PropType<Function>,
        default: () => {},
      },
    },
    setup(props) {
      const { hasPermission } = usePermission();

      const actionType =
        props.style === 'button' ? 'default' : props.style === 'text' ? 'primary' : 'default';
      const actionText =
        props.style === 'button' ? undefined : props.style === 'text' ? true : undefined;

      const getMoreProps = computed(() => {
        return {
          text: actionText,
          type: actionType,
          size: 'small',
        };
      });

      const getDropdownList = computed(() => {
        return (toRaw(props.dropDownActions) || [])
          .filter((action) => {
            return hasPermission(action.auth as string[]) && isIfShow(action);
          })
          .map((action) => {
            const { popConfirm } = action;
            return {
              size: 'small',
              text: actionText,
              type: actionType,
              ...action,
              ...popConfirm,
              onConfirm: popConfirm?.confirm,
              onCancel: popConfirm?.cancel,
            };
          });
      });

      function isIfShow(action: ActionItem): boolean {
        const ifShow = action.ifShow;

        let isIfShow = true;

        if (isBoolean(ifShow)) {
          isIfShow = ifShow;
        }
        if (isFunction(ifShow)) {
          isIfShow = ifShow(action);
        }
        return isIfShow;
      }

      const getActions = computed(() => {
        return (toRaw(props.actions) || [])
          .filter((action) => {
            return hasPermission(action.auth as string[]) && isIfShow(action);
          })
          .map((action) => {
            const { popConfirm } = action;
            return {
              size: 'small',
              text: actionText,
              type: actionType,
              ...action,
              ...(popConfirm || {}),
              onConfirm: popConfirm?.confirm,
              onCancel: popConfirm?.cancel,
              enable: !!popConfirm,
            };
          });
      });

      return {
        getActions,
        getDropdownList,
        getMoreProps,
      };
    },
  });
</script>
