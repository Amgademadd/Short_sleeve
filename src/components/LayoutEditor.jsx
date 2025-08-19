import React from "react";
import { Rnd } from "react-rnd";

export default function LayoutEditor({ box, setBox, text }) {
  const { x, y, width, height } = box;

  return (
    <div
      style={{
        width: "400px", // The container's width
        height: "400px", // The container's height
        position: "relative",
        border: "2px dashed gray",
        background: "white",
      }}
    >
      <Rnd
        // The size is now fixed based on the 'box' prop
        size={{ width: width, height: height }}
        position={{ x: x, y: y }}
        
        // This is the important change: we only allow dragging
        onDragStop={(e, d) => setBox({ ...box, x: d.x, y: d.y })}
        
        // We remove the onResizeStop handler to disable resizing
        // onResizeStop={(e, direction, ref, delta, position) => { ... }}
        
        bounds="parent"
        
        // This style property explicitly hides the resize handles
        resizeHandleWrapperStyle={{ display: 'none' }}

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