<template>
  <n-form v-bind="getBindValue" :model="formModel" ref="formElRef">
    <n-grid v-bind="getGrid" x-gap="8">
      <template v-for="g in groupedSchema" :key="g.group">
        <n-gi :span="24" v-if="showGroupHeader">
          <n-h4>{{ g.group }}</n-h4>
        </n-gi>
        <n-gi v-bind="schema.giProps" v-for="schema in g.schema" :key="schema.field">
          <n-form-item :label="schema.label" :path="schema.field">
            <!--标签名右侧温馨提示-->
            <template #label v-if="schema.labelMessage">
              {{ schema.label }}
              <n-tooltip trigger="hover" :style="schema.labelMessageStyle">
                <template #trigger>
                  <n-icon size="18" class="cursor-pointer text-gray-400">
                    <QuestionCircleOutlined />
                  </n-icon>
                </template>
                {{ schema.labelMessage }}
              </n-tooltip>
            </template>

            <!--判断插槽-->
            <template v-if="schema.slot">
              <slot
                :name="schema.slot"
                :model="formModel"
                :field="schema.field"
                :value="formModel[schema.field]"
              ></slot>
            </template>

            <!--NCheckbox-->
            <template v-else-if="schema.component === 'NCheckbox'">
              <n-checkbox-group v-model:value="formModel[schema.field]">
                <n-space>
                  <n-checkbox
                    v-for="item in schema.componentProps.options"
                    :key="item.value"
                    :value="item.value"
                    :label="item.label"
                  />
                </n-space>
              </n-checkbox-group>
            </template>

            <!--NRadioGroup-->
            <template v-else-if="schema.component === 'NRadioGroup'">
              <n-radio-group v-model:value="formModel[schema.field]">
                <n-space>
                  <n-radio
                    v-for="item in schema.componentProps.options"
                    :key="item.value"
                    :value="item.value"
                  >
                    {{ item.label }}
                  </n-radio>
                </n-space>
              </n-radio-group>
            </template>

            <template v-else-if="schema.component === 'NUpload'">
              <n-space>
                <n-upload
                  v-model:file-list="formModel[schema.field]"
                  v-bind="getComponentProps(schema)"
                >
                  <n-button> 上传文件</n-button>
                </n-upload>
                <n-button
                  type="info"
                  dashed
                  v-if="getComponentProps(schema).uploadTemplate"
                  @click="getComponentProps(schema).uploadTemplate"
                  >下载上传模板
                </n-button>
              </n-space>
            </template>
            <template v-else-if="schema.component === 'NAutoComplete'">
              <n-select
                :get-show="() => true"
                :disabled="schema?.disableCondition && schema?.disableCondition(formModel)"
                v-bind="getComponentProps(schema)"
                v-model:value="formModel[schema.field]"
                :class="{ isFull: schema.isFull != false && getProps.isFull }"
              />
            </template>
            <!--动态渲染表单组件-->
            <component
              v-else
              :disabled="schema?.disableCondition && schema?.disableCondition(formModel)"
              v-bind="getComponentProps(schema)"
              :is="schema.component"
              v-model:value="formModel[schema.field]"
              :class="{ isFull: schema.isFull != false && getProps.isFull }"
            />
            <!--组件后面的内容-->
            <template v-if="schema.suffix">
              <slot
                :name="schema.suffix"
                :model="formModel"
                :field="schema.field"
                :value="formModel[schema.field]"
              ></slot>
            </template>
          </n-form-item>
        </n-gi>
      </template>

      <!--提交 重置 展开 收起 按钮-->
      <n-gi :span="isInline ? '' : 24" :suffix="isInline ? true : false" #="{ overflow }">
        <slot name="extra"></slot>
        <n-space
          align="center"
          :justify="isInline ? 'end' : 'start'"
          :style="{ 'margin-left': `${isInline ? 12 : getProps.labelWidth}px` }"
        >
          <n-button
            v-if="getProps.showActionButtonGroup && getProps.showSubmitButton"
            v-bind="getSubmitBtnOptions"
            @click="handleSubmit"
            :loading="loadingSub"
            >{{ getProps.submitButtonText }}
          </n-button>
          <n-button
            v-if="getProps.showActionButtonGroup && getProps.showResetButton"
            v-bind="getResetBtnOptions"
            @click="resetFields"
            >{{ getProps.resetButtonText }}
          </n-button>
          <slot></slot>
          <n-button
            type="primary"
            text
            icon-placement="right"
            v-if="isInline && getProps.showAdvancedButton"
            @click="unfoldToggle"
          >
            <template #icon>
              <n-icon size="14" class="unfold-icon" v-if="overflow">
                <DownOutlined />
              </n-icon>
              <n-icon size="14" class="unfold-icon" v-else>
                <UpOutlined />
              </n-icon>
            </template>
            {{ overflow ? '展开' : '收起' }}
          </n-button>
        </n-space>
      </n-gi>
    </n-grid>
  </n-form>
</template>

