const CELL_SIZE = 50;
function draw(state) {
  const canvas = document.getElementById("my-canvas");
  const context = canvas.getContext("2d");
  context.strokeStyle = "black";
  context.lineWidth = 1;

  const image = state.internal.image();
  const width = image.width();
  const height = image.height();

  const cells = image.cells();
  const cellSize = CELL_SIZE;

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const index = (y * width + x) * 3;
      const color = `rgb(${cells[index + 0]}, ${cells[index + 1]}, ${
        cells[index + 2]
      })`;
      context.fillStyle = color;
      context.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }

  for (let x = 0; x <= width; x++) {
    context.beginPath();
    context.moveTo(x * cellSize + 0.5, 0);
    context.lineTo(x * cellSize + 0.5, height * cellSize);
    context.stroke();
  }

  for (let y = 0; y <= height; y++) {
    context.beginPath();
    context.moveTo(0, y * cellSize + 0.5);
    context.lineTo(width * cellSize, y * cellSize + 0.5);
    context.stroke();
  }
}

function setupCanvas(state) {
  state.penType = "BRUSH";
  const canvas = document.getElementById("my-canvas");

  canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    console.log(event);
    const cellSize = CELL_SIZE;
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    x = Math.floor(x / cellSize);
    y = Math.floor(y / cellSize);

    if (state.penType === "BRUSH") {
      state.internal.brush(x, y, state.currentColor, parseInt(state.size));
    } else if (state.penType === "ERASER") {
      state.internal.eraser(x, y);
    } else if(state.penType === "SYMBOLS") {
      state.internal.draw_symbol(x, y, state.currentColor, parseInt(state.symbol));
    }

    draw(state);
  });

  canvas.addEventListener("mousedown", (event) => {
    state.dragging = true;
    state.internal.start_undo_block();
  });

  canvas.addEventListener("mouseup", (event) => {
    state.dragging = false;
    state.internal.close_undo_block();
  });

  canvas.addEventListener("mousemove", (event) => {
    if (!state.dragging) return;

    const rect = canvas.getBoundingClientRect();
    const cellSize = CELL_SIZE;
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    x = Math.floor(x / cellSize);
    y = Math.floor(y / cellSize);

    if (state.penType === "BRUSH") {
      state.internal.brush(x, y, state.currentColor, parseInt(state.size));
    } else if (state.penType === "ERASER") {
      state.internal.eraser(x, y);
    } else if(state.penType === "SYMBOLS") {
      state.internal.draw_symbol(x, y, state.currentColor, parseInt(state.symbol));
    }

    draw(state);
  });
  document.getElementById("size").addEventListener("change", (event) => {
    state.size = event.target.value;
  });
  document.getElementById("symbols-select").addEventListener("change", (event) => {
    state.symbol = event.target.value;
  });
  document.getElementById("red").addEventListener("click", (event) => {
    state.currentColor = [255, 0, 0];
  });
  document.getElementById("green").addEventListener("click", (event) => {
    state.currentColor = [102, 187, 87];
  });
  document.getElementById("blue").addEventListener("click", (event) => {
    state.currentColor = [0, 0, 255];
  });
  document.getElementById("orange").addEventListener("click", (event) => {
    state.currentColor = [255, 153, 0];
  });
  document.getElementById("black").addEventListener("click", (event) => {
    state.currentColor = [0, 0, 0];
  });
  document.getElementById("white").addEventListener("click", (event) => {
    state.currentColor = [255, 255, 255];
  });

  document.getElementById("undo").addEventListener("click", (event) => {
    state.internal.undo();
    draw(state);
  });

  document.getElementById("redo").addEventListener("click", (event) => {
    state.internal.redo();
    draw(state);
  });

  document.getElementById("eraser").addEventListener("click", (event) => {
    state.penType = "ERASER";
  });
  document.getElementById("symbols").addEventListener("click", (event) => {
    state.penType = "SYMBOLS";
  });
  document.getElementById("brush").addEventListener("click", (event) => {
    state.penType = "BRUSH";
  });
  document.getElementById("save-as-image").addEventListener("click", (el) => {
    const canvas = document.getElementById("my-canvas");
    var image = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream"); // here is the most important part because if you dont replace you will get a DOM 18 exception
    window.location.href = image;
  });
}

async function main() {
  const lib = await import("../pkg/index.js").catch(console.error);
  const internal = new lib.InternalState(100, 100);
  // const PEN_TYPES = ['BRUSH', 'ERASER'];
  const state = {
    internal,
    currentColor: [200, 255, 200],
    dragging: false,
    penType: "BRUSH",
    size: 1,
    symbol: 65
  };
  setupCanvas(state);
  draw(state);
}

main();

// Eraser - box overlay
// Line Width - cursors
// Position Indication
// Color Indication
// Open Image
// Pen indicator
// use screen space efficiently
// Save as Image - meaningful name
// save as paint file
// Text / Numbers / Symbols
// More Smooth
// Color Picker
