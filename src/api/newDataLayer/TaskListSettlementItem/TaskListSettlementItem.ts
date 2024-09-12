import hillo from 'hillo';

const typeName = 'settlementItem';

export async function getSettlementItem() {
  return (await hillo.jsonPost(typeName + '/list', {})).data.content;
}

export async function addOrUpdateSettlementItem(item) {
  return await hillo.jsonPost(typeName + '/addOrUpdateWithRef', {
    ...item,
  });
}

export async function deleteSettlementItem(id) {
  return await hillo.jsonPost(typeName + '/deleteById/' + id, {});
}
