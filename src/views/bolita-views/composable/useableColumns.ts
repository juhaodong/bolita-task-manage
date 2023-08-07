import { Component, h } from 'vue';
import dayjs from 'dayjs';
import { useUploadDialog } from '@/store/modules/uploadFileState';
import { RouterLink } from 'vue-router';
import { NInput, NText } from 'naive-ui';
import { generalUpdate } from '@/api/dataLayer/common/GeneralModel';

export const standardDateFormat = 'YYYY-MM-DD/HH:mm';
export const dateFormat = 'DD/MM/YYYY';

export function getDateNow() {
  return dayjs().format(dateFormat);
}

export function timeDisplay(time) {
  return dayjs(time).format(standardDateFormat);
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
export function statusColumn(title = '状态', key = 'status') {
  return {
    title: title,
    key: key,
    render(record) {
      return colorfulRender(record[key]);
    },
  };
}

const colorfulRender = (text) =>
  h(
    'div',
    {
      style: {
        fontSize: '14px',
        padding: '2px 4px',
        background: pickColor(text),
        border: '1px solid ' + pickBorderColor(text),
      },
    },
    text
  );

export function idColumn(title = 'ID', targetPage, keyName = 'id') {
  return {
    title: title,
    key: keyName,
    width: 110,
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
    width: 110,
    render(record) {
      const display = record[keyName] ? dayjs(record[keyName]).format(timeFormat) : '-';
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
      const display = record[keyName] ? dayjs(record[keyName]).format(standardDateFormat) : '-';
      return h('div', display);
    },
  };
}

export function editableColumn(colInfo: { title: string; key: string }, data) {
  const { title, key } = colInfo;
  return {
    title,
    key,
    render(row, index) {
      return h(NInput, {
        value: row[key],
        onUpdateValue(v) {
          data[index][key] = v;
        },
      });
    },
  };
}

export function getFileActionButton(
  label: string,
  key: string,
  collection: string,
  reload: any,
  record: any,
  icon?: Component
) {
  return {
    label,
    icon: icon ?? null,
    highlight: () => {
      return record?.[key]?.length > 0;
    },
    async onClick() {
      const upload = useUploadDialog();
      const files = await upload.upload(record[key]);
      if (files.checkPassed) {
        const obj = {};
        obj[key] = files.files;
        await generalUpdate(obj, collection, record.id);
      }

      reload();
    },
  };
}

export const sizeColumn = joinDisplayColumn(
  'containerStandards',
  '外箱规格',
  ['length', 'width', 'height'],
  '*'
);
