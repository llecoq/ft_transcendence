import { styled, useTheme } from '@mui/material/styles';
import MobileStepper from '@mui/material/MobileStepper';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import SwipeableViews from 'react-swipeable-views';
import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Icon } from '@mui/material';
import PropTypes, { number } from 'prop-types';

const maps = [
  {
    label: 'modern',
    imgPath:
      '/static/images/gif/PongModernGif.gif',
  },
  {
    label: 'retro',
    imgPath:
      '/static/images/gif/PongRetroGif.gif',
  },
];

const ChoosePLayerModeButton = styled(Button)(
  ({ theme }) => `
        padding-left: ${theme.spacing(1)};
        padding-right: ${theme.spacing(1)};
`
);

CarouselMaps.propTypes = {
  setMap: PropTypes.func.isRequired,
  setNumberOfPlayers: PropTypes.func.isRequired,
  createGameRoom: PropTypes.func.isRequired,
  inviteFriendId: PropTypes.number.isRequired
}

export default function CarouselMaps(props) {
  const { setMap, setNumberOfPlayers, createGameRoom, inviteFriendId } = props
  const theme = useTheme()
  const [activeStep, setActiveStep] = useState(0)
  const maxSteps = maps.length
  const [action, setAction] = useState('select a map')

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleStepChange = (step: number) => {
    setActiveStep(step)
  }

  const handleClickSelectMap = (mapName: string) => {
    setMap(mapName)
    if (inviteFriendId)
      setAction('start playing')
    else
      setAction('select player mode')
  }

  const handleClickChoosePlayerMode = (numberOfPlayers: number) => {
    setNumberOfPlayers(numberOfPlayers)
    setAction('start playing')
  }

  useEffect(() => {
    if (action === 'start playing')
      createGameRoom()
  }, [action])

  return (
    <>
      {action === 'select a map' && (
      <Box sx={{ maxWidth: 400, flexGrow: 1, alignContent: 'center' }} mt={3}>
        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={activeStep}
          onChangeIndex={handleStepChange}
          enableMouseEvents
        >
          {maps.map((step, index) => (
            <div key={step.label}>
              <Box display='flex' justifyContent='center'>
              {Math.abs(activeStep - index) <= 2 ? (
                <Box
                  component="img"
                  sx={{
                    height: 255,
                    display: 'block',
                    maxWidth: 400,
                    overflow: 'hidden',
                  }}
                  src={step.imgPath}
                  alt={step.label}
                  />
                ) : null
              }
              </Box>
              <Box display='flex' justifyContent='center'>
                {action === 'select a map' && 
                  <Button onClick={() => handleClickSelectMap(step.label)}>
                    Select this map
                  </Button>
                }
              </Box>
            </div>
          ))}
        </SwipeableViews>
        <MobileStepper
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
          nextButton={
            <Button
              size="small"
              onClick={handleNext}
              disabled={activeStep === maxSteps - 1}
            >
              Next
              {theme.direction === 'rtl' ? (
                <KeyboardArrowLeft />
              ) : (
                <KeyboardArrowRight />
              )}
            </Button>
          }
          backButton={
            <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
              {theme.direction === 'rtl' ? (
                <KeyboardArrowRight />
              ) : (
                <KeyboardArrowLeft />
              )}
              Back
            </Button>
          }
        />
      </Box> )}
      {action === 'select player mode' && (
        <Box 
          sx={{ maxWidth: 400, flexGrow: 1, alignContent: 'center' }} 
          display='flex' 
          flexDirection='row'
          justifyContent='space-evenly'
        >
          <ChoosePLayerModeButton color="secondary" onClick={() => handleClickChoosePlayerMode(1)}>
            <img
              src='/static/images/assets/onePlayerBlue.png'
              onMouseOver={e => (e.currentTarget.src = "/static/images/assets/onePlayerBlueSecondary.png")}
              onMouseOut={e => (e.currentTarget.src = "/static/images/assets/onePlayerBlue.png")}
              style={{ width: '100%' }}
              onClick={() => setNumberOfPlayers(1)}
            />
          </ChoosePLayerModeButton>
          <ChoosePLayerModeButton color="secondary" onClick={() => handleClickChoosePlayerMode(2)}>
            <img
              src='/static/images/assets/twoPlayersBlue.png'
              onMouseOver={e => (e.currentTarget.src = "/static/images/assets/twoPlayersBlueSecondary.png")}
              onMouseOut={e => (e.currentTarget.src = "/static/images/assets/twoPlayersBlue.png")}
              style={{ width: '100%' }}
            />
          </ChoosePLayerModeButton>
        </Box>
      )}
    </>
  )
}

