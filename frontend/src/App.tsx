import { useState } from 'react'

import { Board } from '@/features/board/Board';

import {
  getCells, setCells,
  getSelectedCell, setSelectedCell,
  getBoardZoom, setBoardZoom,
  getBoardOffset, setBoardOffset,
} from "@/features/board/boardSlice"

import { useAppDispatch, useAppSelector } from '@/app/hooks'

import './App.css'

function App() {
  const cells = useAppSelector(getCells);
  const selectedCell = useAppSelector(getSelectedCell);
  const zoom = useAppSelector(getBoardZoom);
  const offset = useAppSelector(getBoardOffset);

  let selectedCellString = "null";
  if (selectedCell) {
    selectedCellString = `\{x: ${selectedCell.x}, y: ${selectedCell.y}, type: ${selectedCell.type}, contents: [ ${selectedCell.contents.length} items `;
    // selectedCell.contents.forEach(element => {
    //   selectedCellString += `\{type: ${element.type}, team: ${element.team}\} `
    // })
    selectedCellString += "]";
  }

  return (
    <>
      <section id="center">
        <div className="debug-stats">
          <p>Cells Count: {cells.length}</p>
          <p>Selected Cell: {selectedCellString}</p>
          <p>Zoom: {zoom}</p>
          <p>Offset: {`\{x: ${offset.x}, y: ${offset.y} \}`}</p>
        </div>
        <Board />
      </section>
    </>
  )
}

export default App
