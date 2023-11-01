import fs from "fs";
import prependFile from "prepend-file";
import { execSync } from "child_process";
import { logger } from "./logger";

const POCKET_FILE = process.env.POCKET_FILE;
const WWW_STORE = process.env.WWW_STORE;

export class UrlProcessor {
  record: string;
  url: URL;
  webArchiveLink: string;

  constructor(record: string) {
    this.record = record;
  }

  async process() {
    if (this.record?.startsWith("*")) {
      const url = /(https?:\/\/[^ ]*)/.exec(this.record)?.at(0);
      if (!url) throw Error(`Invalid record ${this.record}`);
      this.url = new URL(url);

      if (this.duplicateDownloadExists()) {
        logger.info(`URL '${url}' already archived, skipping`);
      } else {
        try {
          this.downloadWebsite();
        } catch {
          await this.webArchiveSave();
        }

        await this.addPocketRecord();
      }
    }
  }

  getArchiveFilename(withDatePrefix = true) {
    const title = this.url.pathname.replaceAll("/", "_").replaceAll(":", "");
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const datePrefix = `${year}${month}${day}${hours}${minutes}`;
    const result = `${this.url.host}${title}${this.url.pathname.endsWith(".html") ? "" : ".html"}`;
    return withDatePrefix ? `${datePrefix}_${result}` : result;
  }

  duplicateDownloadExists() {
    const archiveFilenameSuffix = this.getArchiveFilename(false).replace(/\.html$/, "");
    for (const file of fs.readdirSync(WWW_STORE)) {
      if (file.replace(/\.html$/, "").endsWith(archiveFilenameSuffix)) return true;
    }
    return false;
  }

  downloadWebsite() {
    const archiveFilename = this.getArchiveFilename();
    const archivePath = `${WWW_STORE}/${archiveFilename}`;

    if (process.env.NODE_ENV === "production") {
      const result = execSync(`monolith -a -f -F -j -k -M -s -v -o "${archivePath}" ${this.url.toString()}`);
      if (result instanceof Error) {
        logger.error(`Downloading ${this.url.toString()} failed`);
        throw result;
      }
    } else {
      execSync(`touch "${archivePath}"`);
    }

    logger.info(`Downloaded ${this.url.toString()} successfully`);
  }

  async webArchiveSave() {
    const webArchiveLink = await this.getWebArchiveLink();
    if (webArchiveLink) {
      this.url = new URL(webArchiveLink);

      if (!this.duplicateDownloadExists()) {
        this.downloadWebsite();
      }
    }
  }

  async getWebArchiveLink() {
    if (this.webArchiveLink === undefined) {
      if (this.url.toString().includes("web.archive.org")) {
        return;
      }

      const webArchiveSaveURL = "https://web.archive.org/save";

      try {
        logger.info(`Fetching ${this.url.toString()} web.archive link`);
        const res: Response = await fetch(`${webArchiveSaveURL}/${this.url.toString()}`);

        if (res.ok) {
          this.webArchiveLink = res.url;
        } else {
          logger.error(
            `Archiving URL ${this.url.toString()} via web.archive.org failed! ${res.status}: ${res.statusText}`,
          );
        }
      } catch (e) {
        logger.error(e);
      }
    }

    return this.webArchiveLink;
  }

  async addPocketRecord() {
    const data = `* ${this.url.toString()}


[[./Sync/org-agenda-repo/pocket/public/${this.getArchiveFilename()}][Mobile link]]


[[~/Sync/org-agenda-repo/pocket/public/${this.getArchiveFilename()}][Desktop link]]

`;

    await prependFile(POCKET_FILE, data);
  }
}
