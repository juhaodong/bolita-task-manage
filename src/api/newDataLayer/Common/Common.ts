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

export function createPaginationPlaceholders(pageNumber, pageSize, totalCount) {
  let fakeListStart = [];
  let fakeListEnd = [];

  // Create placeholders for previous pages
  if (pageNumber > 0) {
    fakeListStart = Array(pageNumber * pageSize)
      .fill(null)
      .map((_, index) => ({ key: index }));
  }

  // Create placeholders for remaining pages
  if (pageSize < totalCount) {
    const remainingItems = totalCount - pageSize * (pageNumber + 1);
    if (remainingItems > 0) {
      fakeListEnd = Array(remainingItems)
        .fill(null)
        .map((_, index) => ({ key: index }));
    }
  }

  return { fakeListStart, fakeListEnd };
}

export function getQuery(pagination) {
  const pageNumber = pagination.pageNumber;
  const pageSize = pagination.pageSize;
  return '?pageNumber=' + pageNumber + '&pageSize=' + pageSize;
}
