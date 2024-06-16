#! /usr/bin/env node
import { Telegraf, Context } from 'telegraf';
import { DateTime } from 'luxon';
import 'dotenv/config';

const bot = new Telegraf(process.env.BOT_TOKEN as string);

bot.start((ctx) => {
    console.log("Бот успешно запущен!");
    ctx.reply(`Текущее время: ${DateTime.now().toLocaleString(DateTime.DATETIME_FULL)}`);
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));