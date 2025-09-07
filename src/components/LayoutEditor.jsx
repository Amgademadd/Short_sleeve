// LayoutEditor.jsx
import React, { useRef, useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import "./LayoutEditor.css";

export default function LayoutEditor({
  elementsBySide,
  setElementsBySide,
  activeSide,
  shirtColor,
  setShirtColor,
}) {
  const fileInputRef = useRef();
  const canvasRef = useRef();
  const wrapperRef = useRef();

  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState("none");

  const elements = elementsBySide[activeSide] || [];
  const selectedElement = elements.find((el) => el.id === selectedId);

  // 🆕 حفظ حجم الـ wrapper عشان 3D يبقى aligned
  useEffect(() => {
    if (wrapperRef.current) {
      const { offsetWidth, offsetHeight } = wrapperRef.current;
      setElementsBySide((prev) => ({
        ...prev,
        __editorSize: { width: offsetWidth, height: offsetHeight },
      }));
    }
  }, [activeSide, setElementsBySide]);

  // -------- Helpers --------
  const updateSelected = (changes) => {
    if (!selectedId) return;
    setElementsBySide((prev) => ({
      ...prev,
      [activeSide]: prev[activeSide].map((el) =>
        el.id === selectedId ? { ...el, ...changes } : el
      ),
    }));
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setElementsBySide((prev) => ({
      ...prev,
      [activeSide]: prev[activeSide].filter((el) => el.id !== selectedId),
    }));
    setSelectedId(null);
  };

  // -------- Add Elements --------
  const addText = () => {
    const id = Date.now();
    setElementsBySide((prev) => ({
      ...prev,
      [activeSide]: [
        ...(prev[activeSide] || []),
        {
          id,
          type: "text",
          content: "New Text",
          x: 150,
          y: 150,
          width: 160,
          height: 50,
          fontSize: 28,
          fontFamily: "Arial",
          color: "#000000",
          bold: false,
          italic: false,
          align: "center",
          rotation: 0,
        },
      ],
    }));
    setSelectedId(id);
  };

  const addImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const id = Date.now();
      setElementsBySide((prev) => ({
        ...prev,
        [activeSide]: [
          ...(prev[activeSide] || []),
          {
            id,
            type: "image",
            content: ev.target.result,
            x: 120,
            y: 120,
            width: 160,
            height: 160,
            rotation: 0,
            opacity: 1,
            flipped: false,
          },
        ],
      }));
      setSelectedId(id);
    };
    reader.readAsDataURL(file);
  };

  const addShape = (shapeType) => {
    const id = Date.now();
    setElementsBySide((prev) => ({
      ...prev,
      [activeSide]: [
        ...(prev[activeSide] || []),
        {
          id,
          type: "shape",
          shapeType,
          x: 180,
          y: 180,
          width: 100,
          height: 100,
          color: "#ff0000",
          rotation: 0,
        },
      ],
    }));
    setSelectedId(id);
  };

  const addEmoji = (emoji) => {
    const id = Date.now();
    setElementsBySide((prev) => ({
      ...prev,
      [activeSide]: [
        ...(prev[activeSide] || []),
        {
          id,
          type: "emoji",
          content: emoji.native,
          x: 150,
          y: 150,
          width: 80,
          height: 80,
          rotation: 0,
        },
      ],
    }));
    setSelectedId(id);
    setActiveTab("none");
  };

  // -------- Download --------
  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "design.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // -------- Masks --------
  const maskMap = {
    front: "/models/tshirt_Front.png",
    back: "/models/tshirt_Back.png",
    left: "/models/tshirt_Left.png",
    right: "/models/tshirt_Right.png",
  };
  const maskImage = maskMap[activeSide];

  return (
    <div className="layout-editor">
      {/* Sidebar */}
      <div className="sidebar">
        <h3>Customize</h3>
        <div className="tabs">
          <button onClick={addText}>Text</button>
          <button onClick={() => fileInputRef.current.click()}>Image</button>
          <button
            onClick={() =>
              setActiveTab(activeTab === "shapes" ? "none" : "shapes")
            }
          >
            Shapes
          </button>
          <button
            onClick={() =>
              setActiveTab(activeTab === "emojis" ? "none" : "emojis")
            }
          >
            Emojis
          </button>
          <div style={{ marginTop: "1rem" }}>
    <button
      onClick={() => document.getElementById("shirtColorPicker").click()}
      style={{
        width: "100%",
        padding: "10px",
        background: shirtColor,
        color: "#fff",
        fontWeight: "bold",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
      }}
    >
      Shirt Color
    </button>

    <input
      id="shirtColorPicker"
      type="color"
      value={shirtColor}
      onChange={(e) => setShirtColor(e.target.value)}
      style={{ display: "none" }}
    />
  </div>
        </div>

        {/* Shapes */}
        {activeTab === "shapes" && (
          <div className="options-panel">
            <h4>Shapes</h4>
            <button onClick={() => addShape("square")}>⬛ Square</button>
            <button onClick={() => addShape("circle")}>⚪ Circle</button>
          </div>
        )}

        {/* Emojis */}
        {activeTab === "emojis" && (
          <div className="options-panel">
            <h4>Pick an Emoji</h4>
            <Picker data={data} onEmojiSelect={addEmoji} />
          </div>
        )}

        {/* Text Options */}
        {selectedElement?.type === "text" && (
          <div className="options-panel">
            <label>
              Color{" "}
              <input
                type="color"
                value={selectedElement.color}
                onChange={(e) => updateSelected({ color: e.target.value })}
              />
            </label>
            <label>
              Font Size{" "}
              <input
                type="range"
                min="10"
                max="100"
                value={selectedElement.fontSize}
                onChange={(e) =>
                  updateSelected({ fontSize: parseInt(e.target.value) })
                }
              />
            </label>
            <label>
              Font
              <select
                value={selectedElement.fontFamily}
                onChange={(e) => updateSelected({ fontFamily: e.target.value })}
              >
                <option>Arial</option>
                <option>Verdana</option>
                <option>Times New Roman</option>
                <option>Courier New</option>
                <option>Georgia</option>
              </select>
            </label>
            <div className="row-buttons">
              <button
                onClick={() =>
                  updateSelected({ bold: !selectedElement.bold })
                }
              >
                {selectedElement.bold ? "Unbold" : "Bold"}
              </button>
              <button
                onClick={() =>
                  updateSelected({ italic: !selectedElement.italic })
                }
              >
                {selectedElement.italic ? "Unitalic" : "Italic"}
              </button>
            </div>
            <button className="delete" onClick={deleteSelected}>
              ❌ Delete
            </button>
          </div>
        )}

        {/* Image Options */}
        {selectedElement?.type === "image" && (
          <div className="options-panel">
            <label>
              Opacity{" "}
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={selectedElement.opacity}
                onChange={(e) =>
                  updateSelected({ opacity: parseFloat(e.target.value) })
                }
              />
            </label>
            <button className="delete" onClick={deleteSelected}>
              ❌ Delete
            </button>
          </div>
        )}

        {/* Shape Options */}
        {selectedElement?.type === "shape" && (
          <div className="options-panel">
            <label>
              Color{" "}
              <input
                type="color"
                value={selectedElement.color}
                onChange={(e) => updateSelected({ color: e.target.value })}
              />
            </label>
            <button className="delete" onClick={deleteSelected}>
              ❌ Delete
            </button>
          </div>
        )}

        {/* Emoji Options */}
        {selectedElement?.type === "emoji" && (
          <div className="options-panel">
            <label>
              Size{" "}
              <input
                type="range"
                min="20"
                max="200"
                value={selectedElement.width}
                onChange={(e) =>
                  updateSelected({
                    width: parseInt(e.target.value),
                    height: parseInt(e.target.value),
                  })
                }
              />
            </label>
            <button className="delete" onClick={deleteSelected}>
              ❌ Delete
            </button>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="canvas-area">
        <div
          ref={wrapperRef}
          className="canvas-wrapper"
          style={{
            WebkitMaskImage: `url(${maskImage})`,
            maskImage: `url(${maskImage})`,
          }}
        >
          {elements.map((el) => (
            <Rnd
              key={el.id}
              size={{ width: el.width, height: el.height }}
              position={{ x: el.x, y: el.y }}
              onMouseDown={() => setSelectedId(el.id)}
              onDragStop={(e, d) => updateSelected({ x: d.x, y: d.y })}
              onResizeStop={(e, dir, ref, delta, pos) =>
                updateSelected({
                  width: parseInt(ref.style.width, 10),
                  height: parseInt(ref.style.height, 10),
                  ...pos,
                })
              }
              bounds="parent"
              className={`rnd ${el.id === selectedId ? "active" : ""}`}
            >
              {el.type === "emoji" ? (
                <div
                  style={{
                    fontSize: `${Math.min(el.width, el.height)}px`,
                    lineHeight: 1,
                  }}
                >
                  {el.content}
                </div>
              ) : el.type === "text" ? (
                <div
                  className="text-element"
                  style={{
                    fontSize: `${el.fontSize}px`,
                    fontFamily: el.fontFamily,
                    color: el.color,
                    fontWeight: el.bold ? "bold" : "normal",
                    fontStyle: el.italic ? "italic" : "normal",
                  }}
                  contentEditable={el.id === selectedId}
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    updateSelected({ content: e.currentTarget.textContent })
                  }
                >
                  {el.content}
                </div>
              ) : el.type === "image" ? (
                <div className="image-wrapper">
                  <img
                    src={el.content}
                    alt=""
                    style={{
                      opacity: el.opacity || 1,
                      transform: el.flipped ? "scaleX(-1)" : "none",
                    }}
                  />
                </div>
              ) : el.type === "shape" ? (
                el.shapeType === "circle" ? (
                  <div className="shape-circle" style={{ background: el.color }} />
                ) : (
                  <div className="shape-rect" style={{ background: el.color }} />
                )
              ) : null}
            </Rnd>
          ))}
        </div>
      </div>

      {/* Hidden Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={addImage}
      />
      <canvas
        ref={canvasRef}
        width={1024}
        height={1024}
        style={{ display: "none" }}
      />
    </div>
  );
}
