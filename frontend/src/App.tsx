import { Board } from '@/features/board/Board';
import { ElementActionsMenu } from '@/features/elementActionsMenu/Menu';

import {
  getCells,
  getSelectedCell,
  getSelectedElement,
  getBoardZoom,
  getBoardOffset,

} from "@/features/board/boardSlice"

import { useAppDispatch, useAppSelector } from '@/app/hooks'

import './App.css'

function DebugStats({cells, selectedCell, selectedElement, zoom, offset}) {
  let selectedCellString = "null";
  if (selectedCell) {
    selectedCellString = `\{x: ${selectedCell.x}, y: ${selectedCell.y}, type: ${selectedCell.type}, elements: [ ${selectedCell.elements.length} items `;
    selectedCellString += "]";
  };

  let selectedElemString = "null";
  if (selectedElement) {
    selectedElemString = `\{id: ${selectedElement.id}, type: ${selectedElement.type}, position: ${selectedElement.position}, team: ${selectedElement.team} \}`;
  }
  return (
    <div className="debug-stats">
      <p>Cells Count: {cells.length}</p>
      <p>Selected Cell: {selectedCellString}</p>
      <p>Selected Element: {selectedElemString}</p>
      <p>Zoom: {zoom}</p>
      <p>Offset: {`\{x: ${offset.x}, y: ${offset.y} \}`}</p>
    </div>
  )
}

function App() {
  const cells = useAppSelector(getCells);
  const selectedCell = useAppSelector(getSelectedCell);
  const selectedElement = useAppSelector(getSelectedElement);
  const zoom = useAppSelector(getBoardZoom);
  const offset = useAppSelector(getBoardOffset);

  return (
    <>
      <section id="center">
        <DebugStats 
          cells={cells}
          selectedCell={selectedCell}
          selectedElement={selectedElement}
          zoom={zoom}
          offset={offset}
        />


        <Board />
        <ElementActionsMenu />
      </section>
    </>
  )
}

export default App
