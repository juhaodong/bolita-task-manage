import { ResultEnum } from '@/store/enums/httpEnum';

export function resultSuccess<T>(result: T, { message = 'ok' } = {}): Result<T> {
  return {
    code: 200,
    result,
    message,
    type: ResultEnum.TYPE,
  };
}

export type Result<T> = {
  code: number;
  result: T;
  message: string;
  type: ResultEnum;
};

export function resultPageSuccess<T = any>(
  page: number,
  pageSize: number,
  list: T[],
  { message = 'ok' } = {}
) {
  const pageData = pagination(page, pageSize, list);

  return {
    ...resultSuccess({
      page,
      pageSize,
      pageCount: list.length,
      list: pageData,
    }),
    message,
  };
}

export function resultError(
  message = 'Request failed',
  { code = -1, result = null } = {}
): Result<any> {
  return {
    code,
    result,
    message,
    type: ResultEnum.ERROR_MESSAGE,
  };
}

export function pagination<T = any>(pageNo: number, pageSize: number, array: T[]): T[] {
  const offset = (pageNo - 1) * Number(pageSize);
  const ret =
    offset + Number(pageSize) >= array.length
      ? array.slice(offset, array.length)
      : array.slice(offset, offset + Number(pageSize));
  return ret;
}

/**
 * @param {Number} times 回调函数需要执行的次数
 * @param {Function} callback 回调函数
 */
export function doCustomTimes(times: number, callback: any) {
  let i = -1;
  while (++i < times) {
    callback(i);
  }
}

export interface requestParams {
  method: string;
  body: any;
  headers?: { token?: string };
  query: any;
}

/**
 * @description 本函数用于从request数据中获取token，请根据项目的实际情况修改
 *
 */
export function getRequestToken({ headers }: requestParams): string | undefined {
  return headers?.token;
}
