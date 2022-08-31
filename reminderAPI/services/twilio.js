const twilio = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const twilioNum = process.env.TWILIO_NUMBER;

module.exports = async (to, msg) => {
  await twilio.messages
    .create({
      body: `This is a reminder from Covert Server. \n \n ${msg} \n \n To opt-out, reply STOP`,
      from: twilioNum,
      to: to,
      messagingServiceSid: 'MG745d28b99a51a0d09e24b0669157f698'
    })
    .then((message) => console.log(message.sid))
    .catch((err) => {
      console.error(`There was a problem with Twilio:: ${err}`);
      throw new Error(`There was a problem with Twilio:: ${err}`);
    });
};
