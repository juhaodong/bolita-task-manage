import { addDoc, collection, doc, query, setDoc } from 'firebase/firestore';
import { db, executeQuery, getDocContent, getFileListUrl } from '@/plugins/firebase';
import { doLog } from '@/api/statusChangeLog';
import { resultError, resultSuccess } from '../../utils/request/_util';
import {
  LogisticAmazonDetail,
  LogisticBoxDetail,
  LogisticModel,
  LogisticOtherTrayDetail,
  LogisticStatus,
  LogisticType,
} from '@/api/deliveryMethod/logistic-type';
import dayjs from 'dayjs';
import { UploadFileInfo } from 'naive-ui';
import { DeliveryMethod } from '@/api/deliveryMethod/index';

const path = 'logistic';
const ref = collection(db, path);

export async function getLogisticList(params) {
  console.log(params);
  return await executeQuery(query(ref));
}

export async function changeLogisticStatus(id: string, newStatus: LogisticStatus) {
  try {
    const currentModel = await getLogisticInfoById(id);
    await setDoc(doc(ref, id), { status: newStatus }, { merge: true });
    await doLog({
      files: [],
      fromStatus: currentModel.status,
      logRef: id,
      note: '',
      toStatus: newStatus,
    });
  } catch (e: any) {
    return resultError(e?.message);
  }
}

export async function changeLogisticPrice(id: string, price: string) {
  try {
    const currentModel = await getLogisticInfoById(id);
    await setDoc(
      doc(ref, id),
      { status: LogisticStatus.WaitForPriceConfirm, price },
      { merge: true }
    );
    await doLog({
      files: [],
      fromStatus: currentModel.status,
      logRef: id,
      note: '报价变更为' + price,
      toStatus: LogisticStatus.WaitForPriceConfirm,
    });
    return resultSuccess('');
  } catch (e: any) {
    return resultError(e?.message);
  }
}

interface LogisticFeedBackDTO {
  feedBackFiles: UploadFileInfo[];
  orderNo: string;
  pickupDate: number;
  amazonReservationNo?: string;
}
export async function submitLogisticFeedBack(id: string, info: LogisticFeedBackDTO) {
  try {
    const currentModel = await getLogisticInfoById(id);
    if (currentModel.logisticType === LogisticType.AmazonTray) {
      (currentModel.logisticDetail as LogisticAmazonDetail).amazonReservationNo =
        info?.amazonReservationNo ?? '';
    }
    const feedBackFiles = await getFileListUrl(info.feedBackFiles);
    await setDoc(
      doc(ref, id),
      {
        status: LogisticStatus.ReadyToSend,
        logisticDetail: currentModel.logisticDetail,
        feedBackFiles,
        orderNo: info.orderNo,
        pickupDate: info.pickupDate,
      },
      { merge: true }
    );
    await doLog({
      files: feedBackFiles,
      fromStatus: currentModel.status,
      logRef: id,
      note: '物流人员提交了反馈。',
      toStatus: LogisticStatus.WaitForPriceConfirm,
    });
    return resultSuccess('');
  } catch (e: any) {
    return resultError(e?.message);
  }
}

export async function sendOutLogistic(
  id: string,
  info: { transferTray?: string; pickupFile: UploadFileInfo[] }
) {
  try {
    const currentModel = await getLogisticInfoById(id);
    if (
      currentModel.logisticType === LogisticType.AmazonTray ||
      currentModel.logisticType == LogisticType.OtherTray
    ) {
      (currentModel.logisticDetail as LogisticAmazonDetail | LogisticOtherTrayDetail).transferTray =
        info?.transferTray ?? '';
    }
    const pickupFile = await getFileListUrl(info.pickupFile);
    await setDoc(
      doc(ref, id),
      {
        status: LogisticStatus.Sent,
        logisticDetail: currentModel.logisticDetail,
        pickupFile,
      },
      { merge: true }
    );
    await doLog({
      files: pickupFile,
      fromStatus: currentModel.status,
      logRef: id,
      note: '物流已上传提货单。',
      toStatus: LogisticStatus.WaitForPriceConfirm,
    });
    return resultSuccess('');
  } catch (e: any) {
    return resultError(e?.message);
  }
}

export async function finishLogistic(
  id: string,
  info: { deliveryCompany: string; podFile: UploadFileInfo[] }
) {
  try {
    const currentModel = await getLogisticInfoById(id);
    const podFile = await getFileListUrl(info.podFile);
    await setDoc(
      doc(ref, id),
      {
        status: LogisticStatus.Finished,
        deliveryCompany: info.deliveryCompany,
        podFile,
      },
      { merge: true }
    );
    await doLog({
      files: podFile,
      fromStatus: currentModel.status,
      logRef: id,
      note: '物流已上传POD。',
      toStatus: LogisticStatus.WaitForPriceConfirm,
    });
    return resultSuccess('');
  } catch (e: any) {
    return resultError(e?.message);
  }
}

export async function getLogisticInfoById(id: string): Promise<LogisticModel> {
  return await getDocContent(doc(ref, id));
}

export interface CreateLogisticDTO {
  files?: string[];
  boxCount: number;
  deliveryMethod: DeliveryMethod;
  logisticDetail: LogisticAmazonDetail | LogisticBoxDetail | LogisticOtherTrayDetail;
  logisticType: LogisticType;
}
export async function createLogistic(model: CreateLogisticDTO) {
  try {
    const info = {
      files: [],
      note: '',
      orderDate: dayjs().valueOf(),
      orderNo: '',
      pickupFile: '',
      status: LogisticStatus.NotSubmit,
    };
    if (model.logisticType === LogisticType.OtherTray) {
      (model.logisticDetail as LogisticOtherTrayDetail).trayInfo = {
        height: model.logisticDetail['trayInfo.height'],
        length: model.logisticDetail['trayInfo.length'],
        trayType: model.logisticDetail['trayInfo.trayType'],
        weight: model.logisticDetail['trayInfo.weight'],
        width: model.logisticDetail['trayInfo.width'],
      };
    }

    const { id } = await addDoc(ref, Object.assign(info, model));

    await doLog({
      fromStatus: '',
      toStatus: LogisticStatus.NotSubmit,
      note: '',
      files: [],
      logRef: id,
    });
    return resultSuccess(id);
  } catch (e: any) {
    return resultError(e?.message);
  }
}
