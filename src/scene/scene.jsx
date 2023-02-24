import { Canvas } from "@react-three/fiber";
import { useEffect, useState, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { runDetector } from "../utils/detector.js";
import { OrbitControls, CameraControls, OrthographicCamera } from '@react-three/drei'
export function Scene({ video }) {
  const [points, setPoints] = useState([]);
  const virtualCamera = useRef(null)
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
    <Canvas style={{ height: "50vh" }}>
      <color attach="background" args={["#f5efe6"]} />
      <OrbitControls />
    
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <points>
          <bufferGeometry attach="geometry" ref={ref} />

          <pointsMaterial

            attach="material"
            color="0x0ff000"
            size='0.1'
          />
        </points>
        <gridHelper args={[100, 10]} />
        {/* <OrthographicCamera name="FBO Camera" ref={virtualCamera} position={[0, 0, 5]} /> */}
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
