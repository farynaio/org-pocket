const fs = require("fs");
const prependFile = require('prepend-file');
const { execSync } = require("child_process");

const { logger } = require("./logger");

const POCKET_FILE = process.env.POCKET_FILE;
const WWW_STORE = process.env.WWW_STORE;

class UrlProcessor {
  constructor(record) {
    this.record = record
    this.url = null
  }

  async process() {
    if (this.record.length) {
      const url = /(https?:\/\/[^ ]*)/.exec(this.record)?.at(0)
      if (!url) throw Error(`Invalid record ${this.record}`);
      this.url = new URL(url);
      if (!this.duplicateDownloadExists()) {
        this.downloadWebsite()
        await this.addPocketRecord()
      }
    }
  }

  getArchiveFilename(withDatePrefix=true) {
    const title = this.url.pathname.replaceAll("/", "_");
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}${hours}${minutes}`
    const result = `${this.url.host}${title}${this.url.pathname.endsWith(".html") ? "" : ".html"}`;
    return withDatePrefix ? `${datePrefix}_${result}` : result
  }

  duplicateDownloadExists() {
    const archiveFilenameSuffix = this.getArchiveFilename(false).replace(/\.html$/, '')
    for (const file of fs.readdirSync(WWW_STORE)) {
      if (file.replace(/\.html$/, '').endsWith(archiveFilenameSuffix)) return true
    }
    return false
  }

  downloadWebsite() {
    const archiveFilename = this.getArchiveFilename()
    const archivePath = `${WWW_STORE}/${archiveFilename}`
    const result = execSync(`monolith -a -f -F -j -k -M -s -v -o "${archivePath}"`)
    if (result instanceof Error) {
      logger.error(`Downloading ${this.url.toString()} failed`)
      throw error
    }
    logger.info(`Downloaded ${this.url.toString()} successfully`)
  }

  generateWebArchiveLink() {
    return "https://gnu.org"
  }

  async addPocketRecord() {
    const webArchiveLink = this.generateWebArchiveLink()
    const data = `* ${this.url.toString()}


[[./Sync/org-agenda-repo/pocket/public/${this.getArchiveFilename()}][link]]

`
    // [[${webArchiveLink}][Web archive link]]

    await prependFile(POCKET_FILE, data)
  }
}

module.exports = UrlProcessor;
