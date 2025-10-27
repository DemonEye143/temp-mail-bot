const { Telegraf } = require("telegraf");
const axios = require("axios");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply("👋 হ্যালো! আমি Temp Mail বট। /newmail লিখে নতুন ইমেইল নাও।");
});

bot.command("newmail", async (ctx) => {
  try {
    const res = await axios.get("https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1");
    const email = res.data[0];
    ctx.reply(`📧 তোমার টেম্প মেইল ঠিকানা:\n\n${email}\n\n🔄 ইনবক্স দেখতে লিখো /inbox ${email}`);
  } catch (err) {
    ctx.reply("⚠️ কিছু সমস্যা হয়েছে, আবার চেষ্টা করো।");
  }
});

bot.command("inbox", async (ctx) => {
  const args = ctx.message.text.split(" ");
  const email = args[1];
  if (!email) return ctx.reply("❗ উদাহরণ: /inbox test@1secmail.com");

  const [login, domain] = email.split("@");
  try {
    const inbox = await axios.get(`https://www.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`);
    if (inbox.data.length === 0) {
      return ctx.reply("📭 এখনো কোনো মেইল আসেনি।");
    }

    let list = inbox.data.map(m => `✉️ From: ${m.from}\nSubject: ${m.subject}\nID: ${m.id}`).join("\n\n");
    ctx.reply(list);
  } catch (err) {
    ctx.reply("⚠️ ইনবক্স দেখা যাচ্ছে না।");
  }
});

bot.launch();
