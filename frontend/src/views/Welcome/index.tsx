import { Box, Container, Card, Typography, Grid, Button } from '@mui/material';
import { Helmet } from 'react-helmet-async';

import { styled } from '@mui/material/styles';
import Hero from './Hero';
import { Navigate } from 'react-router';
import useAuth from '../../hooks/useAuth';

const OverviewWrapper = styled(Box)(
  () => `
    overflow: auto;
    flex: 1;
    overflow-x: hidden;
    align-items: center;
`
);

function Overview() {
  const { isFirstConnect } = useAuth();
  return (
    <>
      {isFirstConnect ?
        <Navigate replace to="/settings" />
        :
        <OverviewWrapper>
          <Helmet>
            <title>Welcome</title>
          </Helmet>
          <Container maxWidth="lg">
            <Card sx={{ p: 8, mt: 8, mb: 8, borderRadius: 12 }}>
              <Hero />
            </Card>

          </Container>
        </OverviewWrapper>

      }
    </>
  );
}

export default Overview;
