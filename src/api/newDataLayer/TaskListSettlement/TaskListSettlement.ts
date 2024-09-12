import hillo from 'hillo';

const typeName = 'settlement';

export async function getSettlementList() {
  return (await hillo.jsonPost(typeName + '/list', {})).data.content;
}

export async function getSettlementByTaskId(id) {
  console.log(id, 'id');
  return (
    await hillo.jsonPost(typeName + '/list', {
      criteria: [
        {
          field: 'bolitaTask',
          op: 'belongs to',
          value: id,
        },
      ],
    })
  ).data.content;
}

export async function addOrUpdateSettlement(item) {
  return await hillo.jsonPost(typeName + '/addOrUpdateWithRef', {
    ...item,
  });
}

export async function deleteSettlement(id) {
  return await hillo.jsonPost(typeName + '/deleteById/' + id, {});
}
