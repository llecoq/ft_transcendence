import * as Yup from 'yup';

import { Formik } from 'formik';
import { Link as RouterLink } from 'react-router-dom';

import {
  Box,
  Button,
  FormHelperText,
  TextField,
  Avatar,
  Typography,
  Link,
  Theme,
  CircularProgress,
  lighten
} from '@mui/material';
import useAuth from 'src/hooks/useAuth';

const LoginForm = () => {
  const { loginFormMethod } = useAuth();
  let clientAPIId = process.env.REACT_APP_FORTYTWO_API_PUBLIC_KEY
  let redirect_uri = process.env.REACT_APP_FORTYTWO_REDIRECTURI
  let fulllogin42URI = "https://api.intra.42.fr/oauth/authorize?client_id=" + clientAPIId + "&redirect_uri=" + redirect_uri + "&response_type=code&grant_type=authorization_code";

  return (
    <Formik
      initialValues={{
        email: 'demot@Transcendence.com',
        password: 'demoTranscendence',
        submit: null
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email(('The email provided should be a valid email address'))
          .max(255)
          .required(('The email field is required')),
        password: Yup.string()
          .max(255)
          .required(('The password field is required')),
      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        try {
          let res = await loginFormMethod(values.email, values.password);
          if (+res.status !== 200) {
            setStatus({ success: false });
            setErrors({ submit: String(res.message) });
            setSubmitting(false);
          }
        } catch (err) {
          setStatus({ success: false });
          setErrors({ submit: err.message });
          setSubmitting(false);
        }
      }}
    >
      {({
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        touched,
        values
      }) => (
        <form noValidate onSubmit={handleSubmit}>
          <TextField
            error={Boolean(touched.email && errors.email)}
            fullWidth
            margin="normal"
            autoFocus
            helperText={touched.email && errors.email}
            label={('Email address')}
            name="email"
            onBlur={handleBlur}
            onChange={handleChange}
            type="email"
            value={values.email}
            variant="outlined"
          />
          <TextField
            error={Boolean(touched.password && errors.password)}
            fullWidth
            margin="normal"
            helperText={touched.password && errors.password}
            label={('Password')}
            name="password"
            onBlur={handleBlur}
            onChange={handleChange}
            type="password"
            value={values.password}
            variant="outlined"
          />
          {errors.submit && (
            <Box mt={1}>
              <FormHelperText error>
                {errors.submit}
              </FormHelperText>
            </Box>
          )}
          <Button
            sx={{
              mt: 3
            }}
            color="primary"
            startIcon={isSubmitting ? <CircularProgress size="1rem" /> : null}
            disabled={isSubmitting}
            type="submit"
            fullWidth
            size="large"
            variant="contained"
          >
            {('Sign in')}
          </Button>
          <Button
            sx={{ mt: 2 }}
            href={fulllogin42URI}
            size="large"
            fullWidth
            variant="contained"
          >
            Login with 42
          </Button>
        </form>

      )}
    </Formik>
  );
};

export default LoginForm;