// Tshirt.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { Decal, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Creates a canvas texture for a text element (uses element style props)
 * el = { content, fontSize, fontFamily, color, bold, italic, align, inverted }
 */
function makeTextTexture(el, renderer) {
  const size = 2048; // bigger canvas
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, size, size);

  // background
  if (el.inverted) {
    ctx.fillStyle = el.color || "#000";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#fff";
  } else {
    ctx.fillStyle = el.color || "#000";
  }

  // font
  const fontSize = el.fontSize ? el.fontSize * (size / 200) : 200;
  ctx.font = `${el.bold ? "bold " : ""}${el.italic ? "italic " : ""}${fontSize}px ${el.fontFamily || "Arial"}`;
  ctx.textAlign = el.align || "center";
  ctx.textBaseline = "middle";

  ctx.fillText(el.content || "", size / 2, size / 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.flipY = false;
  tex.needsUpdate = true;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = Math.min(16, renderer?.capabilities?.getMaxAnisotropy?.() || 4);

  return tex;
}


export default function Tshirt({ elements = [], activeSide = "front", shirtColor = "#ffffff" }) {
  const { nodes, scene } = useGLTF("/models/tshirt.glb");
  const [bbox, setBbox] = useState(null);
  const groupRef = useRef();

  useEffect(() => {
    if (!scene) return;
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    setBbox({ size, center });
  }, [scene]);

  const sideConfig = {
    front: { key: "Object_10", rotY: 0, axis: "z", depthSign: 1 },
    back: { key: "Object_14", rotY: Math.PI, axis: "z", depthSign: -1 },
    right: { key: "Object_18", rotY: Math.PI / 2, axis: "x", depthSign: 1 },
    left: { key: "Object_20", rotY: -Math.PI / 2, axis: "x", depthSign: -1 },
  };
  const side = sideConfig[activeSide];

  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return elements.map((el) => {
      if (el.type === "text") return makeTextTexture(el);
      try {
        return loader.load(el.content);
      } catch {
        return null;
      }
    });
  }, [elements]);

  const targetQuatRef = useRef(new THREE.Quaternion());
  useEffect(() => {
    const q = new THREE.Quaternion();
    q.setFromEuler(new THREE.Euler(0, side ? side.rotY : 0, 0));
    targetQuatRef.current.copy(q);
  }, [activeSide, side]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.quaternion.slerp(targetQuatRef.current, 0.12);
    }
  });

  if (!bbox || !side) return null;

  const { size, center } = bbox;
  const editorWidth = activeSide === "left" || activeSide === "right" ? 500 : 400;
  const editorHeight = 400;

  const baseMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(shirtColor),
    roughness: 0.6,
  });

  return (
    <group ref={groupRef} dispose={null} position={[0, 0, 0]} scale={[3, 3, 3]}>
      <group position={[0, -1.2870988845825195, 0]}>
        {/* Shirt base meshes */}
        {nodes.Object_10 && <mesh geometry={nodes.Object_10.geometry} material={baseMaterial} />}
        {nodes.Object_14 && <mesh geometry={nodes.Object_14.geometry} material={baseMaterial} />}
        {nodes.Object_6 && <mesh geometry={nodes.Object_6.geometry} material={baseMaterial} />}
        {nodes.Object_8 && <mesh geometry={nodes.Object_8.geometry} material={baseMaterial} />}
        {nodes.Object_18 && <mesh geometry={nodes.Object_18.geometry} material={baseMaterial} />}
        {nodes.Object_20 && <mesh geometry={nodes.Object_20.geometry} material={baseMaterial} />}

        {/* Decals */}
        <mesh geometry={nodes[side.key].geometry} material={nodes[side.key].material}>
          {elements.map((el, i) => {
            const centerX = el.x + (el.width || 0) / 2;
            const centerY = el.y + (el.height || 0) / 2;
            const normX = (centerX / editorWidth) * 2 - 1;
            const normY = 1 - (centerY / editorHeight) * 2;

            const pos = [center.x, center.y, center.z];
            pos[0] += normX * (size.x / 2);
            pos[1] += normY * (size.y / 2);
            if (side.axis === "z") {
              pos[2] = center.z + side.depthSign * (size.z / 2);
            } else {
              pos[0] = center.x + side.depthSign * (size.x / 2);
            }

            const sx = ((el.width || 0) / editorWidth) * size.x;
            const sy = ((el.height || 0) / editorHeight) * size.y;
            const scale = [sx || 0.1, sy || 0.1, 1];

            // ✅ Fix: rotate -Math.PI around X so text isn't inverted
            let rotation = [-Math.PI, 0, 0];
            if (side.axis === "z") {
              rotation = [-Math.PI, 0, 0]; // front
              if (activeSide === "back") rotation = [-Math.PI, Math.PI, 0];
            } else {
              rotation = [-Math.PI, Math.PI / 2, 0]; // right
              if (activeSide === "left") rotation = [-Math.PI, -Math.PI / 2, 0];
            }

            const map = textures[i];
            if (!map) return null;

            return (
              <Decal key={el.id || `${i}`} position={pos} rotation={rotation} scale={scale}>
                <meshStandardMaterial
                  map={map}
                  transparent
                  depthTest={true}
                  toneMapped={false}
                  polygonOffset
                  polygonOffsetFactor={-1}
                />
              </Decal>
            );
          })}
        </mesh>
      </group>
    </group>
  );
}

useGLTF.preload("/models/tshirt.glb");
