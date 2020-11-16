export const formatDuration = (secondsTotal: number): string => {
  const hours = Math.floor(secondsTotal / 3600);
  const minutes = Math.floor(secondsTotal / 60) % 60;
  const seconds = secondsTotal % 60;

  return [
    hours + '',
    String(minutes).padStart(hours > 0 ? 2 : 1, '0'),
    String(seconds).padStart(2, '0'),
  ]
    .filter((v, i) => v !== '0' || i > 0)
    .join(':');
};
