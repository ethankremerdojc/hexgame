import { useState } from 'react'

import { Board } from '@/features/board/Board';

import {
  getCells,
  getSelectedCell,
  getSelectedElement,
  getBoardZoom,
  getBoardOffset,

} from "@/features/board/boardSlice"

import { useAppDispatch, useAppSelector } from '@/app/hooks'

import './App.css'

function App() {
  const cells = useAppSelector(getCells);
  const selectedCell = useAppSelector(getSelectedCell);
  const selectedElement = useAppSelector(getSelectedElement);
  const zoom = useAppSelector(getBoardZoom);
  const offset = useAppSelector(getBoardOffset);

  let selectedCellString = "null";
  if (selectedCell) {
    selectedCellString = `\{x: ${selectedCell.x}, y: ${selectedCell.y}, type: ${selectedCell.type}, contents: [ ${selectedCell.contents.length} items `;
    selectedCellString += "]";
  };
 
  let selectedElemString = "null";
  if (selectedElement) {
    selectedElemString = `\{id: ${selectedElement.id}, type: ${selectedElement.type}, position: ${selectedElement.position}, team: ${selectedElement.team} \}`;
  }

  return (
    <>
      <section id="center">
        <div className="debug-stats">
          <p>Cells Count: {cells.length}</p>
          <p>Selected Cell: {selectedCellString}</p>
          <p>Selected Element: {selectedElemString}</p>
          <p>Zoom: {zoom}</p>
          <p>Offset: {`\{x: ${offset.x}, y: ${offset.y} \}`}</p>
        </div>
        <Board />
      </section>
    </>
  )
}

export default App
