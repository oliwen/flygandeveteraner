import React, { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";
import { motion } from "framer-motion";

type Video = {
  buttonNumber: number;
  videoName: string;
  title: string;
  start: number;
  end: number;
};

const videos: Video[] = [
  {
    buttonNumber: 1,
    title: "SAS Jubileum",
    videoName: "1",
    start: 0,
    end: 10,
  },
  {
    buttonNumber: 2,
    title: "Flygtur",
    videoName: "2",
    start: 10,
    end: 20,
  },
  {
    buttonNumber: 3,
    title: "Meckande",
    videoName: "3",
    start: 0,
    end: 10,
  },
  {
    buttonNumber: 4,
    title: "Annan titel",
    videoName: "4",
    start: 30,
    end: 40,
  },
  {
    buttonNumber: 5,
    title: "Att flyga med Daisy",
    videoName: "5",
    start: 40,
    end: 50,
  },
  {
    buttonNumber: 6,
    title: "Spännande",
    videoName: "6",
    start: 50,
    end: 60,
  },
];

const VideoPlayer: React.FC<{
  video: Video;
  isActive?: boolean;
  isAutoScrolling?: boolean;
  onDone: () => void;
}> = ({ video, isActive, isAutoScrolling, onDone }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    if (!isAutoScrolling && isActive) {
      const video = videoRef.current;
      video.currentTime = 0;
      video.play();

      video.addEventListener("ended", onDone, false);

      return () => video?.removeEventListener("ended", onDone);
    }
  }, [isActive, isAutoScrolling, onDone, video.start]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ duration: 2 }}
      onAnimationStart={(definition) => {
        if (
          videoRef.current &&
          typeof definition === "object" &&
          "opacity" in definition &&
          definition.opacity === 1
        ) {
          videoRef.current.currentTime = video.start;
          setTimeout(() => {
            console.log("*** Play video", video.videoName);
            videoRef.current?.play();
          }, 100);
        }
      }}
      onUpdate={(definition) => {
        if (
          videoRef.current &&
          typeof definition === "object" &&
          "opacity" in definition &&
          typeof definition.opacity === "number"
        ) {
          videoRef.current.volume = definition.opacity;
        }
      }}
      onAnimationComplete={(definition) => {
        if (
          videoRef.current &&
          typeof definition === "object" &&
          "opacity" in definition &&
          definition.opacity === 0
        ) {
          console.log("*** Pause video", video.videoName);
          videoRef.current.pause();
        }
      }}
      className="video-container"
    >
      <video
        ref={videoRef}
        poster={
          import.meta.env.PROD
            ? `/videos/generated/${video.videoName}_thumbnail.png`
            : ""
        }
        muted={!import.meta.env.PROD}
      >
        <source
          src={`/videos/${import.meta.env.PROD ? "generated" : ""}/${
            video.videoName
          }.mp4`}
          type="video/mp4"
        />
      </video>
      {isAutoScrolling ? (
        <div className="video-info">
          <h2>
            <span>{video.buttonNumber}</span> {video.title}
          </h2>
        </div>
      ) : undefined}
    </motion.div>
  );
};

function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoScrolling, setAutoScrolling] = useState(true);
  const [socket] = useState(() => io());

  useEffect(() => {
    let timeout: number | undefined;
    if (isAutoScrolling) {
      timeout = setTimeout(() => {
        setActiveIndex((currentActiveIndex) => {
          if (currentActiveIndex >= videos.length - 1) {
            return 0;
          }
          return currentActiveIndex + 1;
        });
      }, (videos[activeIndex].end - videos[activeIndex].start) * 1000);
    }

    return () => {
      if (timeout) {
        clearInterval(timeout);
      }
    };
  }, [activeIndex, isAutoScrolling]);

  useEffect(() => {
    function playVideo(index: number) {
      setAutoScrolling(false);
      setActiveIndex(index);
    }
    socket.on("playVideo", playVideo);

    return () => {
      socket.removeAllListeners("playVideo");
    };
  }, [socket]);

  const onDone = useCallback(() => {
    socket.emit("done", activeIndex);
    setActiveIndex(activeIndex + 1);
    setAutoScrolling(true);
  }, [activeIndex, socket]);

  return (
    <div className="videos-container">
      {videos.map((video, i) => (
        <VideoPlayer
          key={video.buttonNumber}
          video={video}
          isActive={i === activeIndex}
          isAutoScrolling={isAutoScrolling}
          onDone={onDone}
        />
      ))}
    </div>
  );
}

export default App;
