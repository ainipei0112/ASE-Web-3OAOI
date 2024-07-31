import { Helmet } from "react-helmet";
import {
  Box,
  Container
} from '@mui/material';
import ChartContent from "../components/chart/ChartContent"; //正式
import ChartContentForReport from "../components/chart/ChartContentForReport"; //報告用

const Chart = () => {

  return (
    <>
      <Helmet>
        <title>Chart | 3/O AOI</title>
      </Helmet>
      <Box
        sx={{
          minHeight: "100%",
          py: 1,
        }}
      >
        <Container maxWidth={false}>
          <Box sx={{ pt: 1 }}>
            <ChartContent />
            {/* <ChartContentForReport /> */}
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Chart;