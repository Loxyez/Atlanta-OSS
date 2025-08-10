import React, {useState, useEffect, useCallback} from 'react';
import {TextField, Button, Typography, CircularProgress, Box, Snackbar, Grid, MenuItem} from '@mui/material';
import axios from 'axios';
import config from '../utils/config';
import CustomNavbar from '../components/navigation-bar/navbar';

export default function CreateItem() {
  const [itemName, setItemName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrices, setItemPrices] = useState('');
  const [itemAmount, setItemAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [existingItem, setExistingItem] = useState(null); // Track if the item already exists
  const [suggestions, setSuggestions] = useState([]); // Track suggestions for item names

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    try {
      const {data} = await axios.get(`${config.apiBaseUrl}/items/get_categories`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const checkIfItemExists = useCallback(async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    try {
      const {data} = await axios.get(`${config.apiBaseUrl}/items/get_items`, {
        headers: {Authorization: `Bearer ${token}`},
        params: {item_name: itemName.toUpperCase()}, // Convert item name to uppercase
      });

      if (data.length > 0) {
        const item = data[0];
        setExistingItem(item);
        setCategoryName(item.categoryname);
        setItemDescription(item.item_description);
        setItemPrices(item.item_prices);
        setItemAmount(item.item_amount);
      } else {
        setExistingItem(null);
      }

      // Suggest existing items with similar names
      const similarItems = data.filter((item) => item.item_name.toUpperCase().includes(itemName.toUpperCase()));
      setSuggestions(similarItems.map((item) => item.item_name));
    } catch (error) {
      console.error('Failed to check if item exists', error);
    }
  }, [itemName]);

  useEffect(() => {
    if (itemName) {
      checkIfItemExists();
    } else {
      setSuggestions([]);
    }
  }, [itemName, checkIfItemExists]);

  const handleAddItem = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const newItem = {
        item_name: itemName.toUpperCase(), // Convert to uppercase
        categoryname: categoryName,
        item_description: itemDescription,
        item_prices: itemPrices,
        item_amount: itemAmount,
      };

      if (existingItem) {
        // If item exists, update it
        const updatedAmount = parseInt(existingItem.item_amount) + parseInt(itemAmount);
        await axios.put(
          `${config.apiBaseUrl}/items/update_item/${existingItem.itemid}`,
          {
            ...newItem,
            item_amount: updatedAmount, // Add to the existing amount
          },
          {
            headers: {Authorization: `Bearer ${token}`},
          }
        );
        setSuccessMessage('อัปเดตข้อมูลสินค้าสำเร็จแล้ว!');
      } else {
        // If item doesn't exist, create it
        await axios.post(`${config.apiBaseUrl}/items/create_item`, newItem, {
          headers: {Authorization: `Bearer ${token}`},
        });
        setSuccessMessage('เพิ่มสินค้าใหม่สำเร็จแล้ว!');
      }

      setItemName('');
      setCategoryName('');
      setItemDescription('');
      setItemPrices('');
      setItemAmount('');
      setExistingItem(null);
      setSuggestions([]);
    } catch (error) {
      console.error('ไม่สามารถเพิ่มสินค้าใหม่ได้', error);
      setErrorMessage('ไม่สามารถเพิ่มสินค้าใหม่ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <CustomNavbar />
      <Box sx={{p: 3}}>
        <Box
          sx={{
            p: 3,
            mx: 'auto',
            maxWidth: '600px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: 'white',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            mb: 4,
          }}
        >
          <Typography variant='h5' sx={{mb: 2}}>
            {existingItem ? 'อัปเดตข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่'}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='ชื่อสินค้า'
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
                helperText={suggestions.length > 0 ? `Suggestions: ${suggestions.join(', ')}` : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label='หมวดหมู่'
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
              >
                {categories.map((category) => (
                  <MenuItem key={category.categoryname} value={category.categoryname}>
                    {category.categoryname}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='คำอธิบายสินค้า'
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                multiline
                rows={4}
                variant='outlined'
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label='ราคาสินค้า'
                value={itemPrices}
                onChange={(e) => setItemPrices(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label='จำนวนสินค้า'
                value={itemAmount}
                onChange={(e) => setItemAmount(e.target.value)}
                required
              />
            </Grid>
          </Grid>
          <Button variant='contained' color='primary' fullWidth sx={{mt: 2}} onClick={handleAddItem} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'บันทึกข้อมูล'}
          </Button>
        </Box>

        <Snackbar
          open={Boolean(successMessage)}
          autoHideDuration={6000}
          onClose={() => setSuccessMessage('')}
          message={successMessage}
        />

        <Snackbar
          open={Boolean(errorMessage)}
          autoHideDuration={6000}
          onClose={() => setErrorMessage('')}
          message={errorMessage}
        />
      </Box>
    </div>
  );
}
