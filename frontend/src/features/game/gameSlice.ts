import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import { createSlice } from "@reduxjs/toolkit"

import type {
  Cell, 
}  from "@/features/game/gameTypes"

import {
  postUpdateToBackend 
} from "@/app/api"

import {
  TeamColors
} from "@/features/game/gameTypes"


import {
  prepareCellsForStateSave,
  depleteFoodForPersonsOnTeam,
  makePersonsWithActionOnTeamWork,
  checkForWinner,
  setupNewTurn,
} from "@/features/game/gameUtils"

export interface GameState {
  cells: Cell[],
  backupCells: Cell[],
  playerCount: number,
  playerTurn: number,
  gameId: number,
  usernames: string[],
  loggedInUsername: string,
  roundNumber: number,
  gameOver: boolean
}

const initialState: GameState = {
  cells: [],
  backupCells: [],
  playerCount: 0,
  playerTurn: TeamColors.White,
  gameId: -1,
  usernames: [],
  loggedInUsername: "",
  roundNumber: 0,
  gameOver: false
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setCells(state, action: PayloadAction<Cell[]>) {
      let cells = action.payload;
      let newCells = prepareCellsForStateSave(cells);
      state.cells = newCells;
    },
    setBackupCells(state, action: PayloadAction<Cell[]>) {
      state.backupCells = action.payload;
    },
    setPlayerCount(state, action: PayloadAction<number>) {
      state.playerCount = action.payload;
    },
    setPlayerTurn(state, action: PayloadAction<number>) {
      state.playerTurn = action.payload;
    },
    setGameId(state, action: PayloadAction<number>) {
      state.gameId = action.payload;
    },
    setUsernames(state, action: PayloadAction<string[]>) {
      state.usernames = action.payload;
    },
    setLoggedInUsername(state, action: PayloadAction<string>) {
      state.loggedInUsername = action.payload;
    },
    setRoundNumber(state, action: PayloadAction<number>) {
      state.roundNumber = action.payload;
    },
    setGameOver(state, action: PayloadAction<boolean>) {
      state.gameOver = action.payload;
    },
    endTurn(state) {
      let currentPlayerTurn = state.playerTurn;
      if (currentPlayerTurn == state.playerCount - 1) {
        state.playerTurn = 0;
      } else {
        state.playerTurn += 1;
      }

      //TODO Figure out how to do this
      // state.selectedCell = null;
      // state.selectedElement = null;
      // state.showMoveInfo = false;

      let cells = depleteFoodForPersonsOnTeam(currentPlayerTurn, state.cells);
      cells = makePersonsWithActionOnTeamWork(currentPlayerTurn, state.cells);

      const winnerExists = checkForWinner(cells, currentPlayerTurn);
      if (winnerExists) {
        state.cells = cells;
        state.gameOver = true;
        postUpdateToBackend(
          state.cells,
          state.playerTurn,
          state.gameId,
          false,
          state.loggedInUsername
        );
      } else {
        let newCells = setupNewTurn(cells, state.playerTurn, state.roundNumber);
        state.cells = newCells;
        state.backupCells = newCells;

        if (state.playerTurn == 0) {
          state.roundNumber += 1;
        }

        postUpdateToBackend(state.cells, state.playerTurn, state.gameId);
      }
    },
  }
});

export const getCells = (state: RootState): Cell[] => state.game.cells;
export const getBackupCells = (state: RootState): Cell[] => state.game.backupCells;
export const getPlayerCount = (state: RootState): number => state.game.playerCount;
export const getPlayerTurn = (state: RootState): number => state.game.playerTurn;
export const getGameId = (state: RootState): number => state.game.gameId;
export const getUsernames = (state: RootState): string[] => state.game.usernames;
export const getLoggedInUsername = (state: RootState): string => state.game.loggedInUsername;
export const getCurrentPlayerName = (state: RootState): string => state.game.usernames[state.game.playerTurn];
export const getRoundNumber = (state: RootState): number => state.game.roundNumber;
export const getGameOver = (state: RootState): boolean => state.game.gameOver;

export const { 
  setCells,
  setBackupCells,
  setPlayerCount,
  setPlayerTurn,
  setGameId,
  setUsernames,
  setLoggedInUsername,
  setRoundNumber,
  setGameOver,
  endTurn
} = gameSlice.actions;

export default gameSlice.reducer;
