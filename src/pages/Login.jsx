import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import * as Yup from "yup";
import { Formik } from "formik";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useContext } from "react";
import { AppContext } from "../Context";

const Login = () => {
  const navigate = useNavigate();
  const { userLogin } = useContext(AppContext);

  return (
    <>
      <Helmet>
        <title>Login | 3/O AOI</title>
      </Helmet>
      <Box
        sx={{
          backgroundColor: "#F0E7DD",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
        }}
      >
        <Container maxWidth="sm">
          <Formik
            initialValues={{
              EmpId: "Your Empid",
              password: "",
            }}
            validationSchema={Yup.object().shape({
              EmpId: Yup.string().max(5).required("Empid is required"),
              password: Yup.string().max(255).required("Password is required"),
            })}
            onSubmit={(value) => {
              navigate("/app/chart", { replace: true }); // 登入後首頁
              userLogin(value);
            }}
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
              isSubmitting,
              touched,
              values,
            }) => (
              <form onSubmit={handleSubmit}>
                <Box>
                  <Typography align="center" color="#000000" variant="h2">
                    Sign in
                  </Typography>
                  <Typography
                    align="center"
                    color="#e5b299"
                    gutterBottom
                    variant="body2"
                  >
                    Sign in on the internal platform
                  </Typography>
                </Box>
                <TextField
                  error={Boolean(touched.EmpId && errors.EmpId)}
                  fullWidth
                  helperText={touched.EmpId && errors.EmpId}
                  label="Your EmpId"
                  margin="normal"
                  name="EmpId"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  type="number"
                  value={values.Empid}
                  variant="outlined"
                />
                <TextField
                  error={Boolean(touched.password && errors.password)}
                  fullWidth
                  helperText={touched.password && errors.password}
                  label="Password"
                  margin="normal"
                  name="password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  type="password"
                  value={values.password}
                  variant="outlined"
                />
                <Box sx={{ py: 2 }}>
                  <Button
                    color="primary"
                    disabled={isSubmitting}
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                  >
                    Sign in now
                  </Button>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Box>
    </>
  );
};

export default Login;
