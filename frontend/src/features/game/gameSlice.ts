import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import { createSlice } from "@reduxjs/toolkit"

import {
  TeamColors
} from "@/features/game/gameTypes"


import {
  prepareCellsForStateSave,
} from "@/features/game/gameUtils"

import BoardUtils from "@/features/board/boardUtils"

export interface GameState {
  cells: Cell[],
  playerCount: number,
  playerTurn: TeamColors,
  gameId: number,
  usernames: string[],
  loggedInUsername: string,
  roundNumber: number,
  gameOver: boolean
}

const initialState: GameState = {
  cells: [],
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
    setPlayerCount(state, action: PayloadAction<number>) {
      state.playerCount = action.payload;
    },
    setPlayerTurn(state, action: PayloadAction<TeamColors>) {
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
    }
  }
});

export const getCells = (state: RootState): Cell[] => state.game.cells;
export const getPlayerCount = (state: RootState): number => state.game.playerCount;
export const getPlayerTurn = (state: RootState): TeamColors => state.game.playerTurn;
export const getGameId = (state: RootState): number => state.game.gameId;
export const getUsernames = (state: RootState): string[] => state.game.usernames;
export const getLoggedInUsername = (state: RootState): string => state.game.loggedInUsername;
export const getCurrentPlayerName = (state: RootState): string => state.game.usernames[state.game.playerTurn];
export const getRoundNumber = (state: RootState): number => state.game.roundNumber;
export const getGameOver = (state: RootState): boolean => state.game.gameOver;

export const { 
  setCells,
  setPlayerCount,
  setPlayerTurn,
  setGameId,
  setUsernames,
  setLoggedInUsername,
  setRoundNumber,
  setGameOver
} = gameSlice.actions;

export default gameSlice.reducer;
