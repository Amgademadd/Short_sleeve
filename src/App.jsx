import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Stage, OrbitControls } from "@react-three/drei"; // Import OrbitControls here
import Tshirt from "./components/Tshirt";
import LayoutEditor from "./components/LayoutEditor";

export default function App() {
  const [text, setText] = useState("My Text");
  const [box, setBox] = useState({
    x: 50,
    y: 50,
    width: 200,
    height: 100,
  });

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left side panel */}
      <div style={{ width: "320px", padding: "10px", background: "#222", color: "white" }}>
        <h3>Layout Editor</h3>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ width: "100%", marginBottom: "10px", padding: "6px" }}
        />
        <LayoutEditor box={box} setBox={setBox} text={text} />
      </div>

      {/* 3D Canvas */}
      <div style={{ flex: 1, background: "#111" }}>
        <Canvas camera={{ position: [0, 0, 3] }}>
          {/* Add OrbitControls here to enable rotation */}
          <OrbitControls />
          <Stage environment="city" intensity={0.6}>
            <Tshirt text={text} box={box} />
          </Stage>
        </Canvas>
      </div>
    </div>
  );
}