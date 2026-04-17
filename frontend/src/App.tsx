import { useEffect } from "react";

import { Board } from '@/features/board/Board';
import { ElementActionsMenu } from '@/features/elementActionsMenu/Menu';

import {
  getPlayerCount,
  setPlayerCount
} from "@/features/board/boardSlice"

import { useAppDispatch, useAppSelector } from '@/app/hooks'

import './App.css'

function getPlayerCountFromUrl(): number {
  const params = new URLSearchParams(window.location.search);
  const playerCount = params.get('playerCount');
  if (!playerCount) {
    console.log("no player count provided.")
    return 4
  }
  return Number(playerCount)
}

// function DebugStats({cells, selectedCell, selectedElement, zoom, offset}) {
//   let selectedCellString = "null";
//   if (selectedCell) {
//     selectedCellString = `\{x: ${selectedCell.x}, y: ${selectedCell.y}, type: ${selectedCell.type}, elements: [ ${selectedCell.elements.length} items `;
//     selectedCellString += "]";
//   };
//
//   let selectedElemString = "null";
//   if (selectedElement) {
//     selectedElemString = `\{id: ${selectedElement.id}, type: ${selectedElement.type}, position: ${selectedElement.position}, team: ${selectedElement.team} \}`;
//   }
//   return (
//     <div className="debug-stats">
//       <p>Cells Count: {cells.length}</p>
//       <p>Selected Cell: {selectedCellString}</p>
//       <p>Selected Element: {selectedElemString}</p>
//       <p>Zoom: {zoom}</p>
//       <p>Offset: {`\{x: ${offset.x}, y: ${offset.y} \}`}</p>
//     </div>
//   )
// }

function App() {

  const dispatch = useAppDispatch();
  const playerCount = useAppSelector(getPlayerCount);

  useEffect(() => {
    if (playerCount === 0) {
      let urlPlayerCount = getPlayerCountFromUrl();
      console.log(urlPlayerCount);
      dispatch(setPlayerCount(urlPlayerCount));
    }
  }, [dispatch, playerCount]);

  return (
    <>
      <section id="center">
        <Board />
        <ElementActionsMenu />
      </section>
    </>
  )
}

export default App
