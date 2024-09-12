import hillo from 'hillo';

const typeName = 'mergeTaskSettlement';

export async function getTaskListTimeLine() {
  return (await hillo.jsonPost(typeName + '/list', {})).data.content;
}

export async function addOrUpdateTaskTimeLine(item) {
  return await hillo.jsonPost(typeName + '/addOrUpdateWithRef', {
    ...item,
  });
}

export async function deleteTaskTimeLine(id) {
  return await hillo.jsonPost(typeName + '/deleteById/' + id, {});
}
