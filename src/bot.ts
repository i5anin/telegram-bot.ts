import 'dotenv/config';
import { Telegraf } from 'telegraf';
import LocalSession from 'telegraf-session-local';
import { io } from '@pm2/io';
import puppeteer from 'puppeteer';

// Импорт модулей
import { initCronJobs } from './cron/cron';
import { handleRegComment } from './modules/reg/reg';
import { payments } from './modules/payments/payments';
import { handleTextCommand } from './modules/text/text';
import { handleDocsCommand } from './modules/links/docs/docs';
import { handleHelpCommand } from './modules/help/help';
import { handleOperatorCommand } from './modules/links/oper/oper';
import { tableMetrics } from './modules/metrics/metrics_btn';
import { oplataNotification } from './modules/oplata/oplata';
import { notifyUsers, notifyAllUsers } from './modules/sk_operator/notify';
import { handleStatusCommand } from './bot/status';
import { handleMsgCommand } from './utils/msg/admin';
import { logNewChatMembers, logLeftChatMember } from './utils/log';
import { handleGetGroupInfoCommand } from './modules/test/number_users';
import { runBot } from './bot/run';
import { handleForwardedMessage, whoCommand } from './modules/test/who';
import { createMetric } from './bot/metricPM2';
import { metricsNotificationDirector } from './modules/metrics/director/metrics';
import { formatMetricsMessageMaster } from './modules/metrics/master/metrics';
import { sendMetricsMessagesNach } from './modules/metrics/hachalnik/metrics';
import { handlePhoto } from './modules/test/photo';
import { checkingGroup } from './modules/checkingGroup/checkingGroup';
import { sendLogData } from './api/api';

// Конфигурационные переменные
const BOT_TOKEN: string = process.env.BOT_TOKEN || '';

// Инициализация Telegraf бота
const bot = new Telegraf(BOT_TOKEN);

// Инициализация сессии
const localSession = new LocalSession({ database: 'session_db.json' });
bot.use(localSession.middleware());

// Сессионный middleware
bot.use((ctx, next) => {
    ctx.session = ctx.session || {
        isAwaitFio: false,
        isAwaitComment: false,
        isUserInitiated: false
    };
    return next();
});

// Глобальные переменные
const SECRET_KEY: string = process.env.SECRET_KEY || '';
const WEB_API: string = process.env.WEB_API || '';

const GRAND_ADMIN: string = process.env.GRAND_ADMIN || '';
const LOG_CHANNEL_ID: string = process.env.LOG_CHANNEL_ID || '';

const DIR_OPLATA: string = process.env.DIR_OPLATA || '';
const DIR_METRIC: string = process.env.DIR_METRIC || '';
const KISELEV: string = process.env.KISELEV || '';

const DIR_TEST_GROUP: string = process.env.DIR_TEST_GROUP || '';
const ADMIN_DB: string = process.env.ADMIN_DB || '';

const OPLATA_REPORT_ACTIVE: boolean = process.env.OPLATA_REPORT_ACTIVE === 'true';
const METRICS_REPORT_ACTIVE: boolean = process.env.METRICS_REPORT_ACTIVE === 'true';

const MODE: string = process.env.NODE_ENV || 'development';
const emoji = {
    x: '❌',
    ok: '✅',
    error: '❗',
    warning: '⚠',
    bot: '烙',
    star: '⭐',
    tech: '⚙',
    rating_1: '🥇',
    rating_2: '🥈',
    rating_3: '🥉',
    point: '·'
}; // ❌ //✅ //❗ //⚠ //🤖 //⭐ //⚙️ // 🥇 // 🥈 // 🥉 // • // ·

const stateCounter = {
    bot_update: 0,
    bot_check: 0,

    user_get_all: 0,
    users_get: 0,
    users_get_all_fio: 0,
    users_add: 0,

    comment_get_all: 0,
    comment_update: 0,

    oplata_get_all: 0,
    oplata_update: 0,

    instanceNumber: 0 // для метрики
};

// Случайный номер экземпляра
const instanceNumber = Math.floor(Math.random() * 9000) + 1000;
const currentDateTime = new Date();
stateCounter.instanceNumber = instanceNumber; // для метрики

// включить отслеживание транзакций
// включить метрики веб-сервера (необязательно)
io.init({ transactions: true, http: true });

runBot(instanceNumber, currentDateTime);

// Обработчик для фото с подписью
bot.on('photo', (ctx) => handlePhoto(ctx));

// Обработчики команд
bot.command(['start', 'reg'], (ctx) => handleRegComment(ctx, (ctx.session.isAwaitFio = true))); // ['start', 'reg']
bot.command('pay', (ctx) => payments(ctx));
bot.command('new_comment', (ctx) => notifyUsers(ctx, (ctx.session.isUserInitiated = true)));
bot.command('new_comment_all', notifyAllUsers);
bot.command('help', handleHelpCommand);
bot.command('oplata', oplataNotification);
bot.command('msg', handleMsgCommand);
bot.command('status', (ctx) => handleStatusCommand(ctx, instanceNumber, currentDateTime));
bot.command('get_group_info', (ctx) => handleGetGroupInfoCommand(ctx));
bot.command('who', (ctx) => whoCommand(ctx));
bot.command(['m', 'metrics'], (ctx) => metricsNotificationDirector(ctx, 1));
bot.command('metrics_director_notification', (ctx) => metricsNotificationDirector(ctx, 0));
bot.command('metrics_nachalnic_notification', () => sendMetricsMessagesNach());
bot.command('metrics_master_notification', () => formatMetricsMessageMaster());
bot.command('docs', (ctx) => handleDocsCommand(ctx));
bot.command('oper', (ctx) => handleOperatorCommand(ctx));

