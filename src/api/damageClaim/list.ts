import { db, executeQuery } from '@/plugins/firebase';
import { addDoc, collection, query } from 'firebase/firestore';
import { doLog } from '@/api/statusChangeLog';
import dayjs from 'dayjs';
import { resultError, resultSuccess } from '../../utils/request/_util';
import { DamageClaimStatus } from '@/api/damageClaim/serve';

export type DamageModel = {
  submitTime: string;
  orderID: number;
  deliveryMethod: string;
  trackId: number;
  goodsStatus: string;
  channelFeedback: string;
  warehouseFeedback: string;
  claimId: number;
  applicationsAmount: string;
  claimAmount: string;
  salesName: string;
  status: string;
  timeLine: string;
  annex: string;
};

const damageClaimPath = 'damageClaim';

//获取table
export async function getDamageClaimList() {
  return await executeQuery(query(collection(db, damageClaimPath)));
}

export async function creatDamageClaim(damageClaimInfo: DamageModel) {
  try {
    const info = {
      submitTime: dayjs().valueOf(),
      orderID: '',
      trackId: '',
      goodsStatus: '',
      applicationsAmount: 0,
      files: [],
      status: DamageClaimStatus.waitForAccept,
    };
    const { id } = await addDoc(
      collection(db, damageClaimPath),
      Object.assign(info, damageClaimInfo)
    );
    await doLog({
      fromStatus: '',
      toStatus: '',
      note: '',
      files: [],
      logRef: id,
    });
    return resultSuccess(id);
  } catch (e: any) {
    return resultError(e?.message);
  }
}
