import React, { useCallback, useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import "./App.css";
import { motion } from "framer-motion";
import config from "../../config.json";

type Video = (typeof config)[number];

const sortedConfig = config.sort((a, b) => a.buttonNumber - b.buttonNumber);

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
          videoRef.current.play();
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
          videoRef.current.pause();
          videoRef.current.currentTime = video.start;
        }
      }}
      className="video-container"
    >
      <video
        ref={videoRef}
        poster={`/videos/${video.name}_poster.png`}
        muted={!import.meta.env.PROD}
      >
        <source src={`/videos/${video.name}.mp4`} type="video/mp4" />
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
  const [socket] = useState(
    () =>
      io() as Socket<
        { playVideo: (name: string) => void },
        { done: (name: string) => void }
      >
  );

  useEffect(() => {
    let timeout: number | undefined;
    if (isAutoScrolling) {
      timeout = setTimeout(() => {
        setActiveIndex((currentActiveIndex) => {
          if (currentActiveIndex >= sortedConfig.length - 1) {
            return 0;
          }
          return currentActiveIndex + 1;
        });
      }, (sortedConfig[activeIndex].end - sortedConfig[activeIndex].start) * 1000);
    }

    return () => {
      if (timeout) {
        clearInterval(timeout);
      }
    };
  }, [activeIndex, isAutoScrolling]);

  useEffect(() => {
    function playVideo(name: string) {
      const index = config.findIndex((video) => video.name === name);
      setAutoScrolling(false);
      setActiveIndex(index);
    }
    socket.on("playVideo", playVideo);

    return () => {
      socket.removeAllListeners("playVideo");
    };
  }, [socket]);

  const onDone = useCallback(() => {
    const activeVideo = config[activeIndex];
    if (activeVideo) {
      socket.emit("done", activeVideo.name);
    }
    setActiveIndex(activeIndex + 1);
    setAutoScrolling(true);
  }, [activeIndex, socket]);

  return (
    <div className="videos-container">
      {sortedConfig.map((video, i) => (
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
