import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { TRIANGULATION } from "../utils/triangulation";

export const FaceMesh = ({ points }) => {
  const ref = useRef(null);
  const meshRef = useRef(null);
  useLayoutEffect(() => {
    if (!points) return;
    if (ref.current && points.length) {
      ref.current.setFromPoints(points);
      ref.current.setAttribute(
        "position",
        new THREE.BufferAttribute(triangulate(points), 3)
      );
      ref.current.attributes.position.setUsage(THREE.DynamicDrawUsage);
      ref.current.computeVertexNormals();
      ref.current.computeBoundingSphere();
    }
  }, [points]);
  return (
    <group rotation={[0, Math.PI, Math.PI]} position={[-200, 50, 0]}>
      <points>
        <bufferGeometry attach="geometry" ref={ref} />
        {ref.current && (
          <>
            <mesh
              ref={meshRef}
              geometry={ref.current}
              material={
                new THREE.MeshPhongMaterial({
                  color: "#543768",
                  emissive: "#6d2626",
                  specular: "#e6dbdb",
                  shininess: 63.0,
                  transparent: true,
                  opacity: 0.8,
                })
              }
            />

            <pointsMaterial
              size={4}
              color={"#b91372"}
              transparent
              sizeAttenuation={true}
            />
          </>
        )}
      </points>
    </group>
  );
};

const triangulate = (points3D) => {
  const orderedVectors = [];
  for (let i = 0; i < TRIANGULATION.length / 3; i++) {
    const temp = [
      TRIANGULATION[i * 3],
      TRIANGULATION[i * 3 + 1],
      TRIANGULATION[i * 3 + 2],
    ].map((index) => points3D[index]);
    temp.forEach((vector) => orderedVectors.push(vector.x, vector.y, vector.z));
  }

  return new Float32Array([...orderedVectors]);
};
