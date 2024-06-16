import dotenv from 'dotenv';
dotenv.config();

import { Telegraf } from 'telegraf';
import LocalSession from 'telegraf-session-local';
import * as io from '@pm2/io';
import puppeteer from 'puppeteer';
import { SceneSessionData } from 'telegraf/scenes'

// Инициализация PM2 для мониторинга
io.init({
    transactions: true,
    http: true
} as any);

// Импорт модулей с использованием TypeScript синтаксиса
// import { initCronJobs } from '#src/cron/cron';
// import { handleRegComment } from '#src/modules/reg/reg';
// import { payments } from '#src/modules/payments/payments';
// import { handleTextCommand } from '#src/modules/text/text';
// import { handleDocsCommand } from '#src/modules/links/docs/docs';
// import { handleHelpCommand } from '#src/modules/help/help';
// import { handleOperatorCommand } from '#src/modules/links/oper/oper';
// import { tableMetrics } from '#src/modules/metrics/metrics_btn';
// import { oplataNotification } from '#src/modules/oplata/oplata';
// import { notifyUsers, notifyAllUsers } from '#src/modules/sk_operator/notify';
// import { handleStatusCommand } from '#src/bot/status';
// import { handleMsgCommand } from '#src/utils/msg/admin';
// import { logNewChatMembers, logLeftChatMember } from '#src/utils/log';
// import { handleGetGroupInfoCommand } from '#src/modules/test/number_users';
// import { runBot } from '#src/bot/run';
// import { handleForwardedMessage, whoCommand } from '#src/modules/test/who';
// import { createMetric } from '#src/bot/metricPM2';
// import { metricsNotificationDirector } from '#src/modules/metrics/director/metrics';
// import { formatMetricsMessageMaster } from '#src/modules/metrics/master/metrics';
// import { sendMetricsMessagesNach } from '#src/modules/metrics/hachalnik/metrics';
// import { handlePhoto } from '#src/modules/test/photo';
// import { checkingGroup } from '#src/modules/checkingGroup/checkingGroup';
// import { sendLogData } from '#src/api/api';

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
bot.use((ctx, next) => {
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
            // Добавьте остальные глобальные переменные сюда
        }
    }
}

global.SECRET_KEY = process.env.SECRET_KEY || '';
global.WEB_API = process.env.WEB_API || '';

// Продолжите с оставшимися обработчиками и логикой бота ...