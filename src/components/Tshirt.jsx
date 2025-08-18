import React, { useMemo } from "react";
import { Decal, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// ✅ Utility: Create text texture with alignment support
function useTextTexture(text, options = {}, align = "center", vAlign = "middle") {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = options.color || "blue";
    ctx.font = options.font || "bold 80px Arial";

    // Horizontal alignment
    if (align === "left") ctx.textAlign = "left";
    else if (align === "right") ctx.textAlign = "right";
    else ctx.textAlign = "center";

    // Vertical alignment
    if (vAlign === "top") ctx.textBaseline = "top";
    else if (vAlign === "bottom") ctx.textBaseline = "bottom";
    else ctx.textBaseline = "middle";

    const x =
      align === "left"
        ? 0
        : align === "right"
        ? canvas.width
        : canvas.width / 2;

    const y =
      vAlign === "top"
        ? 0
        : vAlign === "bottom"
        ? canvas.height
        : canvas.height / 2;

    ctx.fillText(text, x, y);

    return new THREE.CanvasTexture(canvas);
  }, [text, options, align, vAlign]);
}

export default function Tshirt({ text, box, activeSide }) {
  const { nodes, materials } = useGLTF("/models/tshirt.glb");

  // Editor dimensions (match your LayoutEditor size)
  const editorWidth = 300;
  const editorHeight = 400;

  // Decide alignment based on drag box
  let align = "center";
  if (box?.x < editorWidth * 0.33) align = "left";
  else if (box?.x > editorWidth * 0.66) align = "right";

  let vAlign = "middle";
  if (box?.y < editorHeight * 0.33) vAlign = "top";
  else if (box?.y > editorHeight * 0.66) vAlign = "bottom";

  const textTexture = useTextTexture(text, { color: "blue" }, align, vAlign);

  // Position + scale mapping
  const posY = 1.5 - (box?.y || 0) / 100;
  const posX = (box?.x || 0) / 200;
  const scale = [(box?.width || 100) / 200, (box?.height || 100) / 200, 1];

  // Active mesh → side mapping
  const sideConfig = {
    front: { key: "Object_10", pos: [posX, posY, 0.25], rot: [0, 0, 0] },
    back: { key: "Object_14", pos: [posX, posY, -0.25], rot: [0, Math.PI, 0] },
    right: { key: "Object_18", pos: [0.4, posY, posX], rot: [0, Math.PI / 2, 0] },
    left: { key: "Object_20", pos: [-0.4, posY, posX], rot: [0, -Math.PI / 2, 0] },
  };

  const { key, pos, rot } = sideConfig[activeSide];

  return (
    <group dispose={null} position={[0, -3.8, 0]} scale={[3, 3, 3]}>
      {/* Base Shirt */}
      <mesh geometry={nodes.Object_10.geometry} material={materials.Body_FRONT_2664} />
      <mesh geometry={nodes.Object_14.geometry} material={materials.Body_FRONT_2664} />
      <mesh geometry={nodes.Object_6.geometry} material={materials.Body_FRONT_2664} />
      <mesh geometry={nodes.Object_8.geometry} material={materials.Body_FRONT_2664} />
      <mesh geometry={nodes.Object_18.geometry} material={materials.Sleeves_FRONT_2669} />
      <mesh geometry={nodes.Object_20.geometry} material={materials.Sleeves_FRONT_2669} />

      {/* Active decal only on selected mesh */}
      <mesh geometry={nodes[key].geometry} material={nodes[key].material}>
        <Decal position={pos} rotation={rot} scale={scale}>
          <meshStandardMaterial
            map={textTexture}
            transparent
            toneMapped={false}
            polygonOffset
            polygonOffsetFactor={-1}
          />
        </Decal>
      </mesh>
    </group>
  );
}

useGLTF.preload("/models/tshirt.glb");
