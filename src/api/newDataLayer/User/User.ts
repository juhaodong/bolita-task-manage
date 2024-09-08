import hillo from 'hillo';

const typeName = 'user';

export async function getUserList() {
  return (await hillo.jsonPost(typeName + '/list', {})).data.content;
}

export async function getUserById(id) {
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

export async function getUserByLoginName(name) {
  return (
    await hillo.jsonPost(typeName + '/list', {
      criteria: [
        {
          field: 'loginName',
          op: '==',
          value: name,
        },
      ],
    })
  ).data.content[0];
}

export async function addOrUpdateUser(item) {
  return await hillo.jsonPost(typeName + '/addOrUpdateWithPowerTypeItemIds', {
    ...item,
  });
}

export async function deleteUser(id) {
  return await hillo.jsonPost(typeName + '/deleteById/' + id, {});
}

export async function getUserNameById(id) {
  return (await getUserById(id)).realName;
}
