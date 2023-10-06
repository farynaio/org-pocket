const dotenv = require('dotenv').config()
const dotenvExpand = require('dotenv-expand')
const fs = require('fs')
const express = require('express')
const orgParser = require('org-mode-parser')
const { execSync } = require('child_process')

dotenvExpand.expand(dotenv.config())

const Tags = require('./src/tags')

const DOWNLOADED_TAG = "downloaded"

const PORT = 3000
// const DB_DIR = "./pocket"
// const POCKET_FILE = `${DB_DIR}/pocket.org`
// const WWW_STORE = `${DB_DIR}/public`
// const SERVER_BASE_URL = "https://pocket.faryna.io"

const PORT = process.PORT
const DB_DIR = process.DB_DIR
const POCKET_FILE = process.POCKET_FILE
const WWW_STORE = process.WWW_STORE
const SERVER_BASE_URL = process.SERVER_BASE_URL

// fs.watch(POCKET_FILE, (eventType, filename) => {
  const fileContent = fs.readFileSync(POCKET_FILE, 'utf-8');
  const lines = fileContent.split('\n');
  const firstLine = lines[0];


const tags = new Tags(firstLine)

if (!tags.getTags().includes(DOWNLOADED_TAG)) {
  const url = getUrl(firstLine)
  downloadWebsite(url)
  markAsDownloaded(url, tags)
}


// console.log(tags.getTags())

// console.log(getUrl(firstLine))
// const tags = getTags(firstLine)

  // console.log("tags", tags)

    // console.log("url", node.headline.trim())
    // const url = new URL(node.headline.trim())

    // downloadWebsite(url)

    // if (!(DOWNLOADED_TAG in node.tags))
      // updateDatabase(url)
// })

function getUrl(line) {
  let url = /http.*?  /.exec(line)
  if (!url) throw Error(`Invalid lin ${line}`)
  return new URL(url[0].trim())
}

function downloadWebsite(url) {
  const title = url.pathname.split('/').at(-1)
  console.log("title", title)

  console.log("download", url)
  console.log("saving as", `${url.hostname}-${title}.html`)

  // execSync(`touch ${url}.html`)

}

function getLocalUrl(url) {
  const title = url.pathname.split('/').at(-1)
  return `${url.hostname}-${title}.html`
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

const app = express()

app.use(express.static('public'))

// app.listen(PORT, () => {
//   console.log(`Example app listening on PORT ${PORT}`)
// })
