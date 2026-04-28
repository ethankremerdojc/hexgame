import { useEffect, useState } from "react";

import { Board } from '@/features/board/Board';
import { ElementActionsMenu } from '@/features/menus/Menu';

import {
  BoardGenerator
} from "@/features/board/boardGenerator.ts";

import {
  getCells,
  setCells, setBackupCells,
  // getPlayerCount,
  setPlayerCount,
  setPlayerTurn,
  setViewOnly, getViewOnly,
  setGameId,
  setUsernames,
  getCurrentPlayerName,
  getLoggedInUsername,
  setLoggedInUsername,
  setUserSubscribed,
  setTurnNumber
} from "@/features/board/boardSlice"

// import {
// nameForTeamColor
// } from "@/features/board/vars"

import {
  getUsernamesFromGameObj
} from "@/features/board/utils"

import {
  getBackendContext
} from '@/app/api'

import { useAppDispatch, useAppSelector } from '@/app/hooks'

import './App.css'

declare global {
  interface Window {
    __IFRAME_CONTEXT__?: {
      playerCount: number | null;
    };
    __editor_mode__: boolean | null;
    __editing_live_game: boolean | null;
    __svgImgData?: any;
    __cachedSvgs?: any;
    __cellPatterns?: any;
  }
}

export const TESTING = window.location.host.includes(":5173");

export const USE_FAKE_IFRAME_CONTEXT = TESTING && false;
export const USE_TESTING_EDITOR_MODE = true;


if (USE_FAKE_IFRAME_CONTEXT) {
  window.__IFRAME_CONTEXT__ = {
    playerCount: 3
  }
  window.__editor_mode__ = true;
}

if (USE_TESTING_EDITOR_MODE) {
  window.__editing_live_game = true;
  window.__editor_mode__ = true;
}

let TEST_GAME_ID = 21;

export function getGameId(): number {
  let params = new URLSearchParams(document.location.search);
  let gameId = params.get("game_id");
  return gameId ? Number(gameId) : TEST_GAME_ID
}

function getIsEditorModeFromURL(): boolean {
  let params = new URLSearchParams(document.location.search);
  let editorMode: any = params.get("editorMode");
  return editorMode ? true : false
}

function App() {

  const dispatch = useAppDispatch();
  const cells = useAppSelector(getCells);
  const viewOnly = useAppSelector(getViewOnly);
  const loggedInUsername = useAppSelector(getLoggedInUsername);
  const currentPlayerName = useAppSelector(getCurrentPlayerName);

  let [contextCollectionStatus, setContextCollectionStatus] = useState("notstarted");
  let [backendContext, setBackendContext] = useState<any>(null);

  function applyBackendContext(context: any) {
    let game = backendContext.game;

    dispatch(setLoggedInUsername(context.logged_in_user));

    dispatch(setCells(game.board_state));
    dispatch(setBackupCells(game.board_state));
    dispatch(setPlayerCount(game.players.length));
    dispatch(setPlayerTurn(game.current_player_turn));
    dispatch(setGameId(game.id));
    dispatch(setTurnNumber(game.turn_number));
    dispatch(setUserSubscribed(backendContext.subscribed));
    dispatch(setUsernames(getUsernamesFromGameObj(game)));
  }

  useEffect(() => {
    if (contextCollectionStatus != "notstarted") { return }
    setContextCollectionStatus("collecting");

    let iframeContext = window.__IFRAME_CONTEXT__;
    if (iframeContext) { return }

    getBackendContext(getGameId()).then(json => {
      setContextCollectionStatus("success");
      setBackendContext(json);
    }).catch(err => {
      setContextCollectionStatus("error");
      console.error(err);
    })
  }, [contextCollectionStatus]);

  useEffect(() => {

    if (loggedInUsername === "admin" && getIsEditorModeFromURL()) {
      window.__editor_mode__ = true;
      window.__editing_live_game = true;
    }

    if (backendContext != null) {
      applyBackendContext(backendContext);

    } else {
      let iframeContext = window.__IFRAME_CONTEXT__;
      if (!iframeContext) { return }

      window.__editor_mode__ = true;
      let newPlayerCount = iframeContext.playerCount ? iframeContext.playerCount : 0;
      dispatch(setPlayerCount(newPlayerCount))

      let canvasSize = 800;
      let hexRadius = 40;

      const BG = new BoardGenerator();
      const newBoard = BG.generateBoard(hexRadius, canvasSize, canvasSize, newPlayerCount);
      dispatch(setCells(newBoard));

      if (!window.__editor_mode__) {
        window.__editor_mode__ = true;
        dispatch(setViewOnly(false));
      } else {
        dispatch(setViewOnly(false));
      };
      dispatch(setBackupCells(newBoard));
    }
  }, [backendContext, loggedInUsername]);

  useEffect(() => {
    if (contextCollectionStatus !== "success") return;
    const INTERVAL_TIME = 5000;

    const intervalId = setInterval(async () => {

      try {
        if (currentPlayerName == loggedInUsername || TESTING) { return }

        const json = await getBackendContext(getGameId());
        setBackendContext(json);
        applyBackendContext(json);
      } catch (err) {
        console.error("Polling failed", err);
      }
    }, INTERVAL_TIME);

    return () => clearInterval(intervalId);
  }, [contextCollectionStatus, backendContext, currentPlayerName, loggedInUsername]);

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

  // console.log(window.innerWidth, window.screen.width);

  return (
    <div className="app">
      <Board 
        canvasWidth={Math.min(document.documentElement.clientWidth, 900)} 
        canvasHeight={document.documentElement.clientHeight} 
      />
      { !viewOnly && <ElementActionsMenu /> }
    </div>
  )
}

export default App
