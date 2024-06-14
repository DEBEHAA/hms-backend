import config from "../config/index.js";

export const sendSms = async (mobileNo, message) => {
  const url = `http://bulksmsbd.net/api/smsapi?api_key=${config.SMS_API_KEY}&type=text&number=${mobileNo}&senderid=${config.SMS_SENDER_ID}&message=${message}`;

  const response = await fetch(url);

  const result = await response.json();

  return result;
};
