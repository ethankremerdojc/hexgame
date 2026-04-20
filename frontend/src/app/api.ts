import type { Cell } from "@/features/board/boardTypes"
import { TeamColor } from "@/features/board/boardTypes"

import {
  getCSRFToken
} from "@/features/board/utils"

function getAPILocation() {
  if (window.location.host === "localhost:5173") {
    return "http://localhost:8001"
  }
  return "https://" + window.location.host
}

let API_HOST = getAPILocation();

export async function postUpdateToBackend(cells: Cell[], playerTurn: TeamColor, gameId: number) {
  const formData = new URLSearchParams();

  formData.append("game_id", String(gameId));
  formData.append("cells", JSON.stringify(cells));
  formData.append("playerTurn", String(playerTurn));

  const response = await fetch(API_HOST + "/game/update/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-CSRFToken": getCSRFToken(), // required for Django
    },
    body: formData.toString(),
    credentials: "include", // ensures cookies (session + CSRF) are sent
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return await response.json(); // or .text() depending on your view
}

export async function getBackendContext(gameId: number) {
  const response = await fetch(`${API_HOST}/game/get_context/${gameId}/`, {
    method: "GET",
    headers: {
    //   "Content-Type": "application/x-www-form-urlencoded",
    "X-CSRFToken": getCSRFToken(), // required for Django
    },

  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return await response.json(); // or .text() depending on your view 
}
