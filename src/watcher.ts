import events from "events";
import chokidar from "chokidar";

export class Watcher extends events.EventEmitter {
  watchFile: string;

  constructor(watchFile: string) {
    super();
    this.watchFile = watchFile;
  }

  start() {
    chokidar
      .watch(this.watchFile, {
        persistent: true,
      })
      .on("change", () => {
        this.emit("process");
      });
  }
}
