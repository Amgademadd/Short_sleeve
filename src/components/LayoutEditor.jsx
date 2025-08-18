import { useState } from "react"
import Draggable from "react-draggable"

export default function LayoutEditor({ onExport }) {
  const [items, setItems] = useState([
    {
      id: "text-1",
      type: "text",
      content: "Drag me!",
      position: { x: 50, y: 50 }, // ✅ must initialize x and y
    },
  ])

  const handleDrag = (id, e, data) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, position: { x: data.x, y: data.y } }
          : item
      )
    )
    console.log(`📍 Item ${id} dragged to: x=${data.x}, y=${data.y}`)
  }

  return (
    <div
      style={{
        width: "400px",
        height: "500px",
        border: "2px dashed gray",
        margin: "20px",
        position: "relative",
        overflow: "hidden",
        background: "#fff",
      }}
    >
      {items.map((item) => (
        <Draggable
          key={item.id}
          position={{ x: item.position?.x || 0, y: item.position?.y || 0 }} // ✅ fallback safety
          onDrag={(e, data) => handleDrag(item.id, e, data)}
        >
          <div
            style={{
              position: "absolute",
              padding: "8px 12px",
              background: "rgba(0,0,0,0.05)",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "move",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            {item.content}
          </div>
        </Draggable>
      ))}
    </div>
  )
}
