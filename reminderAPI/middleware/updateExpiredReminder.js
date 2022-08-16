module.exports = async (req, res, next) => {
  const { 
    uuid, 
    reminderType, 
    dateDue, 
    alertDaysPrior, 
    reminderMessage,
    notify,
    repeat,
  } = req.body;

  const user = res.user;
  console.log(user);
};