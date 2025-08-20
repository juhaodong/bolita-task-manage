import hillo from 'hillo';

const loginPath = 'login';

export async function loginNew(loginName, password) {
  return (
    await hillo.jsonPost(loginPath + '/doLogin', {
      loginName,
      password,
    })
  )?.data;
}
