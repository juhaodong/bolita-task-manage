export interface BasicModel {
  id?: string;
  customerId: string;
  warehouseId?: string;
  createTimestamp: number;
  note: string;
  files?: string[];
}
