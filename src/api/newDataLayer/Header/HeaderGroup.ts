import hillo from 'hillo';

const typeName = 'tableHeader';

export async function getTableHeaderGroupItemList(name) {
  return (
    await hillo.jsonPost(typeName + '/list', {
      criteria: [
        {
          field: 'name',
          op: '==',
          value: name,
        },
      ],
    })
  ).data.content[0];
}

export async function addOrUpdateTableHeaderGroupItem(item) {
  return await hillo.jsonPost(typeName + '/addOrUpdateWithItemIds', {
    ...item,
  });
}

export async function deleteTableHeaderGroupItem(id) {
  return await hillo.jsonPost(typeName + '/deleteById/' + id, {});
}
