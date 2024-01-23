import dayjs from 'dayjs';

export function OneYearMonthTab() {
  const currentMonth = dayjs();
  const monthArray = [];
  for (let i = 0; i < 12; i++) {
    const getMonth = currentMonth.subtract(i, 'month').format('YYYY-MM');
    monthArray.push(getMonth);
  }
  console.log(monthArray, 'array');
  return monthArray;
}
