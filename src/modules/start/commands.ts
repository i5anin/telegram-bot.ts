// commands.ts
import { Context } from 'telegraf';
import { DateTime } from 'luxon';

export const startCommand = (ctx: Context) => {
  console.log("Бот успешно запущен!");
  ctx.reply(`Текущее время: ${DateTime.now().toLocaleString(DateTime.DATETIME_FULL)}`);
};