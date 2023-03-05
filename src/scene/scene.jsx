import { Canvas } from "@react-three/fiber";
import { useEffect, useState, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { runDetector } from "../utils/detector.js";
import Delaunator from 'delaunator'
import { OrbitControls, CameraControls, OrthographicCamera } from '@react-three/drei'
import { TRIANGULATION } from "../utils/triangulation";

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
      ref.current.setAttribute('position', new THREE.BufferAttribute(triangulate(points), 3))
      ref.current.computeVertexNormals()
    }
  }, [points]);

  

  return (
    <Canvas style={{ height: "50vh" }} camera={{ zoom: 3, position: [9,5,0]}}>
      <color attach="background" args={["#f5efe6"]} />
      
    <OrbitControls/>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />

        <bufferGeometry attach="geometry" ref={ref} />
        <mesh scale={[3,3,3]} geometry={ref.current} material={new THREE.MeshLambertMaterial({ color: "purple", wireframe: true })}/>
        <gridHelper args={[100, 10]} />
        {/* <OrthographicCamera name="FBO Camera" ref={virtualCamera} position={[0, 0, 5]} /> */}
    </Canvas>
  );
}
const convertPointsToVectors = (points) => {
  const points3D = [];
  for (let i = 0; i < points.length; i++) {
    const newVector = new THREE.Vector3(points[i].x/ 20, points[i].y/ 20, points[i].z/20)
    points3D.push(newVector);
  }
  return points3D;
};

const triangulate = (points3D) => {
  const orderedVectors = []
  for (let i = 0; i < TRIANGULATION.length / 3; i++) {
    const temp = [
      TRIANGULATION[i * 3],
      TRIANGULATION[i * 3 + 1],
      TRIANGULATION[i * 3 + 2],
    ].map((index) => points3D[index]);
    temp.forEach(vector => orderedVectors.push(vector.x, vector.y, vector.z))
    
  }
  
  return new Float32Array([...orderedVectors])
  // const meshIndex = []; 
  // for (let i = 0; i < orderedVectors; i++){
  //   meshIndex.push(orderedVectors[i]);
  // }
  // return meshIndex
}