import {
  Grid,
  Card,
  CardContent,
  Typography,
  Container,
  Chip,
  Box,
} from "@mui/material";
import { useEffect, useState } from "react";
import useAuth from "../../../hooks/useAuth";
import AchievementsTable from "./Achievements";
import MatchList from "./MatchList";
import StatsTable from "./StatsTable";

type Stats = {
  victories?:  number,
  defeat?:    number,
	xp?:				number,
  rank?:      number,
  nbOfPlayers?: number
};

type Achievements = {
  totalNbOfGamesPlayed?:  number | null,
  longestWinningStreak?:  number | null,
  maxNbOfGamesInOneDay?:  number | null,
};

export default function MiddleSection({ requestedUser }) {
  const { socket } = useAuth();
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState<Stats>({});
  const [achievements, setAchievements] = useState<Achievements>({});

  useEffect(() => {
    try {
      socket.emit("getUserMatches", requestedUser);
      socket.emit("getUserStats", requestedUser);
      socket.emit("getUserAchievements", requestedUser);
    } catch (err) {
      console.error("Error response:");
      console.error(err);
    } 
    
  }, [requestedUser]);

	useEffect(() => {
    socket.on("userMatches", (response) => {
      setMatches(response);
    });
    socket.on("userAchievements", (response) => {
      setAchievements(response);
    });
    socket.on("userStats", (response) => {
      setStats(prevState => ({
        ...prevState,
        rank:   response.rank,
        xp:     response.xp,
        level:  Math.floor(response.xp / 1000),
        nbOfPlayers: response.nbOfPlayers
      }))
    });

		try {
      socket.emit("getUserMatches", requestedUser);
      socket.emit("getUserStats", requestedUser);
      socket.emit("getUserAchievements", requestedUser);
    } catch (err) {
      console.error("Error response:");
      console.error(err);
    } 

    return () => {
      socket.off("userMatches");
      socket.off("userStats");
      socket.off("userAchievements");
    }
  }, []);

  useEffect(() => {
    const nbVictories = matches.filter(match => match.winner.id == requestedUser.id ).length;
    setStats(prevState => ({
      ...prevState,
      victories:  nbVictories,                
      defeat :    matches.length - nbVictories
    }))
  }, [matches]);

  return (
    <>
      <Container maxWidth="md">
        <Grid container spacing={3}>
          {/* Stats && Achievments */}
          <Grid item xs={12} sm={12} md={6}>
            <Card>
              <CardContent>
                <StatsTable stats={stats} displayTitle={true}/>
                <AchievementsTable achievements={achievements} />
              </CardContent>
            </Card>
          </Grid>
          {/* Match History */}
          <Grid item xs={12} sm={12} md={6}>
            <Card>
              <CardContent>
                <MatchList matchList={matches}/>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
