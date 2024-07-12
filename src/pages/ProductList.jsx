import { Helmet } from "react-helmet";
import { Box, Container } from "@mui/material";
import ProductListToolbar from "../components/product/ProductListToolbar";
import ProductListResults from "../components/product/ProductListResults";

const ProductList = () => (
  <>
    <Helmet>
      <title>Products | 3/O AOI</title>
    </Helmet>
    <Box
      sx={{
        backgroundColor: "#d7e0e9",
        minHeight: "100%",
        py: 3,
      }}
    >
      <Container maxWidth={false}>
        <ProductListToolbar />
        <Box sx={{ pt: 3 }}>
          <ProductListResults />
        </Box>
      </Container>
    </Box>
  </>
);

export default ProductList;
