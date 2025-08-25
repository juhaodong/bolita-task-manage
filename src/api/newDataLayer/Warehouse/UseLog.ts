import hillo from 'hillo';
import dayjs from 'dayjs';

const typeName = 'inventoryUseLog';

export async function getInventoryUseLogList() {
  return (await hillo.jsonPost(typeName + '/list', {})).data.content;
}

export async function getInventoryUseLogListByInventoryId(id, date) {
  console.log(date, 'date');
  const startDate = dayjs(date).startOf('day').format('YYYY-MM-DD') + 'T00:00:00';
  const endDate = dayjs(date).endOf('day').format('YYYY-MM-DD') + 'T23:59:59';

  return (
    await hillo.jsonPost(typeName + '/search', {
      minUseAtTimestamp: startDate,
      maxUseAtTimestamp: endDate,
      inventoryId: id,
    })
  ).data.rows;
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

export async function deleteInventoryLog(id) {
  return await hillo.jsonPost(typeName + '/deleteById/' + id, {});
}

export async function getInventoryUseLogListByNotifyId(notifyId) {
  return (
    await hillo.jsonPost(typeName + '/search', {
      criteria: [
        {
          field: 'notifyId',
          op: '==',
          value: notifyId,
        },
      ],
    })
  ).data;
}
