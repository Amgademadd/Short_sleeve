// App.jsx
import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, Environment } from "@react-three/drei";
import Tshirt from "./components/Tshirt";
import LayoutEditor from "./components/LayoutEditor";

export default function App() {
  const [elements, setElements] = useState([]); // design elements
  const [activeSide, setActiveSide] = useState("front"); // front|back|left|right
  const [shirtColor, setShirtColor] = useState("#ffffff");

  return (
    <div style={{ display: "flex", gap: 20, padding: 20 }}>
      {/* Left: controls + editor */}
      <div>
        <h3>Layout Editor — side: {activeSide}</h3>

        <div style={{ marginBottom: 10 }}>
          <button onClick={() => setActiveSide("front")}>Front</button>
          <button onClick={() => setActiveSide("back")}>Back</button>
          <button onClick={() => setActiveSide("left")}>Left Sleeve</button>
          <button onClick={() => setActiveSide("right")}>Right Sleeve</button>
        </div>

        <LayoutEditor
          elements={elements}
          setElements={setElements}
          activeSide={activeSide}
          shirtColor={shirtColor}
          setShirtColor={setShirtColor}
        />
      </div>

      {/* Right: 3D preview */}
      <div style={{ width: 680, height: 680, background: "#eee", borderRadius: 6 }}>
        <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
          <React.Suspense fallback={null}>
            <Stage environment="sunset" intensity={0.6} adjustCamera={false}>
              <Tshirt
                elements={elements}
                activeSide={activeSide}
                shirtColor={shirtColor}
              />
            </Stage>

            <Environment preset="city" />
          </React.Suspense>

          <OrbitControls enablePan={true} />
        </Canvas>
      </div>
    </div>
  );
}
