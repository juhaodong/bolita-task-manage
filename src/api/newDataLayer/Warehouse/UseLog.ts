import hillo from 'hillo';
import dayjs from 'dayjs';

const typeName = 'inventoryUseLog';

export async function getInventoryUseLogList() {
  return (await hillo.jsonPost(typeName + '/list', {})).data.content;
}

export async function getInventoryUseLogListByInventoryId(id, date) {
  const startDate = dayjs(date).startOf('day').valueOf();
  const endDate = dayjs(date).endOf('day').valueOf();
  return (
    await hillo.jsonPost(typeName + '/list', {
      criteria: [
        {
          field: 'inventoryId',
          op: '==',
          value: id,
        },
        {
          field: 'useAtTimestamp',
          op: '>=',
          value: startDate,
        },
        {
          field: 'useAtTimestamp',
          op: '<=',
          value: endDate,
        },
      ],
    })
  ).data.content;
}

export async function addOrUpdateInventoryUseLog(item) {
  return await hillo.jsonPost(typeName + '/addOrUpdate', {
    ...item,
  });
}

export function getCurrentLogTime(date, time) {
  const currentDate = dayjs(date).format('YYYY-MM-DD');
  const res = dayjs(currentDate + ' ' + time).format('YYYY-MM-DD HH:mm:ss');
  return Date.parse(res);
}
