const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')
const fs = require('fs')
const express = require('express')
const { execSync } = require('child_process')

dotenvExpand.expand(dotenv.config())

const Tags = require('./tags')

const DOWNLOADED_TAG = "downloaded"

const PORT = process.env.PORT
const DB_DIR = process.env.DB_DIR
const POCKET_FILE = process.env.POCKET_FILE
const WWW_STORE = process.env.WWW_STORE
const SERVER_BASE_URL = process.env.SERVER_BASE_URL

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

startPocketWatch()

function startPocketWatch() {
  fs.watch(POCKET_FILE, { persistent: false }, async (eventType) => {
    if (eventType !== "change") return
    console.log("\n\n", "--------", "new event!")
    // await delay(1000);
    processNewRecord()
  })
}

function processNewRecord() {
  fs.readFile(POCKET_FILE, 'utf-8', (err, fileContent) => {
    if (err) {
      throw err
    }

    const lines = fileContent.split('\n');
    const firstLine = lines[0];
    const tags = new Tags(firstLine)
    console.log("fileContent", fileContent)
    console.log("firstLine", firstLine)
    console.log("tags", tags.getTags())
    console.log("eventType", eventType)

    if (!tags.getTags().includes(DOWNLOADED_TAG)) {
      console.log("new entry!")
      const url = getUrl(firstLine)
      downloadWebsite(url)
      markAsDownloaded(url, tags)
    }
  });
}

function getUrl(line) {
  let url = /http.*?  /.exec(line)
  if (!url) throw Error(`Invalid line ${line}`)
  return new URL(url[0].trim())
}

function downloadWebsite(url) {
  const title = url.pathname.split('/').at(-1)
  const archiveTitle = `${url.hostname}-${title}.html`
  execSync(`touch ${WWW_STORE}/${archiveTitle}`)
}

function getLocalUrl(url) {
  const title = url.pathname.split('/').at(-1)
  const archiveTitle = `${url.hostname}-${title}.html`
  return `${WWW_STORE}/${archiveTitle}`
}

function markAsDownloaded(url, tags) {
  const fileContent = fs.readFileSync(POCKET_FILE, 'utf-8');
  const lines = fileContent.split('\n');
  tags.addTag(DOWNLOADED_TAG)
  lines[0] = `* ${url.href}  ${tags.getTagsString()}`
  lines.splice(1, 0, `[[${getLocalUrl(url)}]]`)
  const updatedContent = lines.join('\n');
  fs.writeFileSync(POCKET_FILE, updatedContent, 'utf-8');
}

function errorHandler (err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  res.status(500)
  res.render('error', { error: err })
}

function logErrors (err, req, res, next) {
  console.error(err.stack)
  next(err)
}

function clientErrorHandler (err, req, res, next) {
  if (req.xhr) {
    res.status(500).send({ error: 'Something failed!' })
  } else {
    next(err)
  }
}

const app = express()

app.use(express.static('public'))
app.use(logErrors)
app.use(clientErrorHandler)
app.use(errorHandler)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

app.listen(PORT, () => {
  console.log(`Pocket app listening on PORT ${PORT}`)
})

// TODO
// can Iopen these files in mobile browser?
// get first record from the top and look for duplicate, if found, download, compare both, if the same do nothing, and remove
// process netire file not only top record
// move entire heading to the top
// go line by line Pocket.org to find existing record, if exist add another download with timestamp