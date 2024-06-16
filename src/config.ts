// config.ts
import 'dotenv/config';

interface BotConfig {
  BOT_TOKEN: string | undefined;
  SECRET_KEY: string | undefined;
  WEB_API: string | undefined;
  DIR_TEST_GROUP: string | undefined;
}
//config.ts
interface AdminConfig {
  GRAND_ADMIN: number | undefined;
  LOG_CHANNEL_ID: number | undefined;
}

interface SettingsConfig {
  OPLATA_REPORT_ACTIVE: boolean | undefined;
  METRICS_REPORT_ACTIVE: boolean | undefined;
}

interface Config {
  bot: BotConfig;
  admin: AdminConfig;
  settings: SettingsConfig;
}

const config: Config = {
  bot: {
    BOT_TOKEN: process.env.BOT_TOKEN,
    SECRET_KEY: process.env.SECRET_KEY,
    WEB_API: process.env.WEB_API,
    DIR_TEST_GROUP: process.env.DIR_TEST_GROUP,
  },
  admin: {
    GRAND_ADMIN: parseInt(process.env.GRAND_ADMIN || "0"),
    LOG_CHANNEL_ID: parseInt(process.env.LOG_CHANNEL_ID || "0"),
  },
  settings: {
    OPLATA_REPORT_ACTIVE: process.env.OPLATA_REPORT_ACTIVE === 'true',
    METRICS_REPORT_ACTIVE: process.env.METRICS_REPORT_ACTIVE === 'true',
  },
};

export default config;