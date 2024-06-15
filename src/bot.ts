import dotenv from 'dotenv';
dotenv.config();

import { Telegraf, Context, NextFunction } from 'telegraf';
import LocalSession from 'telegraf-session-local';
import * as io from '@pm2/io';
import puppeteer from 'puppeteer';
import { SceneSessionData } from 'telegraf/scenes';

// Инициализация PM2 для мониторинга
io.init({
    transactions: true,
    http: true,
} as any);

// Определение типов для переменных окружения
const BOT_TOKEN: string = process.env.BOT_TOKEN || '';

// Инициализация Telegraf бота
const bot: Telegraf = new Telegraf(BOT_TOKEN);

// Определения типа для сессии
interface SessionItem {
    id: string;
    data: {
        isAwaitFio?: boolean;
        isAwaitComment?: boolean;
        isUserInitiated?: boolean;
    };
}

interface SessionStore {
    sessions: SessionItem[];
}

const localSession = new LocalSession({ database: 'session_db.json' });
bot.use(localSession.middleware());

interface MySessionData {
    isAwaitFio: boolean;
    isAwaitComment: boolean;
    isUserInitiated: boolean;
}

// Переопределение модуля для добавления кастомного типа сессии в контекст
declare module 'telegraf' {
    interface Context {
        session: Partial<MySessionData> & SceneSessionData;
    }
}

// Сессионный middleware с типизированным контекстом
bot.use((ctx: Context, next: NextFunction) => {
    if (!ctx.session) {
        ctx.session = { isAwaitFio: false, isAwaitComment: false, isUserInitiated: false };
    }
    return next();
});

// Определение глобальных переменных с типами
declare global {
    namespace NodeJS {
        interface Global {
            SECRET_KEY: string;
            WEB_API: string;
            GRAND_ADMIN: string;
            LOG_CHANNEL_ID: string;
            DIR_OPLATA: string;
            DIR_METRIC: string;
            KISELEV: string;
            DIR_TEST_GROUP: string;
            ADMIN_DB: string;
            OPLATA_REPORT_ACTIVE: string;
            METRICS_REPORT_ACTIVE: string;
            MODE: string;
            emoji: {
                x: string;
                ok: string;
                error: string;
                warning: string;
                bot: string;
                star: string;
                tech: string;
                rating_1: string;
                rating_2: string;
                rating_3: string;
                point: string;
            };
            bot: Telegraf;
            stateCounter: {
                bot_update: number;
                bot_check: number;
                user_get_all: number;
                users_get: number;
                users_get_all_fio: number;
                users_add: number;
                comment_get_all: number;
                comment_update: number;
                oplata_get_all: number;
                oplata_update: number;
                instanceNumber: number;
            };
        }
    }
}

global.SECRET_KEY = process.env.SECRET_KEY || '';
global.WEB_API = process.env.WEB_API || '';
global.GRAND_ADMIN = process.env.GRAND_ADMIN || '';
global.LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID || '';
global.DIR_OPLATA = process.env.DIR_OPLATA || '';
global.DIR_METRIC = process.env.DIR_METRIC || '';
global.KISELEV = process.env.KISELEV || '';
global.DIR_TEST_GROUP = process.env.DIR_TEST_GROUP || '';
global.ADMIN_DB = process.env.ADMIN_DB || '';
global.OPLATA_REPORT_ACTIVE = process.env.OPLATA_REPORT_ACTIVE || '';
global.METRICS_REPORT_ACTIVE = process.env.METRICS_REPORT_ACTIVE || '';
global.MODE = process.env.NODE_ENV || 'development';
global.emoji = {
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
    point: '·',
};
global.bot = bot;
global.stateCounter = {
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
    instanceNumber: 0,
};

// Случайный номер экземпляра
const instanceNumber = Math.floor(Math.random() * 9000) + 1000;
const currentDateTime = new Date();
stateCounter.instanceNumber = instanceNumber;

// ... (остальной код вашего бота) ...

// Запуск бота
bot.launch().catch(async (err) => {
    console.error('Fatal Error! Error while launching the bot:', err);
    const logMessageToSend = {
        user_id: '',
        text: err.toString(),
        error: 1,
        ok: 0,
        test: process.env.NODE_ENV === 'build' ? 0 : 1,
    };
    await sendLogData(logMessageToSend);
    setTimeout(() => bot.launch(), 30000); // Попробовать перезапустить через 30 секунд
});

// ... (остальной код вашего бота) ...