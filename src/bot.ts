import { Telegraf, Context } from 'telegraf'
import 'dotenv/config'
import { startCommand } from './modules/start/commands.js'

const bot = new Telegraf<Context>(process.env.BOT_TOKEN as string)

bot.start(startCommand)

bot.launch()