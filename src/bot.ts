import { Telegraf, Context } from 'telegraf';
import { DateTime } from 'luxon';

require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN as string);

bot.start((ctx: Context) => {
    const now = DateTime.now().toLocaleString(DateTime.DATETIME_FULL);
    ctx.reply(`Текущее время: ${now}`);
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));