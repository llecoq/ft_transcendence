import { Grid, Card, CardContent, Container, Typography, Box } from "@mui/material";

import { Helmet } from "react-helmet-async";
import PageTitle from "src/components/PageTitle";
import ChangeAvatar from "src/views/Settings/ChangeAvatar";
import PageTitleWrapper from "src/components/PageTitleWrapper";
import TwoFactorAuth from "./TwoFactorAuth";
import ChangeUsername from "./ChangeUsername";
import useAuth from "../../hooks/useAuth";

function Settings() {
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Account settings</title>
      </Helmet>
      <PageTitleWrapper>
        <PageTitle
          heading="Account settings"
          subHeading="Change your settings here"
          button={false}
        />
      </PageTitleWrapper>

      <Container maxWidth="lg">
				<Box paddingBottom={8}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12} md={6} lg={4}>
            <Card>
              <CardContent>
								<ChangeAvatar/>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={12} md={6} lg={4}>
            <Card>
              <CardContent>
								<ChangeUsername />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={12} md={6} lg={4}>
            <Card>
              <CardContent>
								<TwoFactorAuth />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
				</Box>
      </Container>
    </>
  );
}

export default Settings;
