import React, { useRef, useState } from "react";
import "@tensorflow/tfjs";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import "@mediapipe/face_mesh";
import Webcam from "react-webcam";
import sample from "./assets/sample.jpeg";
import { Scene } from "./scene/scene.jsx";

const inputResolution = {
  width: 1080,
  height: 900,
};
const videoConstraints = {
  width: inputResolution.width,
  height: inputResolution.height,
  facingMode: "user",
};
function App() {
  const [loaded, setLoaded] = useState(false);
  const videoRef = useRef(null);

  const handleVideoLoad = (videoNode) => {
    const video = videoNode.target;
    //if (video.readyState !== 4) return;
    if (loaded) return;
    videoRef.current = videoNode.target;
    setLoaded(true);
  };
  return (
    <div>
      {/* <Webcam
        width={inputResolution.width}
        height={inputResolution.height}
        style={{ visibility: "hidden", position: "absolute" }}
        videoConstraints={videoConstraints}
        onLoadedData={handleVideoLoad}
      /> */}
      <img
        src={sample}
        style={{ width: 200, opacity: 0 }}
        onLoad={handleVideoLoad}
      />

      <Scene video={videoRef.current} />
      {loaded ? <></> : <header>Loading...</header>}
    </div>
  );
}

export default App;
