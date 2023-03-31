import { Canvas } from "@react-three/fiber";
import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { runDetector, detect } from "../utils/detector.js";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";

import { useAnimationFrame } from "../utils/useAnimationFrame.js";
import { FaceMesh } from "./faceMesh.jsx";

export function Scene({ video }) {
  const [points, setPoints] = useState([]);
  const faceModel = useRef(null);
  useEffect(() => {
    const fun = async () => {
      const model = await runDetector();
      faceModel.current = model;
    };
    fun();
  }, []);

  useAnimationFrame(async () => {
    if (!faceModel.current) return;
    const face = await detect(faceModel.current, video);
    if (!face || !face[0]) return;
    const points3D = convertPointsToVectors(face[0].keypoints);
    setPoints(points3D);
  });

  const canvasRef = useRef(null);

  return (
    <Canvas style={{ height: "100vh" }} ref={canvasRef}>
      <color attach="background" args={["#f5efe6"]} />

      <OrbitControls gridHelper />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />

      <FaceMesh points={points} />
      <gridHelper args={[100, 10]} />
      <PerspectiveCamera makeDefault position={[0, 0, 500]} />
    </Canvas>
  );
}
const convertPointsToVectors = (points) => {
  if (!points) return [];
  const points3D = [];
  const scale = 0.4;
  for (let i = 0; i < points.length; i++) {
    const newVector = new THREE.Vector3(
      points[i].x * scale,
      points[i].y * scale,
      points[i].z * scale
    );
    points3D.push(newVector);
  }
  return points3D;
};
