import { NIcon, NTooltip } from 'naive-ui';
import { h } from 'vue';

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

export const renderIconWithTooltip = (icon, tooltip) => {
  return () =>
    h(
      NTooltip,
      { trigger: 'hover', placement: 'top' },
      {
        trigger: () =>
          h(
            NIcon,
            { size: 18, class: 'action-icon', style: 'box-shadow: none !important;' },
            { default: () => h(icon) }
          ),
        default: () => tooltip,
      }
    );
};
