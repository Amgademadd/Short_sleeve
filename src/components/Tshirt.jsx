import React, { useMemo } from "react";
import { Decal, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// ✅ Plain function (not a hook)
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
  const { nodes, materials } = useGLTF("/models/tshirt.glb");

  const sideConfig = {
    front: { key: "Object_10", basePos: [0, 0, 0.25], rot: [0, 0, 0] },
    back: { key: "Object_14", basePos: [0, 0, -0.25], rot: [0, Math.PI, 0] },
    right: { key: "Object_18", basePos: [0.4, 0, 0], rot: [0, Math.PI / 2, 0] },
    left: { key: "Object_20", basePos: [-0.4, 0, 0], rot: [0, -Math.PI / 2, 0] },
  };

  const side = sideConfig[activeSide];
  if (!side) return null;

  const loader = new THREE.TextureLoader();

  // ✅ useMemo to avoid recreating textures every render
  const textures = useMemo(() => {
    return elements.map((el) =>
      el.type === "text" ? makeTextTexture(el.content) : loader.load(el.content)
    );
  }, [elements]);

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
          const pos = [
            side.basePos[0] + (el.x - 140) / 300,
            side.basePos[1] + 1.5 - el.y / 100,
            side.basePos[2],
          ];
          const scale = [el.width / 150, el.height / 150, 1];

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