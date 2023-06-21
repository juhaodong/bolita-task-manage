import Mock from 'mockjs';
import { resultSuccess } from '../_util';

const token = Mock.Random.string('upper', 32, 32);

export default [
  {
    url: '/api/login',
    timeout: 1000,
    method: 'post',
    response: () => {
      return resultSuccess({ token });
    },
  },
];
