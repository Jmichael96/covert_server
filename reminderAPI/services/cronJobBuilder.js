// const dateText = '2017-05-09T01:30:00.123Z';
// const date = new Date(dateText);

// const cron = dateToCron(date);
module.exports = (date) => {
  const minutes = date.getMinutes();
  const hours = date.getHours();
  const days = date.getDate();
  const months = date.getMonth() + 1;
  const dayOfWeek = date.getDay();

  return `${minutes} ${hours} ${days} ${months} ${dayOfWeek}`;
};
