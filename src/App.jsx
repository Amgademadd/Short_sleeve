import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage } from "@react-three/drei";
import Tshirt from "./components/Tshirt";
import LayoutEditor from "./components/LayoutEditor";

export default function App() {
  const [elements, setElements] = useState([]); // stores text & image objects
  const [activeSide, setActiveSide] = useState("front"); // default side

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      {/* Left Panel: Layout Editor */}
      <div>
        <h3>Layout Editor ({activeSide})</h3>
        <div style={{ marginBottom: "10px" }}>
          <button onClick={() => setActiveSide("front")}>Front</button>
          <button onClick={() => setActiveSide("back")}>Back</button>
          <button onClick={() => setActiveSide("left")}>Left Sleeve</button>
          <button onClick={() => setActiveSide("right")}>Right Sleeve</button>
        </div>

        <LayoutEditor elements={elements} setElements={setElements} />
      </div>

      {/* Right Panel: 3D Tshirt */}
      <div style={{ width: "600px", height: "600px" }}>
        <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
          <Stage environment="sunset" intensity={0.6} adjustCamera>
            <Tshirt elements={elements} activeSide={activeSide} />
          </Stage>
          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
}
