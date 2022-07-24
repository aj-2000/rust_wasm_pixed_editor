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

context.rect(
  2 * mouseCoords.x - currentMouse.x,
  2 * mouseCoords.y - currentMouse.y,
  2 * (currentMouse.x - mouseCoords.x),
  2 * (currentMouse.y - mouseCoords.y)
);

function setupCanvas(state) {
  state.internal.penType = 'BRUSH';
  const canvas = document.getElementById("my-canvas");

  canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    console.log(event);
    const cellSize = CELL_SIZE;
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    x = Math.floor(x / cellSize);
    y = Math.floor(y / cellSize);

    if(state.internal.penType === 'BRUSH'){
      state.internal.brush(x, y, state.currentColor);
    } else if(state.internal.penType === 'ERASER'){
      state.internal.eraser(x, y);
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
    if(!state.dragging) return;

    const rect = canvas.getBoundingClientRect();
    const cellSize = CELL_SIZE;
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    x = Math.floor(x / cellSize);
    y = Math.floor(y / cellSize);

    if(state.internal.penType === 'BRUSH'){
      state.internal.brush(x, y, state.currentColor);
    } else if(state.internal.penType === 'ERASER'){
      state.internal.eraser(x, y);
    }

    draw(state);
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
    state.internal.penType = 'ERASER';
  });

  document.getElementById("brush").addEventListener("click", (event) => {
    state.internal.penType = 'BRUSH';
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
    penType: 'BRUSH'

  };
  setupCanvas(state);
  draw(state);
}

main();

// Eraser
// Line Width
// Position Indication
// Color Indication
// Open Image
// Pen indicator
// use screen space efficiently
// Save as Image
// save as paint file
// Text / Numbers / Symbols
// More Smooth
// Color Picker