const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-');
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const weekDays = current => {
  var week = new Array();
  // Starting Monday not Sunday
  current.setDate((current.getDate() - current.getDay() + 1));
  for (var i = 0; i < 7; i++) {
    week.push(
      new Date(current)
    );
    current.setDate(current.getDate() + 1);
  }
  return week;
}

const weekNumber = d =>  {
  // Copy date so don't modify original
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  // Return array of year and week number
  return [d.getUTCFullYear(), weekNo];
}

const datediff = (first, second) => {
  // Take the difference between the dates and divide by milliseconds per day.
  // Round to nearest whole number to deal with DST.
  return Math.abs(Math.round((second - first) / (1000 * 60 * 60 * 24)));
}

const getProgress = current => {
  var today = new Date(current.lYear, current.lMonth - 1, current.lDay)
  var firstDay = new Date(current.lYear, 0, 1)
  var endDay = new Date(current.lYear, 11, 31)

  return datediff(today, firstDay) / datediff(endDay, firstDay) * 100;
}

module.exports = {
  formatDate: formatDate,
  weekDays: weekDays,
  weekNumber: weekNumber,
  getProgress: getProgress
}



