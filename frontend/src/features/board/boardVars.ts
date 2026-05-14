export function colorForTeam(teamVal: TeamColors|null): string {
  if (teamVal === null) { return "" }

  return [
    "white",
    "purple",
    "red",
    "yellow",
    "blue",
    "green",
    "black",
    "brown"
  ][teamVal]
}
