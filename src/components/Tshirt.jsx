import React, { useMemo, useEffect, useState } from "react";
import { Decal, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function makeTextTexture(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.font = "bold 80px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  return new THREE.CanvasTexture(canvas);
}

export default function Tshirt({ elements = [], activeSide }) {
  const { nodes, materials, scene } = useGLTF("/models/tshirt.glb");
  const [bbox, setBbox] = useState(null);

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    console.log("👕 Bounding box size:", size);
    console.log("👕 Bounding box center:", center);

    setBbox({ size, center });
  }, [scene]);

  const sideConfig = {
    front: { key: "Object_10", rot: [0, 0, 0], axis: "z", depth: 1 },
    back: { key: "Object_14", rot: [0, Math.PI, 0], axis: "z", depth: -1 },
    right: { key: "Object_18", rot: [0, Math.PI / 2, 0], axis: "x", depth: 1 },
    left: { key: "Object_20", rot: [0, -Math.PI / 2, 0], axis: "x", depth: -1 },
  };

  const side = sideConfig[activeSide];
  const loader = new THREE.TextureLoader();

  const textures = useMemo(() => {
    return elements.map((el) =>
      el.type === "text" ? makeTextTexture(el.content) : loader.load(el.content)
    );
  }, [elements]);

  if (!bbox || !side) return null;

  return (
    <group dispose={null} position={[0, -3.8, 0]} scale={[3, 3, 3]}>
      {/* Base Shirt */}
      <mesh geometry={nodes.Object_10.geometry} material={materials.Body_FRONT_2664} />
      <mesh geometry={nodes.Object_14.geometry} material={materials.Body_FRONT_2664} />
      <mesh geometry={nodes.Object_6.geometry} material={materials.Body_FRONT_2664} />
      <mesh geometry={nodes.Object_8.geometry} material={materials.Body_FRONT_2664} />
      <mesh geometry={nodes.Object_18.geometry} material={materials.Sleeves_FRONT_2669} />
      <mesh geometry={nodes.Object_20.geometry} material={materials.Sleeves_FRONT_2669} />

      {/* Decals */}
      <mesh geometry={nodes[side.key].geometry} material={nodes[side.key].material}>
        {elements.map((el, i) => {
          // Normalize editor coords into [-1,1]
          const editorWidth = activeSide === "left" || activeSide === "right" ? 500 : 400;
          const editorHeight = 400;

          const centerX = el.x + el.width / 2;
          const centerY = el.y + el.height / 2;

          const normX = (centerX / editorWidth) * 2 - 1;
          const normY = 1 - (centerY / editorHeight) * 2;

          const { size, center } = bbox;
          let pos = [center.x, center.y, center.z];

          // Apply normalized offsets
          pos[0] += normX * (size.x / 2);
          pos[1] += normY * (size.y / 2);

          // Snap decal to correct bounding box face
          if (side.axis === "z") {
            pos[2] = center.z + (side.depth * size.z) / 2; // front/back
          } else if (side.axis === "x") {
            pos[0] = center.x + (side.depth * size.x) / 2; // left/right sleeves
          }

          // Scale relative to bounding box
          const scale = [
            (el.width / editorWidth) * size.x,
            (el.height / editorHeight) * size.y,
            1,
          ];

          return (
            <Decal key={el.id} position={pos} rotation={side.rot} scale={scale}>
              <meshStandardMaterial
                map={textures[i]}
                transparent
                toneMapped={false}
                polygonOffset
                polygonOffsetFactor={-1}
              />
            </Decal>
          );
        })}
      </mesh>
    </group>
  );
}

useGLTF.preload("/models/tshirt.glb");
