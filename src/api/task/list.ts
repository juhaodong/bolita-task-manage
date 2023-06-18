import { http } from '@/utils/http/axios';
import { OperationRequirementModel } from '@/api/operationType';

export enum TaskStatus {}

export type TaskModel = {
  id: number;
  operateTime: string;
  customerId: string;
  salesName: string;
  planAmount: number;
  finishAmount: string;
  salesType: number;
  deliveryMethod: string;
  status: string;
  salesId: string;
  deliveryDate: string;
  completionRate: string;
  note: string;
  annex: string;
  operationRequirements: OperationRequirementModel[];
  refLink: string;
};

//获取table
export function getTaskList(params) {
  return http.request({
    url: '/task/list',
    method: 'get',
    params,
  });
}
