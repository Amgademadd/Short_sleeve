import React, { useState, useMemo } from "react";
import { Decal, useGLTF } from "@react-three/drei";
import { useControls } from "leva";
import * as THREE from "three";   // ✅ Fix: import THREE

// Utility: create a canvas texture with text
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

    // background
    if (background !== "transparent") {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // text
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

export default function Tshirt({ text = "My Custom Text" }) { // ✅ accept live text as prop
  const { nodes } = useGLTF("/models/tshirt.glb");

  // Custom text texture (live)
  const textTexture = useTextTexture(text, {
    font: "bold 80px Arial",
    color: "red",
  });

  // Decal controls
  const [pos, setPos] = useState([0, 1.5, 0.2]);
  const [rotation, setRotation] = useState([0, 0, 0]);
  const [scale, setScale] = useState([2, 2, 2]);

  useControls({
    posX: { value: pos[0], min: -2, max: 2, step: 0.01, onChange: (v) => setPos(([_, y, z]) => [v, y, z]) },
    posY: { value: pos[1], min: 0, max: 3, step: 0.01, onChange: (v) => setPos(([x, _, z]) => [x, v, z]) },
    posZ: { value: pos[2], min: -2, max: 2, step: 0.01, onChange: (v) => setPos(([x, y, _]) => [x, y, v]) },
    scale: { value: scale[0], min: 0.5, max: 5, step: 0.01, onChange: (v) => setScale([v, v, v]) },
  });

  return (
    <group dispose={null}>
      {Object.keys(nodes).map((key) => {
        const node = nodes[key];
        if (node.isMesh) {
          return (
            <mesh key={key} geometry={node.geometry} material={node.material}>
              <Decal position={pos} rotation={rotation} scale={scale}>
                <meshStandardMaterial
                  map={textTexture} // ✅ using live text as decal
                  transparent
                  toneMapped={false}
                  polygonOffset
                  polygonOffsetFactor={-1}
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
