import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  TextField,
  Box,
  Chip,
  Pagination,
  Stack,
  IconButton
} from '@mui/material';
import { FaTh, FaList } from 'react-icons/fa';
import { ShoppingCart } from '@mui/icons-material';
import api from '../utils/axios';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(6);
  const [viewType, setViewType] = useState("grid");

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
    setCurrentPage(1);
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/posts');
      const mockProducts = response.data.slice(0, 24).map(post => ({
        id: post.id,
        title: post.title,
        price: Math.floor(Math.random() * 500) + 20,
        category: ['Electronics', 'Clothing', 'Books', 'Home'][Math.floor(Math.random() * 4)],
        image: `https://picsum.photos/300/200?random=${post.id}`,
        description: post.body
      }));
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  if (loading) {
    return (
      <Container>
        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
          Loading products...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h3">
            Products ({filteredProducts.length} items)
          </Typography>
          <IconButton onClick={() => setViewType(viewType === "list" ? "grid" : "list")}>
            {viewType === "grid" ? <FaList size={30} /> : <FaTh size={20} />}
          </IconButton>
        </Box>

        <TextField
          fullWidth
          label="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Grid container spacing={4}>
          {currentProducts.map((product) => (
            <Grid item xs={12} sm={viewType === "grid" ? 6 : 12} md={viewType === "grid" ? 4 : 12} key={product.id}>
              <Card sx={{
                display: 'flex',
                flexDirection: viewType === "grid" ? 'column' : 'row',
                height: '100%',
              }}>
                <CardMedia
                  component="img"
                  image={product.image}
                  alt={product.title}
                  sx={{
                    height: viewType === "grid" ? 200: 190,
                    width: viewType === "grid" ? '100%' : 250,
                    objectFit: 'cover',
                  }}
                  
                  
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" gutterBottom>
                    {product.title.length > 50
                      ? `${product.title.substring(0, 50)}...`
                      : product.title}
                  </Typography>

                  <Chip label={product.category} size="small" sx={{ mb: 1 }} />

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {product.description.length > 100
                      ? `${product.description.substring(0, 100)}...`
                      : product.description}
                  </Typography>

                  <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
                    ${product.price}
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<ShoppingCart />}
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {totalPages > 1 && (
          <Stack spacing={2} alignItems="center" sx={{ mt: 4 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
            <Typography variant="body2" color="text.secondary">
              Showing {indexOfFirstProduct + 1}-
              {Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
            </Typography>
          </Stack>
        )}

        {filteredProducts.length === 0 && (
          <Typography variant="h6" align="center" sx={{ mt: 4 }}>
            No products found
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default Products;
