const Vonage = require("@vonage/server-sdk");
const from = "18773818296";
const to = "18323349639";
const text = "A text message sent using the Vonage SMS API";

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});

const sendText = async (from, to, text) => {
  await vonage.message.sendSms(from, to, text, (err, responseData) => {
    console.log(responseData);
    if (err) {
      console.log(err);
    } else {
      if (responseData.messages[0]["status"] === "0") {
        console.log("Message sent successfully.");
      } else {
        console.error(
          `Message failed with error: ${responseData.messages[0]["error-text"]}`
        );
      }
    }
  });
};

// sendText(from, to, text);

module.exports = sendText;
