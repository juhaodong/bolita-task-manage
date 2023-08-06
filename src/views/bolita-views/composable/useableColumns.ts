import { h } from 'vue';
import dayjs from 'dayjs';

export const standardDateFormat = 'YYYY-MM-DD/HH:mm';
export const dateFormat = 'DD/MM/YYYY';

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

export const statusColumn = {
  title: '状态',
  key: 'status',
  render(record) {
    return h(
      'div',
      {
        style: {
          fontSize: '14px',
          padding: '2px 4px',
          background: pickColor(record.status),
          border: '1px solid ' + pickBorderColor(record.status),
        },
      },
      record.status
    );
  },
  width: 140,
};

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
