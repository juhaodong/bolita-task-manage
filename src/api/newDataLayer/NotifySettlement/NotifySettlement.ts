import hillo from 'hillo';

const typeName = 'notifySettlement';

export async function getNotifySettlement() {
  return (await hillo.jsonPost(typeName + '/list', {})).data.content;
}

export async function getNotifySettlementByNotifyId(id) {
  return (
    await hillo.jsonPost(typeName + '/list', {
      criteria: [
        {
          field: 'notify.id',
          op: '==',
          value: id,
        },
      ],
    })
  ).data.content;
}

export async function addOrUpdateNotifySettlement(item) {
  return await hillo.jsonPost(typeName + '/addOrUpdateWithRef', {
    ...item,
  });
}

export async function deleteNotifySettlement(id) {
  return await hillo.jsonPost(typeName + '/deleteById/' + id, {});
}
