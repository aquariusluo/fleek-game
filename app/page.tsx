"use client";

import React, { useState, useEffect } from "react";

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

// Define types for better type safety
type TetrominoKey = '0' | 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

// Tetromino shapes
const TETROMINOS: { [key in TetrominoKey]: number[][] } = {
  '0': [[0]],
  I: [[1, 1, 1, 1]],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
  ],
};

const randomTetromino = (): number[][] => {
  const tetrominos: TetrominoKey[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  const rand = tetrominos[Math.floor(Math.random() * tetrominos.length)];
  return TETROMINOS[rand];
};

const createGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const Tetris = () => {
  const [grid, setGrid] = useState(createGrid());
  const [position, setPosition] = useState({ x: Math.floor(COLS / 2) - 1, y: 0 });
  const [tetromino, setTetromino] = useState(randomTetromino());
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const merge = (grid: number[][], tetromino: number[][], position: { x: number; y: number }) => {
    const newGrid = grid.map((row) => [...row]);
    tetromino.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (cell && position.y + r < ROWS && position.x + c < COLS) {
          newGrid[position.y + r][position.x + c] = cell;
        }
      })
    );
    return newGrid;
  };

  const isColliding = (grid: number[][], tetromino: number[][], pos: { x: number; y: number }) => {
    for (let r = 0; r < tetromino.length; r++) {
      for (let c = 0; c < tetromino[r].length; c++) {
        if (tetromino[r][c]) {
          const newY = pos.y + r;
          const newX = pos.x + c;

          if (
            newY >= ROWS || // Out of vertical bounds
            newX < 0 || // Out of left bounds
            newX >= COLS || // Out of right bounds
            (newY >= 0 && grid[newY]?.[newX]) // Collision with existing blocks
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const clearRows = (grid: number[][]) => {
    const newGrid = grid.filter((row) => row.some((cell) => cell === 0));
    const clearedRows = ROWS - newGrid.length;
    while (newGrid.length < ROWS) {
      newGrid.unshift(Array(COLS).fill(0));
    }
    return { newGrid, clearedRows };
  };

  const moveTetromino = (dir: number) => {
    if (isPaused || gameOver) return;

    const newPos = { x: position.x + dir, y: position.y };
    if (!isColliding(grid, tetromino, newPos)) setPosition(newPos);
  };

  const dropTetromino = () => {
    if (isPaused || gameOver) return;

    const newPos = { x: position.x, y: position.y + 1 };
    if (!isColliding(grid, tetromino, newPos)) {
      setPosition(newPos);
    } else {
      if (position.y === 0) {
        setGameOver(true);
      } else {
        const mergedGrid = merge(grid, tetromino, position);
        const { newGrid } = clearRows(mergedGrid);
        setGrid(newGrid);
        setTetromino(randomTetromino());
        setPosition({ x: Math.floor(COLS / 2) - 1, y: 0 });
      }
    }
  };

  const rotateTetromino = () => {
    if (isPaused || gameOver) return;

    const rotated = tetromino[0].map((_, idx) =>
      tetromino.map((row) => row[idx]).reverse()
    );

    if (!isColliding(grid, rotated, position)) setTetromino(rotated);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (isPaused || gameOver) return;

    if (e.key === "ArrowLeft") moveTetromino(-1);
    if (e.key === "ArrowRight") moveTetromino(1);
    if (e.key === "ArrowDown") dropTetromino();
    if (e.key === "ArrowUp") rotateTetromino();
  };

  const handlePauseResume = () => setIsPaused((prev) => !prev);

  const handleRestart = () => {
    setGrid(createGrid());
    setTetromino(randomTetromino());
    setPosition({ x: Math.floor(COLS / 2) - 1, y: 0 });
    setGameOver(false);
    setIsPaused(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused && !gameOver) dropTetromino();
    }, 500);

    return () => clearInterval(interval);
  }, [isPaused, gameOver, grid, tetromino, position]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>{gameOver ? "Game Over" : "Tetris"}</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, ${BLOCK_SIZE}px)`,
          gap: "1px",
          border: "1px solid black",
          backgroundColor: "#ddd",
          margin: "0 auto",
          width: `${COLS * BLOCK_SIZE}px`,
        }}
      >
        {merge(grid, tetromino, position).flat().map((cell, idx) => (
          <div
            key={idx}
            style={{
              width: BLOCK_SIZE,
              height: BLOCK_SIZE,
              backgroundColor: cell === 0 ? "#fff" : "#000",
            }}
          />
        ))}
      </div>

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <button onClick={handlePauseResume}>
          {isPaused ? "Resume" : "Pause"}
        </button>
        <button onClick={handleRestart}>Restart</button>
      </div>

      <div
        style={{
          marginTop: "30px",
          padding: "10px",
          backgroundColor: "#000",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <strong>Controls:</strong>
        <div>Arrow Left: Move Left | Arrow Right: Move Right</div>
        <div>Arrow Down: Soft Drop | Arrow Up: Rotate</div>
      </div>
    </div>
  );
};

export default Tetris;
