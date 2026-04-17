import { useEffect } from "react";

import { Board } from '@/features/board/Board';
import { ElementActionsMenu } from '@/features/elementActionsMenu/Menu';

import {
  BoardGenerator
} from "@/features/board/boardGenerator.ts";

import {
  getCells,
  setCells, setBackupCells,
  getPlayerCount,
  setPlayerCount,
  setPlayerTurn,
  setViewOnly, getViewOnly,
  setGameId
} from "@/features/board/boardSlice"

import {
nameForTeamColor
} from "@/features/board/vars"

import { useAppDispatch, useAppSelector } from '@/app/hooks'

import './App.css'

declare global {
  interface Window {
    __REACT_CONTEXT__?: {
      game: any | null;
      playerCount: number | null;
      viewOnly: boolean;
    };
  }
}

const BACKEND_CONTEXT = window.__REACT_CONTEXT__;

function App() {

  const dispatch = useAppDispatch();
  const playerCount = useAppSelector(getPlayerCount);
  const cells = useAppSelector(getCells);
  const viewOnly = useAppSelector(getViewOnly);

  let canvasSize = 800;
  let hexRadius = 40;

  useEffect(() => {
    if (cells.length === 0 || playerCount == 0) {
      let newPlayerCount = 4;

      console.log("BACKEND CONTEXT", BACKEND_CONTEXT)

      if (BACKEND_CONTEXT !== undefined) {

        if (BACKEND_CONTEXT.viewOnly) {
          dispatch(setViewOnly(true));
        }

        if (BACKEND_CONTEXT.game) {
          console.log(nameForTeamColor(BACKEND_CONTEXT.game.current_player_turn))

          dispatch(setCells(BACKEND_CONTEXT.game.board_state));
          dispatch(setBackupCells(BACKEND_CONTEXT.game.board_state));
          dispatch(setPlayerCount(BACKEND_CONTEXT.game.players.length));
          dispatch(setPlayerTurn(BACKEND_CONTEXT.game.current_player_turn));
          dispatch(setGameId(BACKEND_CONTEXT.game.id));
          return
        } else if (BACKEND_CONTEXT.playerCount) {
          newPlayerCount = BACKEND_CONTEXT.playerCount;
        }
      }

      console.log(BACKEND_CONTEXT)
      dispatch(setPlayerCount(newPlayerCount))

      const BG = new BoardGenerator();
      const newBoard = BG.generateBoard(
        hexRadius, canvasSize, canvasSize, newPlayerCount
      );

      dispatch(setCells(newBoard));
      dispatch(setBackupCells(newBoard));
    }
  }, [cells, dispatch, playerCount]);

  console.log("View only: ", viewOnly);


  useEffect(() => {
    function onMessage(event: any) {
      const msg = event.data;
      if (msg?.type === "APP_DATA_REQUEST") {
        const data = {
          cells: JSON.stringify(cells)
        };

        event.source.postMessage(
          {
            type: "APP_DATA_RESPONSE",
            requestId: msg.requestId,
            payload: data,
          },
          event.origin
        );
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [dispatch, cells]);

  console.log(window.innerWidth, window.screen.width);

  return (
    <>
      <section id="center">
        <Board 
          canvasWidth={Math.min(document.documentElement.clientWidth-50, 900)} 
          canvasHeight={document.documentElement.clientHeight-300} 
        />
        { !viewOnly && <ElementActionsMenu /> }
      </section>
    </>
  )
}

export default App
