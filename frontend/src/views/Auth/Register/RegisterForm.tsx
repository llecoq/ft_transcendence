import * as Yup from 'yup';
import { Formik } from 'formik';
import {
  Button,
  Box,
  FormHelperText,
  TextField,
  Typography,
  FormControlLabel,
  Link,
  CircularProgress
} from '@mui/material';
import useAuth from 'src/hooks/useAuth';

function RegisterForm() {
  const { registerFormMethod } = useAuth();

  return (
    <Formik
      initialValues={{
        email: 'demot@Transcendence.com',
        password: 'demoTranscendence',
        username: '',
        submit: null
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email(('The email provided should be a valid email address'))
          .max(255)
          .required(('The email field is required')),
        password: Yup.string()
          .min(8)
          .max(255)
          .required(('The password field is required')),
        username: Yup.string()
          .min(5)
          .max(20)
          .matches(/^[A-Za-z0-9]+$/, {message: 'Username should be digits and letters only'})
          .required(('The username field is required')),

      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        try {
          let res = await registerFormMethod(values.email, values.password, values.username);
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
            error={Boolean(touched.username && errors.username)}
            fullWidth
            margin="normal"
            helperText={touched.username && errors.username}
            label={('Username')}
            name="username"
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.username}
            variant="outlined"
          />
          <TextField
            error={Boolean(touched.email && errors.email)}
            fullWidth
            margin="normal"
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
            {('Create your account')}
          </Button>
        </form>
      )}
    </Formik>
  );
}

export default RegisterForm;
