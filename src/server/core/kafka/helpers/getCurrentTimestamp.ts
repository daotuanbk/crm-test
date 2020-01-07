import dayjs from 'dayjs';

export const getCurrentTimestamp = (): string =>
  dayjs()
    .valueOf()
    .toString();
