const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");
const fs = require("fs");

dotenvExpand.expand(dotenv.config());

const { logger } = require("./logger");
const UrlProcessor = require("./url-processor");
const Watcher = require("./watcher");

const DOWNLOAD_FILE = process.env.DOWNLOAD_FILE;

const watcher = new Watcher(DOWNLOAD_FILE);

watcher.on("process", async () => {
  const data = fs.readFileSync(DOWNLOAD_FILE, "utf8");
  if (data instanceof Error) throw err;

  // Every line is separate URL to download
  if (data.trim().length) {
    const records = new Set(data.split("\n"));
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
      const writeStatus = fs.writeFileSync(DOWNLOAD_FILE, "");
      if (writeStatus instanceof Error) {
        logger.error(`Clearing ${DOWNLOAD_FILE} failed`);
      } else {
        logger.info(`Cleared ${DOWNLOAD_FILE}`);
      }
    }
  }
});

watcher.start();
