import {
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableRow,
  styled,
  TableCell,
  tableCellClasses,
	Typography,
} from "@mui/material";

// ============================================
// Stats table
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

function createData(stat: string, value: number) {
  return { stat, value };
}

export default function StatsTable({ stats, displayTitle }) {
  const rows = [
    createData("Victory", stats.victories),
    createData("Defeat", stats.defeat),
    createData("Xp", stats.xp),
    createData("Level", stats.level),
    createData("Rank", stats.rank),
  ];

  return (
    <>
      {displayTitle === true &&
      <Typography marginBottom={2} variant="h3">
        Stats
      </Typography>}
      <TableContainer component={Paper}>
        <Table aria-label="customized table">
          <TableBody>
            {rows.map((row) => (
              <StyledTableRow key={row.stat}>
                <StyledTableCell component="th" scope="row">
                  {row.stat}
                </StyledTableCell>
                <StyledTableCell align="right">
                  {row.stat === "Rank"
                    ? `${row.value} (${stats.nbOfPlayers} players)`
                    : row.value}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
