import type { Cell } from "@/features/board/boardTypes"
import { TeamColor } from "@/features/board/boardTypes"

import {
  getCSRFToken
} from "@/features/board/utils"

export async function postUpdateToBackend(
  cells: Cell[],
  playerTurn: TeamColor,
  gameId: number,
  wasAdminUpdate: boolean=false,
  playerThatJustWon: string=""
) {
  const formData = new URLSearchParams();

  formData.append("game_id", String(gameId));
  formData.append("cells", JSON.stringify(cells));
  formData.append("playerTurn", String(playerTurn));
  formData.append("playerThatJustWon", playerThatJustWon);

  // console.log("player that just won", playerThatJustWon);
  // return

  if (wasAdminUpdate) {
    formData.append("admin_update", "yes");
  }

  const response = await fetch("/api/update_game/", {
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
  const response = await fetch(`/api/get_game_context/${gameId}/`, {
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

export function notificationSubscribe(subscription, username) {
  return fetch("/api/notification_subscribe/", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "X-CSRFToken": getCSRFToken()
    },

    credentials: "include",
    body: JSON.stringify({"subscription": subscription, "username": username}),
  });
}
