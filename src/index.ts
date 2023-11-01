import process from "process";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import fs from "fs";
import { logger } from "./logger";
import { UrlProcessor } from "./url-processor";
import { Watcher } from "./watcher";
import { isProduction } from "./utils";

dotenvExpand.expand(dotenv.config());

logger.info(`App run in ${process.env.NODE_ENV} environment`);

if (!process.env.DB_DIR) logger.error(`'DB_DIR' not provided!`);
if (!process.env.POCKET_FILE) logger.error(`'POCKET_FILE' not provided!`);
if (!process.env.WWW_STORE) logger.error(`'WWW_STORE' not provided!`);

if (isProduction()) {
  if (!process.env.ST_URL) logger.error(`'ST_URL' not provided!`);
  if (!process.env.ST_API_KEY) logger.error(`'ST_API_KEY' not provided!`);
  if (!process.env.ST_FOLDER_ID) logger.error(`'ST_FOLDER_ID' not provided!`);
  if (!process.env.ST_URL || !process.env.ST_API_KEY || !process.env.ST_FOLDER_ID) {
    logger.error(`ST* variables are required on production environment!`);
    process.exit(1);
  }
}

if (!process.env.DB_DIR || !process.env.POCKET_FILE || !process.env.WWW_STORE) {
  process.exit(1);
}
const DOWNLOAD_FILE = process.env.DOWNLOAD_FILE;

if (!DOWNLOAD_FILE) logger.error(`'DOWNLOAD_FILE' value not provided!`);

const watcher = new Watcher(DOWNLOAD_FILE);

watcher.on("process", async () => {
  const data: any = fs.readFileSync(DOWNLOAD_FILE, "utf8");
  if (data instanceof Error) throw data;

  // Every line is separate URL to download
  if (data.trim().length) {
    const records = new Set<string>(data.split("\n"));
    let wereErrors = false;

    for (const record of records) {
      try {
        await new UrlProcessor(record).process();
      } catch (e) {
        logger.error(e);
        wereErrors = true;
      }
    }

    if (!wereErrors) {
      const writeStatus: any = fs.writeFileSync(DOWNLOAD_FILE, "");
      if (writeStatus instanceof Error) {
        logger.error(`Clearing ${DOWNLOAD_FILE} failed`);
      } else {
        logger.info(`Cleared ${DOWNLOAD_FILE}`);
      }
    }
  }
});

watcher.start();
