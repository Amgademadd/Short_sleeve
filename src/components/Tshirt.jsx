import React, { useMemo } from "react";
import { Decal, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// Utility: generate text texture
function useTextTexture(text, options = {}) {
  return useMemo(() => {
    const {
      font = "bold 64px Arial",
      color = "black",
      background = "transparent",
    } = options;

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    if (background !== "transparent") {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [text, options]);
}

export default function Tshirt({ text, box }) {
  const { nodes } = useGLTF("/models/tshirt.glb");

  const textTexture = useTextTexture(text, {
    font: "bold 80px Arial",
    color: "red",
  });

  // Map 2D box → 3D space
  const pos = [box.x / 100, 1.5 - box.y / 100, 0.2];
  const scale = [box.width / 150, box.height / 150, 1];

  return (
    <group dispose={null}>
      {Object.keys(nodes).map((key) => {
        const node = nodes[key];
        if (node.isMesh) {
          return (
            <mesh key={key} geometry={node.geometry} material={node.material}>
<Decal position={pos} rotation={[0, 0, 0]} scale={scale}>
  <meshStandardMaterial
    map={textTexture}
    transparent
    toneMapped={false}
    polygonOffset
    polygonOffsetFactor={-1}
    side={THREE.FrontSide} // Fix is here!
  />
              </Decal>
            </mesh>
          );
        }
        return null;
      })}
    </group>
  );
}

useGLTF.preload("/models/tshirt.glb");