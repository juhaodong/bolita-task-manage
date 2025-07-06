import { Component, h } from 'vue';
import dayjs from 'dayjs';
import { useUploadDialog } from '@/store/modules/uploadFileState';
import { RouterLink } from 'vue-router';
import { NDatePicker, NInput, NText } from 'naive-ui';
import { safeParseInt } from '@/store/utils/utils';
import { hasAuthPower } from '@/api/dataLayer/common/power';
import { addOrUpdateWithRefOutboundForecast } from '@/api/newDataLayer/OutboundForecast/OutboundForecast';

export const standardDateFormat = 'YYYY-MM-DD/HH:mm';
export const dateFormat = 'DD/MM/YYYY';

export function getDateNow() {
  return dayjs().format(dateFormat);
}

export function timeDisplay(time) {
  return dayjs(time).format(standardDateFormat);
}

export function timeDisplayYMD(time) {
  if (time) {
    time = parseFloat(time);
    return dayjs(time).format('YYYY-MM-DD');
  } else {
    return '';
  }
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

function pickColor(str) {
  return `hsl(${hashCode(str) % 360}, 100%, 95%)`;
}

function pickBorderColor(str) {
  return `hsl(${hashCode(str) % 360}, 100%, 80%)`;
}

export function colorColumn(
  key = 'inStatus',
  title = '入库状态',
  formatter: (record: any) => string
) {
  return {
    title: title,
    key: key,
    render(record) {
      const display = formatter(record);
      return colorfulRender(display);
    },
  };
}

export function timeWarnColumn(key = 'usefulTimeRange', title = '时效') {
  return {
    title: title,
    key: key,
    render(record) {
      const display = record.usefulTimeRange ?? '';
      return timeWarnColorfulRender(display);
    },
  };
}

export const timeWarnList = [
  { label: '红色', value: '红色' },
  { label: '黄色', value: '黄色' },
  { label: '绿色', value: '绿色' },
];

export function storageTimeWarnColumn(key = 'stayTime', title = '留仓时间') {
  return {
    title: title,
    key: key,
    render(record) {
      const display = record.stayTime ?? '';
      return inStorageWarnColorfulRender(display);
    },
  };
}

const timeWarnColorfulRender = (text) =>
  text
    ? h(
        'div',
        {
          style: {
            width: 'min-content',
            fontSize: '20px',
            padding: '2px 4px',
            background: text >= 15 ? '#EF5350' : text >= 7 && text < 15 ? '#FFFF00' : '#76FF03',
            border: '1px solid ',
          },
          class: 'whitespace-nowrap',
        },
        text
      )
    : h('div');

const inStorageWarnColorfulRender = (text) =>
  text
    ? h(
        'div',
        {
          style: {
            width: 'min-content',
            fontSize: '20px',
            padding: '2px 4px',
            background: text >= 15 ? '#EF5350' : '#76FF03',
            border: '1px solid ',
          },
          class: 'whitespace-nowrap',
        },
        text
      )
    : h('div');

export function statusColumn(title = '状态', key = 'status') {
  return {
    title: title,
    key: key,
    render(record) {
      return colorfulRender(record?.[key] ?? '');
    },
  };
}

export function statusColumnEasy(params: { title: string; key: string }) {
  return statusColumn(params.title, params.key);
}

const colorfulRender = (text) =>
  text
    ? h(
        'div',
        {
          style: {
            width: 'min-content',
            fontSize: '10px',
            padding: '2px 4px',
            background: pickColor(text),
            border: '1px solid ' + pickBorderColor(text),
          },
          class: 'whitespace-nowrap',
        },
        text
      )
    : h('div');

export const textRender = (text) =>
  h(
    'div',
    {
      style: {
        width: 'min-content',
      },
      class: 'whitespace-nowrap',
    },
    text
  );

export function idColumn(title = 'ID', targetPage, keyName = 'id') {
  return {
    title: title,
    key: keyName,
    width: 60,
    render(record) {
      return h(
        RouterLink,
        {
          to: targetPage + '?' + keyName + '=' + record[keyName],
        },
        () =>
          h(
            NText,
            {
              underline: true,
              type: 'info',
            },
            () => record[keyName]
          )
      );
    },
  };
}

export function selectedIdColumn(title, targetPage, keyName) {
  return {
    title: title,
    key: keyName,
    width: 200,
    render(record) {
      return h(
        RouterLink,
        {
          to: targetPage + '?' + keyName + '=' + record[keyName],
        },
        () =>
          h(
            NText,
            {
              underline: true,
              type: 'info',
            },
            () => record[keyName]
          )
      );
    },
  };
}

export function timeColumn(
  keyName = 'createTimestamp',
  title = '创建时间',
  timeFormat = dateFormat
) {
  return {
    title: title,
    key: keyName,
    component: NDatePicker,
    componentProps: {
      type: 'daterange',
      clearable: true,
    },
    width: 110,
    render(record) {
      const display = record[keyName] ? dayjs(record[keyName]).format(timeFormat) : '-';
      return h('div', display);
    },
  };
}

export function timeAndDateColumn(
  keyName = 'createTimestamp',
  title = '创建时间',
  timeFormat = standardDateFormat
) {
  return {
    title: title,
    key: keyName,
    width: 110,
    render(record) {
      const display = record[keyName] ? dayjs(record[keyName]).format(timeFormat) : '-';
      return h('div', display);
    },
  };
}

export function timeTableColumn(keyName, title, timeFormat = dateFormat) {
  return {
    title: title,
    key: keyName,
    width: 200,
    render(record) {
      const display = record[keyName] ? dayjs(parseInt(record[keyName])).format(timeFormat) : '-';
      return h('div', display);
    },
  };
}

export function formatColumn(keyName: string, title: string, formatter: (record: any) => string) {
  return {
    title: title,
    key: keyName,
    render(record) {
      const display = formatter(record);
      if (!display) {
        return h('div', ' - ');
      }
      return h('div', display);
    },
  };
}

export function joinDisplayColumn(
  keyName: string,
  title: string,
  joinedKeys: string[],
  joinString = ','
) {
  return {
    title: title,
    key: keyName,
    render(record) {
      const display = joinedKeys.map((it) => record[it]);
      if (display.some((it) => !it)) {
        return h('div', ' - ');
      }
      return h('div', display.join(joinString));
    },
  };
}

export function communicateColumn(keyName = 'createTimestamp', title = '创建时间') {
  return {
    title: title,
    key: keyName,
    width: 160,
    render(record) {
      const display =
        record[keyName] === '' ? dayjs(record[keyName]).format(standardDateFormat) : '-';
      return h('div', display);
    },
  };
}

export function editableColumn(
  colInfo: { title: string; key: string; width?: number; disabled: boolean },
  data
) {
  let { title, key, width, disabled } = colInfo;
  if (!disabled) {
    disabled = false;
  }
  return {
    title,
    key,
    width,
    maxWidth: 140,
    render(row, index) {
      return h(NInput, {
        value: row[key],
        size: 'small',
        style: 'font-size:10px !important',
        onUpdateValue(v) {
          data[index][key] = v;
        },
        disabled: disabled,
      });
    },
  };
}

export function getFileActionButton(
  label: string,
  key: string,
  manager: Function,
  reload: any,
  record: any,
  icon?: Component,
  power?: string,
  editable = true,
  permissions = null
) {
  return {
    label,
    icon: icon ?? null,
    highlight: () => {
      return record?.[key]?.length > 0 ? 'success' : 'default';
    },
    ifShow: () => {
      return hasAuthPower(power);
    },
    async onClick() {
      const upload = useUploadDialog();
      const files = await upload.upload(record[key], undefined, editable);
      if (files.checkPassed) {
        record[key] = files.files;
        record.customerId = record.customer.id;
        record.inventoryId = record.inventory.id;
        await manager(record);
      }
      reload();
    },
    permissions: permissions,
  };
}

export function getFileActionButtonByOutForecast(
  label: string,
  key: string,
  reload: any,
  record: any,
  icon?: Component,
  editable = true,
  permissions = null
) {
  return {
    label,
    icon: icon ?? null,
    highlight: () => {
      return record?.[key]?.length > 0 ? 'success' : 'default';
    },
    async onClick() {
      const upload = useUploadDialog();
      const files = await upload.upload(record[key], undefined, editable);
      if (files.checkPassed) {
        record[key] = files.files;
        await addOrUpdateWithRefOutboundForecast(record);
      }
      reload();
    },
    permissions: permissions,
  };
}

export const sizeColumn = joinDisplayColumn(
  'containerStandards',
  '外箱规格',
  ['length', 'width', 'height'],
  '*'
);

export function compareStatus(currentValue: string, limitValue: string) {
  if (safeParseInt(currentValue) == safeParseInt(limitValue)) {
    return 'success';
  } else {
    return safeParseInt(currentValue) > safeParseInt(limitValue) ? 'error' : 'warning';
  }
}

export function sizeColumns() {
  return [
    sizeColumn,
    {
      title: '重量kg',
      key: 'weightKg',
      width: 60,
    },
    {
      title: '体积',
      key: 'volume',
      width: 60,
    },
  ];
}
