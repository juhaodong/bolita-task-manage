import dayjs from 'dayjs';

export const valueOfToday = [dayjs().startOf('day').valueOf(), dayjs().endOf('day').valueOf()];

export const defaultToday = [dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')];
