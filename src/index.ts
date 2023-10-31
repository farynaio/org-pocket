import dotenv from "dotenv"
import dotenvExpand from "dotenv-expand"
import fs from "fs"

import { logger } from "./logger"
import { UrlProcessor } from "./url-processor"
import { Watcher } from "./watcher"

dotenvExpand.expand(dotenv.config());

const DOWNLOAD_FILE = process.env.DOWNLOAD_FILE;

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
