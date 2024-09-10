import hillo from 'hillo';

const typeName = 'inventory';

export async function getInventoryList() {
  return (await hillo.jsonPost(typeName + '/list', {})).data.content;
}

export async function getInventoryById(id) {
  return (
    await hillo.jsonPost(typeName + '/list', {
      criteria: [
        {
          field: 'id',
          op: '==',
          value: id,
        },
      ],
    })
  ).data.content[0];
}

export async function getInventoryByName(name) {
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

export async function addOrUpdateInventory(item) {
  return await hillo.jsonPost(typeName + '/addOrUpdate', {
    ...item,
  });
}

export async function deleteInventory(id) {
  return await hillo.jsonPost(typeName + '/deleteById/' + id, {});
}

export async function getWarehouseNameById(id) {
  console.log(id, 'id');
  return (await getInventoryById(id)).name;
}

export async function getCurrentWarehouseUseTimespan(id) {
  return await getInventoryById(id);
}

export function generateOptionFromTimeSpan(arr?: any[]) {
  console.log(arr, 'arr');
  // const currentList = arr.split(',');
  // return (
  //   currentList?.map((it) => ({
  //     label: it,
  //     value: it,
  //   })) ?? []
  // );
}
