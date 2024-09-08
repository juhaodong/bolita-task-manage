import hillo from 'hillo';

const typeName = 'tableHeaderItem';

export async function getTableHeaderItemList() {
  return (await hillo.jsonPost(typeName + '/list', {})).data.content;
}

export async function addOrUpdateTableHeaderItem(item) {
  return await hillo.jsonPost(typeName + '/addOrUpdate', {
    ...item,
  });
}

export async function deleteTableHeaderItem(id) {
  return await hillo.jsonPost(typeName + '/deleteById/' + id, {});
}
