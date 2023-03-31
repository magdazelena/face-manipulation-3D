import { Canvas } from "@react-three/fiber";
import { useEffect, useState, useLayoutEffect, useRef} from "react";
import * as THREE from "three";
import { runDetector, detect } from "../utils/detector.js";
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { TRIANGULATION } from "../utils/triangulation";
import { useAnimationFrame } from "../utils/useAnimationFrame.js";

export function Scene({ video }) {
  const [points, setPoints] = useState([]);
  const faceModel = useRef(null)
  useEffect(() => {
    const fun = async () => {
      const model = await runDetector()
      faceModel.current = model
    };
    fun();
  }, []);

  useAnimationFrame(async () => {
    if(!faceModel.current) return
    const face = await detect(faceModel.current, video)
    if (!face || !face[0]) return
    const points3D = convertPointsToVectors(
      face[0].keypoints
    );
    setPoints(points3D);
  })

  const ref = useRef(null);
  const meshRef= useRef(null)
  const canvasRef = useRef(null)

  useLayoutEffect(() => {
    if (ref.current && points?.length) {
      ref.current.setFromPoints(points);
      ref.current.setAttribute('position', new THREE.BufferAttribute(triangulate(points), 3))
      ref.current.computeVertexNormals()
      ref.current.computeBoundingSphere()
    }
  }, [points]);

  

  return (
    <Canvas style={{ height: "100vh" }} ref={canvasRef} >
      <color attach="background" args={["#f5efe6"]} />
      
    <OrbitControls gridHelper />
        <ambientLight />
        <pointLight position={[10, 10, 10]} />

        <bufferGeometry attach="geometry" ref={ref} />
        { ref.current && <mesh ref={meshRef} rotation={[0, Math.PI, Math.PI]} position={[-200, 50,0]
        } geometry={ref.current} material={new THREE.MeshLambertMaterial({ color: "purple", wireframe: true })}/>}
        <gridHelper args={[100, 10]} />
        <PerspectiveCamera makeDefault position={[0,0,500]} />
    </Canvas>
  );
}
const convertPointsToVectors = (points) => {
  if(!points) return []
  const points3D = [];
  const scale = 0.4;
  for (let i = 0; i < points.length; i++) {
    const newVector = new THREE.Vector3(points[i].x * scale, points[i].y * scale, points[i].z * scale)
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
}