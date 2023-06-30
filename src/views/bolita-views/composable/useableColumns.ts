import { h } from 'vue';

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

function pickColor(str) {
  return `hsl(${hashCode(str) % 360}, 100%, 80%)`;
}

export const statusColumn = {
  title: '状态',
  key: 'status',
  render(record) {
    return h(
      'div',
      {
        style: 'padding:4px; border-radius:4px;' + 'background:' + pickColor(record.status),
      },
      record.status
    );
  },
};
