import React, { useMemo } from "react";
import { Decal, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function useTextTexture(text, options = {}) {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = options.color || "blue";
    ctx.font = options.font || "bold 80px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    return new THREE.CanvasTexture(canvas);
  }, [text, options]);
}

export default function Tshirt({ text, box, activeSide }) {
  const { nodes, materials } = useGLTF("/models/tshirt.glb");
  const textTexture = useTextTexture(text, { color: "blue" });

  // Get bounding boxes of each mesh
  const bounds = {};
  ["Object_10", "Object_14", "Object_18", "Object_20"].forEach((key) => {
    const geom = nodes[key].geometry;
    geom.computeBoundingBox();
    bounds[key] = geom.boundingBox.clone();
  });

  // Map editor size to mesh bounding box
  const editorWidth = 300; // must match LayoutEditor
  const editorHeight = 400;

  const sideConfig = {
    front: { key: "Object_10", rot: [0, 0, 0] },
    back: { key: "Object_14", rot: [0, Math.PI, 0] },
    right: { key: "Object_18", rot: [0, Math.PI / 2, 0] },
    left: { key: "Object_20", rot: [0, -Math.PI / 2, 0] },
  };

  const { key, rot } = sideConfig[activeSide];
  const bbox = bounds[key];

  // Normalize editor box coords
  const normX = (box?.x || 0) / editorWidth;
  const normY = (box?.y || 0) / editorHeight;

  // Position inside mesh bounding box
  const posX = THREE.MathUtils.lerp(bbox.min.x, bbox.max.x, normX);
  const posY = THREE.MathUtils.lerp(bbox.max.y, bbox.min.y, normY); // invert Y
  const posZ = (bbox.min.z + bbox.max.z) / 2;

  // Scale mapping
  const scaleX =
    ((box?.width || 100) / editorWidth) * (bbox.max.x - bbox.min.x);
  const scaleY =
    ((box?.height || 100) / editorHeight) * (bbox.max.y - bbox.min.y);

  return (
    <group dispose={null} position={[0, -3.8, 0]} scale={[3, 3, 3]}>
      {/* Base Shirt */}
      <mesh geometry={nodes.Object_10.geometry} material={materials.Body_FRONT_2664} />
      <mesh geometry={nodes.Object_14.geometry} material={materials.Body_FRONT_2664} />
      <mesh geometry={nodes.Object_6.geometry} material={materials.Body_FRONT_2664} />
      <mesh geometry={nodes.Object_8.geometry} material={materials.Body_FRONT_2664} />
      <mesh geometry={nodes.Object_18.geometry} material={materials.Sleeves_FRONT_2669} />
      <mesh geometry={nodes.Object_20.geometry} material={materials.Sleeves_FRONT_2669} />

      {/* Decal inside active mesh */}
      <mesh geometry={nodes[key].geometry} material={nodes[key].material}>
        <Decal position={[posX, posY, posZ]} rotation={rot} scale={[scaleX, scaleY, 1]}>
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
