import hillo from 'hillo';

const typeName = 'customer';

export async function getCustomerList() {
  return (await hillo.jsonPost(typeName + '/search', {})).data.rows;
}

export async function getCustomerById(id) {
  return (
    await hillo.jsonPost(typeName + '/searchOne', {
      id,
    })
  ).data.rows;
}

export async function getCustomerListByIds(ids) {
  return (
    await hillo.jsonPost(typeName + '/search', {
      criteria: [
        {
          field: 'id',
          op: 'in',
          value: ids,
        },
        {
          field: 'status',
          op: '!=',
          value: '停止',
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
