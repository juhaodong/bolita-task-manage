import { h } from 'vue';
import dayjs from 'dayjs';

const standardDateFormat = 'YYYY-MM-DD/HH:mm';
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

export function timeColumn(keyName = 'createTimestamp', title = '创建时间') {
  return {
    title: title,
    key: keyName,
    width: 160,
    render(record) {
      return h('div', dayjs(record[keyName]).format(standardDateFormat));
    },
  };
}
