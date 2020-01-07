import moment from 'moment';

export const formatLefttime = (seconds: number) => {
  let lefttime = seconds;

  const days = Math.floor(lefttime / (3600 * 24));
  lefttime  -= days * 3600 * 24;

  const hrs   = Math.floor(lefttime / 3600);
  lefttime  -= hrs * 3600;

  const mnts = Math.floor(lefttime / 60);

  if (days > 0) {
    return `${days} days`;
  }
  if (days === 0 && hrs > 0) {
    return `${hrs} hours`;
  }
  if (days === 0 && hrs === 0 && mnts > 0) {
    return `${mnts} minutes`;
  }
  return 0;
};

export const calculateLefttime = (time: any) => {
  const momentTime = moment(time);
  const now = moment();
  const secondsDiff = momentTime.diff(now, 'seconds');
  const lefttime = secondsDiff > 0 ? `${formatLefttime(Math.abs(secondsDiff))} left` : `${formatLefttime(Math.abs(secondsDiff))} overdue`;
  return lefttime;
};
