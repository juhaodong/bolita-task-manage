import { h } from 'vue';
import dayjs from 'dayjs';

export function getTimeColumn(p: { key: string; title: string }) {
  return {
    title: p.title,
    key: p.key,
    render(data) {
      return h('div', {}, [dayjs(data[p.key]).format('YYYY-MM-DD HH:mm')]);
    },
  };
}
