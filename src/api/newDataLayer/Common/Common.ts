export const timeArrays = new Array(48).fill(['', '']).map((item, index) => {
  const startVal = index * 30;
  const startHour = Math.floor(startVal / 60);
  const startMinute = startVal % 60;
  const startTime =
    (startHour < 10 ? '0' + startHour : startHour) + ':' + (startMinute === 0 ? '00' : startMinute);
  return {
    start: startTime,
  };
});
