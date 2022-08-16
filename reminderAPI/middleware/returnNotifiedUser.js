const { Users } = require("../../models/tableList");
const { fetchQuery } = require("../../services/db");
const { isEmpty } = require('jvh-is-empty');
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.CRYPTR_SECRET);

module.exports = async (req, res, next) => {
  const { userId } = req.body;
  const fetchingColData = [{ colName: 'uuid', colVal: userId }];

  let fetchedUser = await fetchQuery(Users, fetchingColData);

  if (isEmpty(fetchedUser)) {
    return res.status(404).json({
      message: 'Could not find the user associated with this reminder'
    });
  }

  let parsedUser = fetchedUser[0];
  
  res.user = {
    uuid: parsedUser.uuid,
    name: parsedUser.name,
    email: parsedUser.email,
    phone: cryptr.decrypt(parsedUser.phone)
  };

  next();
};
