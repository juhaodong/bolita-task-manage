import hillo from 'hillo';

const typeName = 'user';

export async function getUserList() {
  return (await hillo.jsonPost(typeName + '/search', {})).data.content;
}

export async function getUserById(id) {
  return (
    await hillo.jsonPost(typeName + '/searchOne', {
      id,
    })
  ).data;
}

export async function getUserByLoginName(name) {
  return (
    await hillo.jsonPost(typeName + '/searchOne', {
      loginName: name,
    })
  ).data;
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
