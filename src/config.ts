// config.ts
import 'dotenv/config';

interface Config {
  BOT_TOKEN: string | undefined; //bot
  SECRET_KEY: string | undefined;  //bot
  WEB_API: string | undefined;  //bot

  GRAND_ADMIN: number | undefined;  //admin
  LOG_CHANNEL_ID: number | undefined;  //admin

  DIR_TEST_GROUP: string | undefined; //bot GROUP

  OPLATA_REPORT_ACTIVE: boolean | undefined; //setting
  METRICS_REPORT_ACTIVE: boolean | undefined; //setting
}

const config: Config = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  SECRET_KEY: process.env.SECRET_KEY,
  WEB_API: process.env.WEB_API,

  GRAND_ADMIN: parseInt(process.env.GRAND_ADMIN || "0"),
  LOG_CHANNEL_ID: parseInt(process.env.LOG_CHANNEL_ID || "0"),

  DIR_TEST_GROUP: process.env.DIR_TEST_GROUP,

  OPLATA_REPORT_ACTIVE: process.env.OPLATA_REPORT_ACTIVE === 'true',
  METRICS_REPORT_ACTIVE: process.env.METRICS_REPORT_ACTIVE === 'true',
};

export default config;