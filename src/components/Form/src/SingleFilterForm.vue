<template>
  <n-form ref="formElRef" :model="formModel" v-bind="getBindValue">
    <div class="flex">
      <n-space wrap>
        <slot></slot>
        <template v-for="g in groupedSchema" :key="g.group">
          <template v-for="schema in g.schema" :key="schema.field">
            <div :style="schema.component === 'NDatePicker' ? 'width: 65%' : 'width: 130px'">
              <template v-if="schema.slot">
                <slot
                  :field="schema.field"
                  :model="formModel"
                  :name="schema.slot"
                  :value="formModel[schema.field]"
                ></slot>
              </template>
              <!--NCheckbox-->
              <template v-else-if="schema.component === 'NCheckbox'">
                <n-checkbox v-model:checked="formModel[schema.field]">
                  {{ schema.label }}
                </n-checkbox>
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
                    v-if="getComponentProps(schema).uploadTemplate"
                    dashed
                    type="info"
                    @click="getComponentProps(schema).uploadTemplate"
                    >下载上传模板
                  </n-button>
                </n-space>
              </template>
              <!--动态渲染表单组件-->
              <template v-else-if="schema.component === 'NAutoComplete'">
                <n-auto-complete
                  v-model:value="formModel[schema.field]"
                  :class="{ isFull: schema.isFull != false && getProps.isFull }"
                  :disabled="schema?.disableCondition && schema?.disableCondition(formModel)"
                  :get-show="() => true"
                  v-bind="getComponentProps(schema)"
                />
              </template>
              <template v-else-if="schema.component === 'NSelect'">
                <n-select
                  v-model:value="formModel[schema.field]"
                  :class="{ isFull: schema.isFull != false && getProps.isFull }"
                  :disabled="schema?.disableCondition && schema?.disableCondition(formModel)"
                  :get-show="() => true"
                  filterable
                  v-bind="getComponentProps(schema)"
                />
              </template>
              <template v-else-if="schema.component === 'NDatePicker'">
                <n-date-picker
                  v-model:value="formModel[schema.field]"
                  :type="schema.componentProps?.type"
                  size="small"
                  :start-placeholder="schema.label"
                  :end-placeholder="schema.label"
              /></template>
              <template v-else>
                <component
                  :is="schema.component"
                  v-model:value="formModel[schema.field]"
                  :class="{ isFull: schema.isFull != false && getProps.isFull }"
                  :disabled="schema?.disableCondition && schema?.disableCondition(formModel)"
                  :show-feedback="false"
                  v-bind="getComponentProps(schema)"
                />
              </template>

              <!--组件后面的内容-->
              <template v-if="schema.suffix">
                <slot
                  :field="schema.field"
                  :model="formModel"
                  :name="schema.suffix"
                  :value="formModel[schema.field]"
                ></slot>
              </template>
            </div>
            <!--判断插槽-->
          </template>
        </template>
      </n-space>

      <div class="flex-grow"></div>
      <n-space :wrap="false">
        <n-button
          v-if="getProps.showActionButtonGroup && getProps.showSubmitButton"
          :loading="loadingSub"
          size="small"
          v-bind="getSubmitBtnOptions"
          @click="handleSubmit"
          >{{ getProps.submitButtonText }}
        </n-button>
        <n-button
          v-if="getProps.showActionButtonGroup && getProps.showResetButton"
          size="small"
          v-bind="getResetBtnOptions"
          @click="resetFields"
          >{{ getProps.resetButtonText }}
        </n-button>
      </n-space>
    </div>
  </n-form>
</template>

<script lang="ts">
  import type { Ref } from 'vue';
  import {
    computed,
    defineComponent,
    onMounted,
    onUnmounted,
    reactive,
    ref,
    unref,
    watch,
  } from 'vue';
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

  export default defineComponent({
    name: 'BasicForm',
    components: { DownOutlined, UpOutlined, QuestionCircleOutlined },
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
            type: 'success',
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
        for (const schema of schemas) {
          const { defaultValue } = schema;
          // handle date type
          // dateItemType.includes(component as string)
          if (defaultValue) {
            schema.defaultValue = defaultValue;
          }
          schema.giProps = {
            span: 1,
          };
        }
        return (schemas as FormSchema[]).filter(
          (it) => !it?.displayCondition || it.displayCondition(formModel)
        );
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
            isUpdateDefaultRef.value = true;
          }
        }
      );

      watch(formModel, (value) => {
        const notify = getSchema.value.filter((it) => it?.onFormUpdate);
        notify.forEach((it) => {
          if (it) {
            it?.onFormUpdate(value);
          }
        });
      });
      onMounted(() => {
        initDefault();
        window.addEventListener('keydown', handleKeydown);
        emit('register', formActionType);
      });

      onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown);
      });

      const handleKeydown = (event) => {
        if (event.key === 'Enter') {
          handleSubmit();
        } else if (event.key === 'Escape') {
          resetFields();
        }
      };

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

<script lang="ts" setup></script>
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
