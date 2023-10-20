# Pocket

Simple app that mimics [Pocket app](https://www.mozilla.org/en-US/firefox/pocket/). Made by [Emacs](https://www.gnu.org/software/Emacs/) entusiast, for other Emacs entusiasts, and fans of free, open source software, who want to own their collection of articles, and private notes - instead of sharing them with closed source, profit oriented 3rd party company.

## How it works

The app watches for changes in [org-mode](https://orgmode.org/) file DOWNLOAD_FILE (see in [.env.example](https://github.com/farynaio/pocket)), and downloads every URL provided as a heading title.

By default [Monolith](https://github.com/Y2Z/monolith) is used for downloading webpages, and is required for the app to run.

Downloaded websites are stored in WWW_STORE (see .env.example).

After downloading all the websites listed in DOWNLOAD_FILE, the file is cleared, and the app watch for new records to process. References and links to downloaded files are inserted on the front of POCKET_FILE.

The app detects duplicate URLs and inhibits from downloading them.

## .env.example file

This file should be copied to `.env`. Default variables values can be used. Their meaning is:

- DB_DIR - folder that contains all files used by the app
- POCKET_FILE - [org-mode](https://orgmode.org/) file that contains records and links to locally archivised webpages
- DOWNLOAD_FILE - [org-mode](https://orgmode.org/) file that is watched for new URLs to download
- WWW_STORE - here downloaded webpages are stored

## Requirements

As this app relies on [NodeJS fs.watch](https://nodejs.org/docs/latest/api/fs.html#fswatchfilename-options-listener) API, it requires one of notification systems, dependent on the OS you plan to host this app - check [list of options](https://nodejs.org/docs/latest/api/fs.html#availability).

Other requirements:
- node
- npm

## Instalation

1. Download repo
2. run `npm i`
3. copy `.env.example` to `.env`
4. `npm start`

## Example usage

It's meant to be used together with [Syncthing](https://syncthing.net/) on VPS, laptop and  mobile. VPS as a DB_DIR host, share it with other devices. URLs to download can be added via Emacs `org-capture` command on desktop, and via [Orgzly](https://orgzly.com/) notes capture feature on mobile.

After files are synced with the VPS, the app processes DOWNLOAD_FILE, archive all URLs, and share it across devices, together with POCKET_FILE which is used as an access point to downloaded wepages (thanks to org-mode links), also as a place for storing related notes, and tags.

Enjoy!