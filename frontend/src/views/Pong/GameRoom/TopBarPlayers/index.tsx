import { Avatar, Box, Button, Card, CardContent, Container, Typography } from "@mui/material"
import PropTypes from 'prop-types';
import { useEffect, useState } from "react";
import DisplayPlayer from "./DisplayPlayer";

TopBarPlayers.propTypes = {
  refCardWidth: PropTypes.any.isRequired,
  players: PropTypes.any.isRequired
}

export default function TopBarPlayers(props) {
  const { refCardWidth, players } = props
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(refCardWidth.current.offsetWidth)
  }, [])

  useEffect(() => {
    window.addEventListener('resize', resizeCard)
    return () => window.removeEventListener('resize', resizeCard)
  }, ['resize'])
  
  const resizeCard = () => {setWidth(refCardWidth.current.offsetWidth)}

  return (
    <Box
      mb={2}
      sx={{ width: width }}
    >
      <Card>
        <CardContent>
          <Box
            display='flex'
            flexDirection='row'
          >
            {
              players.one &&
              <DisplayPlayer
                player={players.one}
                flexDirection='row'
              />
            }
            {
              players.two &&
              <DisplayPlayer
                player={players.two}
                flexDirection='row-reverse'
              />
            }
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}