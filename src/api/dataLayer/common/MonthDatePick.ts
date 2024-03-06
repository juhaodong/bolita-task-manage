import dayjs from 'dayjs';

export function OneYearMonthTab() {
  const currentMonth = dayjs();
  const monthArray = [];
  for (let i = 0; i < 12; i++) {
    const getMonth = currentMonth.subtract(i, 'month').format('YYYY-MM');
    monthArray.push(getMonth);
  }
  return monthArray;
}

export function dateCompare(dateKey) {
  return (a, b) => {
    return Date.parse(b[dateKey]) - Date.parse(a[dateKey]);
  };
}

export function dayjsDateByYMD(item) {
  return dayjs(item).format('YYYY-MM-DD');
}
