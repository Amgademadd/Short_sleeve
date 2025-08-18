import React, { useState } from "react";
import LayoutEditor from "./components/LayoutEditor";
import Experience from "./components/Experience";

export default function App() {
  const [box, setBox] = useState({ x: 50, y: 50, width: 120, height: 60 });
  const [text, setText] = useState("My Text");
  const [activeSide, setActiveSide] = useState("front");

  return (
    <div style={{ display: "flex" }}>
      {/* UI Side */}
      <div style={{ width: "300px", padding: "10px", background: "#222", color: "white" }}>
        <h3>Layout Editor</h3>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        />

        {/* Side buttons */}
        <div style={{ marginBottom: "10px" }}>
          {["front", "back", "left", "right"].map((side) => (
            <button
              key={side}
              style={{
                margin: "2px",
                background: activeSide === side ? "orange" : "gray",
                color: "white",
              }}
              onClick={() => setActiveSide(side)}
            >
              {side.toUpperCase()}
            </button>
          ))}
        </div>

        <LayoutEditor box={box} setBox={setBox} text={text} />
      </div>

      {/* 3D Side */}
      <div style={{ flex: 1, height: "100vh", background: "black" }}>
        <Experience text={text} box={box} activeSide={activeSide} />
      </div>
    </div>
  );
}
