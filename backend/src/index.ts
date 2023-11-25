import express, { Application } from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import rpio from "rpio";
import { exec } from "child_process";

const PORT = 8080;
const app: Application = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

rpio.init({ mapping: "gpio" });

type Button = {
  index: number;
  buttonPin: number;
  ledPin: number;
};

const buttons: { [key: number]: Button } = {
  0: { index: 0, buttonPin: 26, ledPin: 21 },
  1: { index: 1, buttonPin: 19, ledPin: 20 },
  2: { index: 2, buttonPin: 13, ledPin: 16 },
  3: { index: 3, buttonPin: 6, ledPin: 12 },
  4: { index: 4, buttonPin: 27, ledPin: 25 },
  5: { index: 5, buttonPin: 24, ledPin: 22 },
};

function playVideo(index: number) {
  Object.values(buttons).forEach((button) => {
    rpio.write(button.ledPin, rpio.LOW);
  });
  rpio.write(buttons[index].ledPin, rpio.HIGH);
  io.emit("playVideo", index);
}

function pollcb(button: Button) {
  /*
   * Wait for a small period of time to avoid rapid changes which
   * can't all be caught with the 1ms polling frequency.  If the
   * pin is no longer down after the wait then ignore it.
   */
  rpio.msleep(20);

  if (rpio.read(button.buttonPin)) return;

  playVideo(button.index);
}

Object.values(buttons).forEach((button) => {
  rpio.open(button.ledPin, rpio.OUTPUT, rpio.LOW);
  rpio.open(button.buttonPin, rpio.INPUT, rpio.PULL_UP);
  rpio.poll(button.buttonPin, () => pollcb(button), rpio.POLL_LOW);
});

function videoDone(index: number) {
  // Update light
  rpio.write(buttons[index].ledPin, rpio.LOW);
}

io.on("connection", (socket) => {
  socket.on("done", (index: number) => {
    videoDone(index);
  });
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "/index.html"));
});

httpServer.listen(PORT, () => {
  console.log(`Starting Chromium on http://localhost:${PORT}`);
  exec(
    "DISPLAY=:0 " +
      "chromium-browser " +
      "--kiosk  " +
      "--no-first-run " +
      "--start-maximized  " +
      "--noerrdialogs " +
      "--disable-infobars " +
      "--autoplay-policy=no-user-gesture-required " +
      "http://localhost:8080"
  );
});
