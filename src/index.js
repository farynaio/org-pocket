const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");
const fs = require("fs");
const { exec } = require("child_process");
const  moment = require("moment")
const events = require("events")
const util = require("util");
const prependFile = require('prepend-file');

dotenvExpand.expand(dotenv.config());

const { logger } = require("./logger");

// const DB_DIR = process.env.DB_DIR;
const POCKET_FILE = process.env.POCKET_FILE;
const DOWNLOAD_FILE = process.env.DOWNLOAD_FILE;
const WWW_STORE = process.env.WWW_STORE;

class Watcher extends events.EventEmitter {
  constructor(watchFile) {
    super();
    this.watchFile = watchFile;
  }

  start() {
    fs.watch(this.watchFile, () => {
      this.emit("process", this.watchFile);
    });
    logger.info("Watcher started")
  }
}

async function processNewRecord(record) {
  if (record.length) {
    const url = getUrl(record)
    downloadWebsite(url)
    addPocketRecord(url)
  }
}

function getUrl(record) {
  const url = /(https?:\/\/[^ ]*)/.exec(record)[0]
  if (!url) throw Error(`Invalid record ${record}`);
  return new URL(url.trim());
}

function getArchiveFilename(url, withDatePrefix=true) {
  const title = url.pathname.split("/").at(-1);
  const datePrefix = moment().format("YYYYMMDDhhmm")
  const result = `${url.host}-${title}${url.pathname.endsWith(".html") ? "" : ".html"}`;
  return withDatePrefix ? `${datePrefix}-${result}` : result
}

function duplicateDownloadExists(url) {
  const archiveFilenameSuffix = getArchiveFilename(url, false)
  for (const file of fs.readdirSync(WWW_STORE)) {
    if (file.endsWith(archiveFilenameSuffix)) return true
  }
  return false
}

function downloadWebsite(url) {
  const archiveFilename = getArchiveFilename(url)
  const archivePath = `${WWW_STORE}/${archiveFilename}`

  if (duplicateDownloadExists(url)) {
    logger.info(`Article ${url.toString()} already downloaded`)

  } else {
    logger.info(`Downloading ${url.toString()} and saving as ${archivePath}`)
    exec(`touch "${archivePath}"`, (error, stdout, stderr) => {
      if (error) {
        logger.error(`Downloading ${url.toString()} failed`)
        throw error
      }
    });
  }
}

function generateWebArchiveLink(url) {
  return "https://gnu.org"
}

async function addPocketRecord(url) {
  const webArchiveLink = generateWebArchiveLink(url)
  const data = `* ${url}


[[./Sync/org-agenda-repo/pocket/public/${getArchiveFilename(url)}][link]]
`
// [[${webArchiveLink}][Web archive link]]

  await prependFile(POCKET_FILE, data)
}

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

const watcher = new Watcher(DOWNLOAD_FILE);

watcher.on("process", file => {
  delay(1000)

  fs.readFile(file, "utf-8", async (err, data) => {
    if (err) throw err;

    // Every line is separate URL to download
    if (data.trim().length) {
      const records = data.split("\n");
      let wereErrors = false
      logger.info("foo", records)

      for (const record of records) {
        logger.info("record", record)
        try {
          await processNewRecord(record);

        } catch (e) {
          logger.error(e)
          wereErrors = true
        }
      }

      if (records.length && !wereErrors) {
        fs.writeFile(file, "", err => {
          if (err) {
            logger.error(`Clearing ${file} failed`);
          } else {
            logger.info(`Cleared ${file}`);
          }
        })
      }
    }
  })
});

watcher.start();
