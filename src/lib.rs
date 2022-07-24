use std::iter::FromIterator;

use im::Vector;
use wasm_bindgen::prelude::*;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[derive(Clone, Copy, PartialEq)]
struct Rgb {
    r: u8,
    g: u8,
    b: u8,
}
#[wasm_bindgen]
#[derive(Clone)]
pub struct Image {
    width: usize,
    height: usize,
    cells: Vector<Rgb>,
}

#[wasm_bindgen]
impl Image {
    #[wasm_bindgen(constructor)]
    pub fn new(width: usize, height: usize) -> Image {
        let cells = Vector::from_iter((0..width * height).map(|_| Rgb {
            r: 255,
            g: 255,
            b: 255,
        }));
        Image {
            width,
            height,
            cells,
        }
    }

    pub fn cells(&self) -> Vec<u8> {
        self.cells
            .iter()
            .map(|&rgb| vec![rgb.r, rgb.g, rgb.b])
            .collect::<Vec<Vec<u8>>>()
            .concat()
    }

    pub fn width(&self) -> usize {
        self.width
    }

    pub fn height(&self) -> usize {
        self.height
    }

    pub fn brush(&mut self, x: usize, y: usize, color: Vec<u8>) -> Option<Image> {
        let index = (y * self.width) + x;
        let color = Rgb {
            r: color[0],
            g: color[1],
            b: color[2],
        };
        if self.cells[index] == color {
            None
        } else {
            let new_cells = self.cells.update(index, color);
            Some(Image {
                width: self.width,
                height: self.height,
                cells: new_cells,
            })

            // vec![u8] = {};
        }
    }

    pub fn eraser(&mut self, x: usize, y: usize) -> Option<Image> {
        let cells_to_erase = [
            (x, y),
            (x + 1, y + 1),
            (x - 1, y - 1),
            (x - 1, y + 1),
            (x + 1, y - 1),
            (x + 1, y),
            (x, y + 1),
            (x - 1, y),
            (x, y + 1),
            (x, y - 1),
        ];

        let size = cells_to_erase.len();
        let mut new_image = self.cells.clone();
        let color = Rgb { r: 255, g: 255, b: 255 };

        for i in 0..(size) {
            if cells_to_erase[i].0 >= 0 as usize
                && cells_to_erase[i].1 >= 0 as usize
                && cells_to_erase[i].0 <= self.width - 1
                && cells_to_erase[i].1 <= self.height - 1
            {
                let index = (cells_to_erase[i].1 * self.width) + cells_to_erase[i].0;
                new_image[index] = color;
            }
        }

        Some(Image {
            width: self.width,
            height: self.height,
            cells: new_image,
        })
    }
}

enum Mode {
    Normal,
    StartBlock,
    InBlock,
}
struct UndoQueue<T: Clone> {
    queue: Vec<T>,
    index: usize,
    mode: Mode,
}

impl<T: Clone> UndoQueue<T> {
    pub fn new(entry: T) -> UndoQueue<T> {
        UndoQueue {
            queue: vec![entry],
            index: 0,
            mode: Mode::Normal,
        }
    }

    pub fn current(&self) -> T {
        self.queue[self.index].clone()
    }
    pub fn start_undo_block(&mut self) {
        self.mode = Mode::StartBlock;
    }

    pub fn close_undo_block(&mut self) {
        self.mode = Mode::Normal;
    }

    pub fn push(&mut self, entry: T) {
        match self.mode {
            Mode::Normal => {
                self.queue.truncate(self.index + 1);
                self.queue.push(entry);
                self.index += 1;
            }
            Mode::StartBlock => {
                self.queue.truncate(self.index + 1);
                self.queue.push(entry);
                self.index += 1;
                self.mode = Mode::InBlock;
            }
            Mode::InBlock => {
                self.queue[self.index] = entry;
            }
        }
    }

    pub fn undo(&mut self) {
        if self.index >= 1 {
            self.index -= 1;
        }
    }

    pub fn redo(&mut self) {
        if self.index < (self.queue.len() - 1) {
            self.index += 1;
        }
    }
}

#[wasm_bindgen]
pub struct InternalState {
    undo_queue: UndoQueue<Image>,
}

#[wasm_bindgen]
impl InternalState {
    #[wasm_bindgen(constructor)]
    pub fn new(width: usize, height: usize) -> InternalState {
        InternalState {
            undo_queue: UndoQueue::new(Image::new(width, height)),
        }
    }

    pub fn start_undo_block(&mut self) {
        self.undo_queue.start_undo_block();
    }
    pub fn close_undo_block(&mut self) {
        self.undo_queue.close_undo_block();
    }

    pub fn image(&self) -> Image {
        self.undo_queue.current()
    }

    pub fn undo(&mut self) {
        self.undo_queue.undo();
    }

    pub fn redo(&mut self) {
        self.undo_queue.redo();
    }

    pub fn brush(&mut self, x: usize, y: usize, color: Vec<u8>) {
        let mut image = self.undo_queue.current();
        let optional_image = image.brush(x, y, color);
        match optional_image {
            None => (),
            Some(new_image) => {
                self.undo_queue.push(new_image);
            }
        }
    }

    pub fn eraser(&mut self, x: usize, y: usize) {
        let mut image = self.undo_queue.current();
        let optional_image = image.eraser(x, y);
        match optional_image {
            None => (),
            Some(new_image) => {
                self.undo_queue.push(new_image);
            }
        }
    }
}
