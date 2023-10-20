const events = require("events")
const chokidar = require("chokidar")

class Watcher extends events.EventEmitter {
  constructor(watchFile) {
    super();
    this.watchFile = watchFile;
  }

  start() {
    chokidar.watch(this.watchFile, {
      persistent: true,
    }).on("change", () => {
      this.emit("process");
    });
  }
}

module.exports = Watcher