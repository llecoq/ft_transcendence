// ============================================
import { Typography } from "@mui/material";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { useParams } from "react-router";
import { ListChildComponentProps, FixedSizeList } from "react-window";
import useAuth from "../../../hooks/useAuth";

export function formatUsername(username: String) {
  const capitalizedUsername =
    username.charAt(0).toUpperCase() + username.slice(1);
  return (
    <b>
      <span style={{ color: "#5569ff" }}>{capitalizedUsername}</span>
    </b>
  );
}

const MatchText = ({ match }) => {
  const pageId = parseInt(useParams().userId);
  const wonOrLostEmoji = pageId == match.winner.id ? "🏆" : "💣";

  let me, myScore, opponent, opponentScore;
  if (match.userHome.id == pageId) {
    me = match.userHome;
    myScore = match.userHomeScore;
    opponent = match.userForeign;
    opponentScore = match.userForeignScore;
  } else {
    me = match.userForeign;
    myScore = match.userForeignScore;
    opponent = match.userHome;
    opponentScore = match.userHomeScore;
  }

  return (
    <ListItemText>
      {wonOrLostEmoji} {formatUsername(me.username)}{" "}
      {pageId == match.winner.id ? "won " : "lost "}
      {myScore} to {opponentScore} against {formatUsername(opponent.username)}
    </ListItemText>
  );
};

function renderRow(props: ListChildComponentProps) {
  const { index, style, data } = props;

  return (
    <ListItem style={style} key={index} component="div" disablePadding>
      <ListItem>
        <MatchText match={data[index]} />
      </ListItem>
    </ListItem>
  );
}

export default function MatchList({ matchList }) {
  return (
    <>
      <Typography variant="h3">Match history</Typography>
      <Typography marginBottom={1} variant="caption">
        Last 40 games
      </Typography>
      <FixedSizeList
        height={427}
        width={"100%"}
        itemSize={46}
        itemCount={matchList.length} //max is 40
        overscanCount={5}
        itemData={matchList}
      >
        {renderRow}
      </FixedSizeList>
    </>
  );
}
