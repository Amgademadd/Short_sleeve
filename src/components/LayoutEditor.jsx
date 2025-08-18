import React from "react";
import { Rnd } from "react-rnd";

export default function LayoutEditor({ box, setBox, text }) {
  return (
    <div
      style={{
        width: "280px",
        height: "280px",
        position: "relative",
        border: "2px dashed gray",
        background: "white",
      }}
    >
      <Rnd
        size={{ width: box.width, height: box.height }}
        position={{ x: box.x, y: box.y }}
        onDragStop={(e, d) => setBox({ ...box, x: d.x, y: d.y })}
        onResizeStop={(e, direction, ref, delta, position) => {
          setBox({
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height),
            ...position,
          });
        }}
        bounds="parent"
        style={{
          border: "1px solid red",
          background: "rgba(255,0,0,0.1)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "move",
        }}
      >
        {text}
      </Rnd>
    </div>
  );
}
