import hillo from 'hillo';

const typeName = 'customer';

export async function getCustomerList() {
  return (await hillo.jsonPost(typeName + '/list', {})).data.content;
}

export async function getCustomerById(id) {
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

export async function getCustomerListByIds(ids) {
  return (
    await hillo.jsonPost(typeName + '/list', {
      criteria: [
        {
          field: 'id',
          op: 'in',
          value: ids,
        },
      ],
    })
  ).data.content;
}

export async function addOrUpdateCustomer(item) {
  return await hillo.jsonPost(typeName + '/addOrUpdateWithRef', {
    ...item,
  });
}

export async function deleteCustomer(id) {
  return await hillo.jsonPost(typeName + '/deleteById/' + id, {});
}
