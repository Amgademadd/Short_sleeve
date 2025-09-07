// Tshirt.jsx
import React, { useEffect, useState, useRef } from "react";
import { Decal, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ✅ إنشاء texture من النص
function makeTextTexture(el) {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, size, size);

  const fontSize = el.fontSize ? el.fontSize * (size / 200) : 100;
  ctx.font = `${el.bold ? "bold " : ""}${el.italic ? "italic " : ""}${fontSize}px ${
    el.fontFamily || "Arial"
  }`;
  ctx.fillStyle = el.color || "#000";
  ctx.textAlign = el.align || "center";
  ctx.textBaseline = "middle";

  // 🟢 دعم سطور متعددة
  const lines = (el.content || "").split("\n");
  lines.forEach((line, i) => {
    ctx.fillText(line, size / 2, size / 2 + i * fontSize * 1.2);
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = 8;

  return tex;
}

// ✅ إنشاء texture من الإيموجي
function makeEmojiTexture(el) {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, size, size);

  const fontSize = el.width ? el.width * (size / 200) : 200;
  ctx.font = `${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(el.content, size / 2, size / 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

export default function Tshirt({
  elementsBySide = {},
  activeSide = "front",
  shirtColor = "#ffffff",
}) {
  const { nodes, scene } = useGLTF("/models/tshirt.glb");
  const [bbox, setBbox] = useState(null);
  const groupRef = useRef();

  // 🟢 حساب حجم ومركز الموديل
  useEffect(() => {
    if (!scene) return;
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    setBbox({ size, center });
  }, [scene]);

  // 🟢 إعدادات كل جانب
  const sideConfig = {
    front: { key: "Object_10", rotY: 0, axis: "z", depthSign: 1 },
    back: { key: "Object_14", rotY: Math.PI, axis: "z", depthSign: -1 },
    right: { key: "Object_18", rotY: Math.PI / 2, axis: "x", depthSign: 1 },
    left: { key: "Object_20", rotY: -Math.PI / 2, axis: "x", depthSign: -1 },
  };

  // 🟢 دوران تدريجي عند تغيير الوجه
  const targetQuatRef = useRef(new THREE.Quaternion());
  useEffect(() => {
    const q = new THREE.Quaternion();
    q.setFromEuler(new THREE.Euler(0, sideConfig[activeSide]?.rotY || 0, 0));
    targetQuatRef.current.copy(q);
  }, [activeSide]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.quaternion.slerp(targetQuatRef.current, 0.12);
    }
  });

  if (!bbox) return null;
  const { size, center } = bbox;

  const baseMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(shirtColor),
    roughness: 0.6,
  });

  return (
    <group ref={groupRef} dispose={null} position={[0, 0, 0]} scale={[3, 3, 3]}>
      <group position={[0, -1.287, 0]}>
        {/* 🟢 Base T-shirt meshes */}
        {nodes.Object_6 && <mesh geometry={nodes.Object_6.geometry} material={baseMaterial} />}
        {nodes.Object_8 && <mesh geometry={nodes.Object_8.geometry} material={baseMaterial} />}

        {/* 🟢 Render لكل جانب + Decals */}
        {Object.entries(elementsBySide).map(([sideName, elements]) => {
          if (sideName === "__editorSize") return null; // ✅ نتجاهل حجم الـ editor
          const side = sideConfig[sideName];
          if (!side || !nodes[side.key]) return null;

          // ناخد أبعاد الـ editor من LayoutEditor
          const editorWidth = elementsBySide.__editorSize?.width || 400;
          const editorHeight = elementsBySide.__editorSize?.height || 400;

          return (
            <mesh key={sideName} geometry={nodes[side.key].geometry} material={baseMaterial}>
              {elements.map((el, i) => {
                // 🟢 Normalize position
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
                  pos[2] += normX * (size.z / 2);
                }

                // 🟢 Scale
                const sx = ((el.width || 0) / editorWidth) * size.x;
                const sy = ((el.height || 0) / editorHeight) * size.y;
                const scale = [sx || 0.1, sy || 0.1, 1];

                // 🟢 Rotation
                let rotation = [0, 0, 0];
                if (side.axis === "z") {
                  if (sideName === "back") rotation = [0, Math.PI, 0];
                } else {
                  rotation = [0, Math.PI / 2, 0];
                  if (sideName === "left") rotation = [0, -Math.PI / 2, 0];
                }

                // نضيف دوران العنصر نفسه
                const extraRot = (el.rotation || 0) * (Math.PI / 180);
                rotation = [rotation[0], rotation[1], extraRot];

                // 🟢 اختيار texture حسب النوع
                const map =
                  el.type === "text"
                    ? makeTextTexture(el)
                    : el.type === "emoji"
                    ? makeEmojiTexture(el)
                    : (() => {
                        try {
                          return new THREE.TextureLoader().load(el.content);
                        } catch {
                          return null;
                        }
                      })();

                if (!map) return null;

                return (
                  <Decal
                    key={el.id || `${sideName}-${i}`}
                    position={pos}
                    rotation={rotation}
                    scale={scale}
                  >
                    <meshStandardMaterial
                      map={map}
                      transparent
                      depthTest
                      depthWrite={false}
                      polygonOffset
                      polygonOffsetFactor={-10}
                    />
                  </Decal>
                );
              })}
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

useGLTF.preload("/models/tshirt.glb");
