import hillo from 'hillo';

const loginPath = 'login';

export async function loginNew(loginName, password) {
  return (
    await hillo.jsonPost('https://bolita-test.aaden.io/' + loginPath + '/doLogin', {
      loginName,
      password,
    })
  )?.data;
}
