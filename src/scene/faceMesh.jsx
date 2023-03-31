import { Sphere } from "@react-three/drei";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { TRIANGULATION } from "../utils/triangulation";
import { useAnimationFrame } from "../utils/useAnimationFrame";

export const FaceMesh = ({ points }) => {
  const ref = useRef(null);
  const meshRef = useRef(null);
  const spheres = useRef(null);
  const [material, setMaterial] = useState(null);
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
    if (spheres.current) {
      const circleGeometry = new THREE.CircleGeometry(1, 6);

      const geometry = new THREE.InstancedBufferGeometry();
      geometry.setFromPoints(points);
      geometry.index = circleGeometry.index;
      geometry.attributes = circleGeometry.attributes;
      geometry.setAttribute(
        "translate",
        new THREE.InstancedBufferAttribute(triangulate(points), 3)
      );
      geometry.computeVertexNormals();
      geometry.computeBoundingSphere();
      spheres.current = geometry;
    }
  }, [points]);
  useAnimationFrame((deltaTime) => {
    if (!material) return;
    setMaterial((prevMaterial) => {
      prevMaterial.uniforms["time"].value = deltaTime;
    });
  });

  useEffect(() => {
    const newMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        map: {
          value: new THREE.TextureLoader().load("assets/circle.png"),
        },
        time: { value: 0.0 },
      },
      vertexShader,
      fragmentShader,
      depthTest: true,
      depthWrite: true,
    });
    setMaterial(newMaterial);
  }, []);

  return (
    <group rotation={[0, Math.PI, Math.PI]} position={[-200, 50, 0]}>
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
                opacity: 0.6,
              })
            }
          />

          {generateLights(points)}
        </>
      )}
      {spheres.current && (
        <>
          <instancedBufferGeometry attach="geometry" ref={spheres} />
          <mesh geometry={spheres.current} material={material} />
        </>
      )}
    </group>
  );
};

const generateLights = (points) => {
  const mesh = <Sphere radius={3} widthSegments={36} heightSegments={8} />;
  return points
    .filter((item, index) => index % 40 === 0)
    .map((point) => (
      <pointLight
        key={point.x}
        color={`rgb(${255 * Math.random()},${255 * Math.random()}, ${
          255 * Math.random()
        })`}
        position={[point.x, point.y, point.z - 20]}
        mesh={mesh}
        intensity={2}
        distance={50}
        material={
          new THREE.MeshBasicMaterial({
            color: `rgb(${255 * Math.random()},${255 * Math.random()}, ${
              255 * Math.random()
            })`,
          })
        }
      />
    ));
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

const vertexShader = `precision highp float;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float time;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 translate;

varying vec2 vUv;
varying float vScale;

void main() {

    vec4 mvPosition = modelViewMatrix * vec4( translate, 1.0 );
    vec3 trTime = vec3(translate.x + time,translate.y + time,translate.z + time);
    float scale =  sin( trTime.x * 2.1 ) + sin( trTime.y * 3.2 ) + sin( trTime.z * 4.3 );
    vScale = scale;
    scale = scale * 10.0 + 10.0;
    mvPosition.xyz += position * scale;
    vUv = uv;
    gl_Position = projectionMatrix * mvPosition;

}`;

const fragmentShader = `precision highp float;

uniform sampler2D map;

varying vec2 vUv;
varying float vScale;

// HSL to RGB Convertion helpers
vec3 HUEtoRGB(float H){
    H = mod(H,1.0);
    float R = abs(H * 6.0 - 3.0) - 1.0;
    float G = 2.0 - abs(H * 6.0 - 2.0);
    float B = 2.0 - abs(H * 6.0 - 4.0);
    return clamp(vec3(R,G,B),0.0,1.0);
}

vec3 HSLtoRGB(vec3 HSL){
    vec3 RGB = HUEtoRGB(HSL.x);
    float C = (1.0 - abs(2.0 * HSL.z - 1.0)) * HSL.y;
    return (RGB - 0.5) * C + HSL.z;
}

void main() {
    vec4 diffuseColor = texture2D( map, vUv );
    gl_FragColor = vec4( diffuseColor.xyz * HSLtoRGB(vec3(vScale/5.0, 1.0, 0.5)), diffuseColor.w );

    if ( diffuseColor.w < 0.5 ) discard;
}`;
