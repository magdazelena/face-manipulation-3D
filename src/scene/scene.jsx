import { Canvas } from "@react-three/fiber";
import { useEffect, useState, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { runDetector } from "../utils/detector.js";
import { OrbitControls } from "@react-three/drei";
export function Scene({ video }) {
  const [points, setPoints] = useState([]);
  useEffect(() => {
    if (!video) return;
    const fun = async () => {
      const points3D = convertPointsToVectors(
        (await runDetector(video))[0].keypoints
      );
      console.log(points3D[0])
      setPoints(points3D);
    };
    fun();
  }, [video]);

  const ref = useRef(null);
  useLayoutEffect(() => {
    if (ref.current && points.length) {
      ref.current.setFromPoints(points);
    }
  }, [points]);

  return (
    <Canvas style={{ height: "100vh" }} camera={{ fov: 50, zoom: 3, position: [3, 3, 3] }}>
      <color attach="background" args={["#f5efe6"]} />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <points>
        <bufferGeometry attach="geometry" ref={ref} />

        <pointsMaterial
          attach="material"
          color="0x000000"
          size={1}
        />
      </points>
    </Canvas>
  );
}
const convertPointsToVectors = (points) => {
  const points3D = [];
  for (let i = 0; i < points.length; i++) {
    const newVector = new THREE.Vector3(points[i].x, points[i].y, points[i].z)
    points3D.push(newVector.normalize());
  }
  return points3D;
};
