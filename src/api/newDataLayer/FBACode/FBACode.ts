import hillo from 'hillo';

const typeName = 'fbacode';

export async function getFBACodeList() {
  return (await hillo.jsonPost(typeName + '/list', {})).data.content;
}

export async function getFBACodeListByFilter(filter, pagination) {
  return (
    await hillo.jsonPost(typeName + '/list', {
      ...pagination,
      criteria: filter,
    })
  ).data;
}

export async function getFbaCodeById(id) {
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

export async function addOrUpdateFBACode(item) {
  return await hillo.jsonPost(typeName + '/addOrUpdate', {
    ...item,
  });
}

export async function deleteFBACode(id) {
  return await hillo.jsonPost(typeName + '/deleteById/' + id, {});
}

export async function deleteFbaCodeAll() {
  return await hillo.jsonPost(typeName + '/deleteAll', {});
}