bot.command('list', (ctx) => {
    const searchTerm = ctx.message.text.split(' ')[1];
    // Проверка наличия поискового запроса
    if (!searchTerm) {
        ctx.reply('Введите поисковый запрос после команды /list');
        return;
    }

    fetch(`${WEB_API}/users/find_list.php?search_term=${searchTerm}`)
      .then((response) => response.json())
      .then((data) => {
          if (data.status === 'OK') {
              // Обработка результатов поиска
              const users = data.data;
              if (users.length === 0) {
                  ctx.reply('Пользователей не найдено.');
              } else {
                  // Разбиваем пользователей на группы по 50
                  const chunks = chunkArray(users, 50);

                  // Отправляем сообщения с пользователями
                  chunks.forEach((chunk, index) => {
                      // Формирование сообщения
                      let message = `Найденные пользователи (часть ${index + 1}):\n`;
                      chunk.forEach((user) => {
                          message += `\n<a href='tg://user?id=${user.user_id}'>${user.fio}</a> ${user.username ? `(@${user.username})` : ''} - ${user.post}`;
                      });

                      // Отправка сообщения
                      ctx.reply(message, { parse_mode: 'HTML' });
                  });
              }
          } else {
              ctx.reply('Ошибка поиска.');
          }
      })
      .catch((error) => {
          console.error('Ошибка запроса:', error);
          ctx.reply('Произошла ошибка. Попробуйте позже.');
      });
});

bot.command('list_test_otk_marh', (ctx) => checkingGroup(ctx));

bot.command('get_website_screenshot', async (ctx) => {
    try {
        const websiteUrl = ctx.message.text.split(' ')[1]; // Получаем URL сайта из сообщения
        if (!websiteUrl) {
            ctx.reply('Введите URL сайта после команды /get_website_screenshot');
            return;
        }

        const browser = await puppeteer.launch(); // Запускаем браузер
        const page = await browser.newPage(); // Создаем новую вкладку
        await page.goto(websiteUrl); // Открываем сайт
        await page.setViewport({ width: 1920, height: 1080 }); // Устанавливаем размер области скриншота
        const screenshot = await page.screenshot({ type: 'png', fullPage: true }); // Делаем скриншот
        await browser.close(); // Закрываем браузер

        await ctx.replyWithPhoto({ source: screenshot }); // Отправляем скриншот
    } catch (error) {
        console.error('Ошибка при получении скриншота:', error);
        ctx.reply('Произошла ошибка. Попробуйте позже.');
    }
});

bot.command('mbth', async (ctx) => tableMetrics(ctx));

bot.command('mjpg', async (ctx) => {
    try {
        const websiteUrl = `${WEB_API}metrics/web.php?key=SecretKeyPFForum23`;

        const browser = await puppeteer.launch(); // Запускаем браузер
        const page = await browser.newPage(); // Создаем новую вкладку
        await page.goto(websiteUrl); // Открываем сайт
        await page.setViewport({ width: 438, height: 667 }); // Устанавливаем размер области скриншота
        console.log('before waiting');
        await delay(4000); // Ожидание 4 секунд
        console.log('after waiting');
        const screenshot = await page.screenshot({ type: 'png', fullPage: true }); // Делаем скриншот
        await browser.close(); // Закрываем браузер

        await ctx.replyWithPhoto({ source: screenshot }); // Отправляем скриншот
    } catch (error) {
        console.error('Ошибка при получении скриншота:', error);
        ctx.reply('Произошла ошибка. Попробуйте позже.');
    }
});

// Функция для разбивки массива на части
function chunkArray(array: any[], chunkSize: number): any[][] {
    const result: any[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize));
    }
    return result;
}

function onMaintenance(ctx: any) {
    // Отправляем пользователю сообщение
    ctx.reply('❌ Функция временно недоступна и находится на доработке.');
}

// bot.command('ping_test', pingService);

bot.on('message', (ctx) => handleTextCommand(ctx));
bot.on('text', (ctx) => handleTextCommand(ctx)); // особо не нужна но пусть будет

// Обработчик текстовых сообщений
bot.on('new_chat_members', logNewChatMembers);
bot.on('left_chat_member', logLeftChatMember);

// Запуск бота
bot.launch().catch(async (err) => {
    console.error('Fatal Error! Error while launching the bot:', err);
    const logMessageToSend = {
        user_id: '',
        text: err.toString(),
        error: 1,
        ok: 0,
        test: process.env.NODE_ENV === 'build' ? 0 : 1
    };
    await sendLogData(logMessageToSend);
    setTimeout(() => bot.launch(), 30000); // Попробовать перезапустить через 30 секунд
});

createMetric('bot_check', stateCounter, 'bot_check');
createMetric('user_get_all', stateCounter, 'user_get_all');
createMetric('users_get_all_fio', stateCounter, 'users_get_all_fio');
createMetric('user_add', stateCounter, 'user_add');
createMetric('users_get', stateCounter, 'users_get');
createMetric('comment_get_all', stateCounter, 'comment_get_all');
createMetric('comment_update', stateCounter, 'comment_update');
createMetric('oplata_get_all', stateCounter, 'oplata_get_all');
createMetric('oplata_update', stateCounter, 'oplata_update');
createMetric('instanceNumber', stateCounter, 'instanceNumber');

// Инициализация cron-заданий
initCronJobs(currentDateTime, instanceNumber);

// Функция задержки (необходима для mjpg)
function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}