import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  Link,
  Tooltip,
  Typography,
  Container,
  Alert,
  styled,
  Button,
  Modal
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import Scrollbar from 'src/components/Scrollbar';

import AmplifyLogin from './LoginForm';
import { useState } from 'react';
import { useSearchParams } from "react-router-dom";
import { Navigate } from 'react-router-dom';

const icons = {
  NestJS: '/static/images/logo/nestjs.svg',
  Typscript: '/static/images/logo/typescript.svg',
  SocketIO: '/static/images/logo/socket-io.svg',
  PostgreSQL: '/static/images/logo/postgresql.svg'
};

const Content = styled(Box)(
  () => `
    display: flex;
    flex: 1;
    width: 100%;
`
);

const MainContent = styled(Box)(
  () => `
  padding: 0 0 0 440px;
  width: 100%;
  display: flex;
  align-items: center;
`
);

const SidebarWrapper = styled(Box)(
  ({ theme }) => `
    position: fixed;
    left: 0;
    top: 0;
    height: 100%;
    background: ${theme.colors.alpha.white[100]};
    width: 440px;
`
);

const SidebarContent = styled(Box)(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  padding: ${theme.spacing(6)};
`
);

const CardImg = styled(Card)(
  ({ theme }) => `
    border-radius: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    border: 1px solid ${theme.colors.alpha.black[10]};
    transition: ${theme.transitions.create(['border'])};
    position: absolute;

    &:hover {
      border-color: ${theme.colors.primary.main};
    }
`
);

const TypographyH1 = styled(Typography)(
  ({ theme }) => `
    font-size: ${theme.typography.pxToRem(33)};
`
);

const TypographyH3 = styled(Typography)(
  ({ theme }) => `
    font-size: ${theme.typography.pxToRem(20)};
`
);

function LoginCover() {
  const [searchParams, setSearchParams] = useSearchParams();
  if(searchParams.get("ErrorMsgReload"))
  {
    let errorMsg = searchParams.get("ErrorMsgReload")
    //searchParams.delete('ErrorMsgReload');
    window.location.replace(location.protocol + '//' + location.host + location.pathname + "?ErrorMsg=" + errorMsg);
    //window.location.reload();
  }


  return (
    <>
      <Helmet>
        <title>Login</title>
      </Helmet>
      <Content>
        <SidebarWrapper
          sx={{
            display: { xs: 'none', md: 'flex' }
          }}
        >
          <Scrollbar>
            <SidebarContent>
              <Box mt={6}>
                <TypographyH1
                  variant="h1"
                  sx={{
                    mb: 1
                  }}
                >
                  {('Transendence')}
                </TypographyH1>
                <TypographyH3
                  variant="h3"
                  sx={{
                    mb: 7
                  }}
                >
                  {('Ariane - Louis - Victor')}
                </TypographyH3>
                <Box
                  sx={{
                    position: 'relative',
                    width: 300,
                    height: 120
                  }}
                >
                  <Tooltip arrow placement="top" title="PostgreSQL">
                    <CardImg
                      sx={{
                        width: 80,
                        height: 80,
                        left: -20,
                        top: -40
                      }}
                    >
                      <img width={40} alt="PostgreSQL" src={icons.PostgreSQL} />
                    </CardImg>
                  </Tooltip>
                  <Tooltip arrow placement="top" title="NestJS">
                    <CardImg
                      sx={{
                        width: 90,
                        height: 90,
                        left: 70
                      }}
                    >
                      <img width={50} alt="NestJS" src={icons.NestJS} />
                    </CardImg>
                  </Tooltip>
                  <Tooltip arrow placement="top" title="Socket IO">
                    <CardImg
                      sx={{
                        width: 110,
                        height: 110,
                        top: -30,
                        left: 170
                      }}
                    >
                      <img width={80} alt="Socket IO" src={icons.SocketIO} />
                    </CardImg>
                  </Tooltip>
                  <Tooltip arrow placement="top" title="Typescript React">
                    <CardImg
                      sx={{
                        width: 70,
                        height: 70,
                        bottom: 0,
                        right: -55
                      }}
                    >
                      <img width={50} alt="Typescript React" src={icons.Typscript} />
                    </CardImg>
                  </Tooltip>
                </Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    my: 3
                  }}
                >
                  {(
                    'Transcendence is a pong and chat website using multiple technos.'
                  )}
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="text.primary"
                  fontWeight="bold"
                >
                  {('Want to know more about our project ?')}
                </Typography>
                <Typography variant="subtitle1">
                  {(
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'
                  )}
                  .{' '}
                  <Link href="/docs">
                    Github
                  </Link>
                </Typography>
              </Box>
            </SidebarContent>
          </Scrollbar>
        </SidebarWrapper>
        <MainContent>
          <Container
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column'
            }}
            maxWidth="sm"
          >
            <Card
              sx={{
                p: 4,
                my: 4
              }}
            >
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  sx={{
                    mb: 1
                  }}
                >
                  {('Sign in')}
                </Typography>
                <Typography
                  variant="h4"
                  color="text.secondary"
                  fontWeight="normal"
                  sx={{
                    mb: 3
                  }}
                >
                  {('Fill in the fields below to sign into your account.')}
                </Typography>
              </Box>
              <AmplifyLogin />
              <Typography
                  component="span"
                  variant="subtitle2"
                  color="red"
                  fontWeight="bold"
                >
                  {searchParams.get("ErrorMsg")}
                </Typography>
              <Box my={4}>
                <Typography
                  component="span"
                  variant="subtitle2"
                  color="text.primary"
                  fontWeight="bold"
                >
                  {('Don’t have an account, yet?')}
                </Typography>{' '}
                <Link component={RouterLink} to="/register">
                  <b>Sign up here</b>
                </Link>
              </Box>
              <Tooltip
                title={('Used only for the live preview demonstration !')}
              >
                <Alert severity="warning">
                  Use <b>demo@example.com</b> and password <b>demoTranscendence</b>
                </Alert>
              </Tooltip>
            </Card>
          </Container>
        </MainContent>
      </Content>
    </>
  );
}

export default LoginCover;