<script lang="ts">
  import type { Ref } from 'vue';
  import { computed, defineComponent, onMounted, reactive, ref, unref, watch } from 'vue';
  import { createPlaceholderMessage } from './helper';
  import { useFormEvents } from './hooks/useFormEvents';
  import { useFormValues } from './hooks/useFormValues';

  import { basicProps } from './props';
  import { DownOutlined, QuestionCircleOutlined, UpOutlined } from '@vicons/antd';
  import type { GridProps } from 'naive-ui/lib/grid';
  import type { FormActionType, FormProps, FormSchema } from './types/form';

  import { isArray } from '@/store/is';
  import { deepMerge } from '@/store/utils';
  import { groupBy } from 'lodash-es';
  import { NAutoComplete } from 'naive-ui/es/auto-complete';

  export default defineComponent({
    name: 'BasicForm',
    components: { DownOutlined, UpOutlined, QuestionCircleOutlined, NAutoComplete },
    props: {
      ...basicProps,
    },
    emits: ['reset', 'submit', 'register'],
    setup(props, { emit, attrs }) {
      const defaultFormModel = ref<Recordable>({});
      const formModel = reactive<Recordable>({});
      const propsRef = ref<Partial<FormProps>>({});
      const schemaRef = ref<Nullable<FormSchema[]>>(null);
      const formElRef = ref<Nullable<FormActionType>>(null);
      const gridCollapsed = ref(true);
      const loadingSub = ref(false);
      const isUpdateDefaultRef = ref(false);

      const getSubmitBtnOptions = computed(() => {
        return Object.assign(
          {
            size: props.size,
            type: 'primary',
          },
          props.submitButtonOptions
        );
      });

      const getResetBtnOptions = computed(() => {
        return Object.assign(
          {
            size: props.size,
            type: 'default',
          },
          props.resetButtonOptions
        );
      });

      function getComponentProps(schema) {
        const compProps = schema.componentProps ?? {};
        const component = schema.component;
        return {
          clearable: true,
          placeholder: createPlaceholderMessage(unref(component)),
          ...compProps,
        };
      }

      const getProps = computed((): FormProps => {
        const formProps = { ...props, ...unref(propsRef) } as FormProps;
        const rulesObj: any = {
          rules: {},
        };
        const schemas: any = formProps.schemas || [];
        schemas.forEach((item) => {
          if (item.rules && isArray(item.rules)) {
            rulesObj.rules[item.field] = item.rules;
          }
        });
        return { ...formProps, ...unref(rulesObj) };
      });

      const isInline = computed(() => {
        const { layout } = unref(getProps);
        return layout === 'inline';
      });

      const getGrid = computed((): GridProps => {
        const { gridProps } = unref(getProps);
        return {
          ...gridProps,
          collapsed: isInline.value ? gridCollapsed.value : false,
          responsive: 'screen',
        };
      });

      const getBindValue = computed(
        () => ({ ...attrs, ...props, ...unref(getProps) } as Recordable)
      );

      const getSchema = computed((): FormSchema[] => {
        const schemas: FormSchema[] = unref(schemaRef) || (unref(getProps).schemas as any);
        const displaySchemas = (schemas as FormSchema[]).filter(
          (it) => !it?.displayCondition || it.displayCondition(formModel)
        );
        for (const schema of schemas) {
          const { defaultValue } = schema;
          if (defaultValue) {
            schema.defaultValue = defaultValue;
          }

          schema.giProps = {
            span: 1,
          };
        }
        return displaySchemas;
      });

      const groupedSchema = computed(() => {
        return Object.entries(groupBy(getSchema.value, 'group')).map((it) => {
          const [index, t] = it;
          return {
            group: index === 'undefined' ? '基本信息' : index,
            schema: t,
          };
        });
      });

      const { handleFormValues, initDefault } = useFormValues({
        defaultFormModel,
        getSchema,
        formModel,
      });

      const { handleSubmit, validate, resetFields, getFieldsValue, clearValidate, setFieldsValue } =
        useFormEvents({
          emit,
          getProps,
          formModel,
          getSchema,
          formElRef: formElRef as Ref<FormActionType>,
          defaultFormModel,
          loadingSub,
          handleFormValues,
        });

      function unfoldToggle() {
        gridCollapsed.value = !gridCollapsed.value;
      }

      async function setProps(formProps: Partial<FormProps>): Promise<void> {
        propsRef.value = deepMerge(unref(propsRef) || {}, formProps);
      }

      const formActionType: Partial<FormActionType> = {
        getFieldsValue,
        setFieldsValue,
        resetFields,
        validate,
        clearValidate,
        setProps,
        submit: handleSubmit,
      };

      watch(
        () => getSchema.value,
        (schema) => {
          if (unref(isUpdateDefaultRef)) {
            return;
          }
          if (schema?.length) {
            initDefault();
            setTimeout(() => {
              isUpdateDefaultRef.value = true;
            }, 100);
          }
        },
        {
          flush: 'post',
        }
      );

      watch(formModel, async (value) => {
        const notify = getSchema.value.filter((it) => it?.onFormUpdate);
        for (const it of notify) {
          if (it) {
            await it?.onFormUpdate(value);
          }
        }
      });
      onMounted(() => {
        initDefault();
        emit('register', formActionType);
      });

      return {
        formElRef,
        formModel,
        getGrid,
        getProps,
        getBindValue,
        getSchema,
        getSubmitBtnOptions,
        getResetBtnOptions,
        handleSubmit,
        resetFields,
        loadingSub,
        isInline,
        getComponentProps,
        unfoldToggle,
        groupedSchema,
      };
    },
  });
</script>

<style lang="less" scoped>
  .isFull {
    width: 100%;
    justify-content: flex-start;
  }

  .unfold-icon {
    display: flex;
    align-items: center;
    height: 100%;
    margin-left: -3px;
  }
</style>
