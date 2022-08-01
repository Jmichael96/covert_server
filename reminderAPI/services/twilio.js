const twilio = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const twilioNum = process.env.TWILIO_NUMBER;

module.exports = (to, msg) => {
  twilio.messages
    .create({
      body: msg,
      from: twilioNum,
      to: to,
    })
    .then((message) => console.log(message.sid))
    .catch((err) => {
      throw new Error(`There was a problem with Twilio:: ${err}`);
    });
};
