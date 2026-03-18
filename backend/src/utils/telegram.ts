export const sendTelegramReminder = async (message: string) => {
  console.log(`[TELEGRAM REMINDER]: ${message}`);
  // In a real app, use axios to call Telegram Bot API
  // axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
  //   chat_id: process.env.TELEGRAM_CHAT_ID,
  //   text: message
  // });
};
