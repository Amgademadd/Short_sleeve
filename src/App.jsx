import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Stage } from "@react-three/drei";
import Tshirt from "./components/Tshirt";

export default function App() {
  const [text, setText] = useState("Hello World");

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      {/* Live text input */}
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          padding: "10px",
          fontSize: "16px",
          zIndex: 10,
        }}
      />

      <Canvas camera={{ position: [0, 0, 3] }}>
        <Stage environment="city" intensity={0.6}>
          <Tshirt text={text} /> {/* ✅ pass text prop */}
        </Stage>
      </Canvas>
    </div>
  );
}
