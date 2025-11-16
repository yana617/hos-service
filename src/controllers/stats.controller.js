const claimRepository = require('../repositories/ClaimRepository');

const monthNames = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

const getUsersPerMonthStats = async (req, res) => {
  const dbResult = await claimRepository.getMonthlyUsersReport();

  const dbDataMap = new Map();
  dbResult.forEach((item) => {
    dbDataMap.set(`${item.year}-${item.month}`, item.usersCount);
  });

  const result = [];
  const currentDate = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  oneYearAgo.setMonth(oneYearAgo.getMonth() + 1);

  // map for not losing 0-months
  for (
    let date = new Date(oneYearAgo);
    date <= currentDate;
    date.setMonth(date.getMonth() + 1)
  ) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${month}`;

    result.push({
      month: `${monthNames[month - 1]} ${year}`,
      usersCount: dbDataMap.get(key) || 0,
    });
  }

  res.json({
    success: true,
    data: result,
  });
};

module.exports = {
  getUsersPerMonthStats,
};
