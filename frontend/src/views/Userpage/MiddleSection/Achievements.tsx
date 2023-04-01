import { Typography, Chip } from "@mui/material";

export default function AchievementsTable({ achievements }) {
	const {totalNbOfGamesPlayed, longestWinningStreak, maxNbOfGamesInOneDay} = achievements;
  return (
    <>
      <Typography mt={3} variant="h3">
        Achievements
      </Typography>
      <Typography variant="caption">Past year</Typography>
      <div
        style={{
          height: 74,
          width: "100%",
          display: "flex",
          flexWrap: "wrap",
          alignContent: "flex-start",
          gap: 10,
          paddingTop: 12,
          marginBottom: 10,
        }}
      >
				{maxNbOfGamesInOneDay ?
        <Chip
          label={`Played ${maxNbOfGamesInOneDay} ${maxNbOfGamesInOneDay == 1 ? "game" : "games"} in one day`}
          variant="outlined"
          color="primary"
        /> : null}
				{longestWinningStreak ?
        <Chip
          label={`Won ${longestWinningStreak} ${longestWinningStreak == 1 ? "game" : "games"} in a row`}
          variant="outlined"
          color="primary"
        /> : null}
				{totalNbOfGamesPlayed ?
        <Chip
          label={`Played ${totalNbOfGamesPlayed} ${longestWinningStreak == 1 ? "game" : "games"}`}
          variant="outlined"
          color="primary"
        /> : null}
      </div>
    </>
  );
}
