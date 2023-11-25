import express, { Application } from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import rpio from "rpio";
import { exec } from "child_process";
import config from "./config.json";
import { existsSync } from "fs";

type Video = (typeof config)[number];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  console.log("Starting video player in 10 seconds, press CTRL + C to abort");

  await sleep(10000);

  const PORT = 8080;
  const app: Application = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer);

  rpio.init({ mapping: "gpio" });

  function playVideo(video: Video) {
    Object.values(config).forEach((video) => {
      rpio.write(video.ledPin, rpio.LOW);
    });
    rpio.write(video.ledPin, rpio.HIGH);
    io.emit("playVideo", video.name);
  }

  function pollcb(video: Video) {
    /*
     * Wait for a small period of time to avoid rapid changes which
     * can't all be caught with the 1ms polling frequency.  If the
     * pin is no longer down after the wait then ignore it.
     */
    rpio.msleep(20);

    if (rpio.read(video.buttonPin)) return;

    playVideo(video);
  }

  config.forEach((video) => {
    if (
      !existsSync(path.join(__dirname, "public/videos/" + video.name + ".mp4"))
    ) {
      throw new Error(
        "The video doesn't exist, run 'sh prepare.sh' or check your config"
      );
    }

    rpio.open(video.ledPin, rpio.OUTPUT, rpio.LOW);
    rpio.open(video.buttonPin, rpio.INPUT, rpio.PULL_UP);
    rpio.poll(video.buttonPin, () => pollcb(video), rpio.POLL_LOW);
  });

  function videoDone(video: Video) {
    // Update light
    rpio.write(video.ledPin, rpio.LOW);
  }

  io.on("connection", (socket) => {
    socket.on("done", (videoName: string) => {
      const video = config.find((video) => video.name === videoName);
      if (video) {
        videoDone(video);
      }
    });
  });

  app.use(express.static(path.join(__dirname, "public")));

  app.get("/", (_, res) => {
    res.sendFile(path.join(__dirname, "public", "/index.html"));
  });

  httpServer.listen(PORT, () => {
    console.log(`Starting Chromium on http://localhost:${PORT}`);

    exec("unclutter -idle 0.1");

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
})();
