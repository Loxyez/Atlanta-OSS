import React, {useState, useEffect} from 'react';
import {
  TextField,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TablePagination,
  Button,
  Snackbar,
  Typography,
} from '@mui/material';

import axios from 'axios';
import config from '../utils/config';
import CustomNavbar from '../components/navigation-bar/navbar';
import {Search} from '@mui/icons-material';

export default function ViewStock() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDescriptionDialog, setOpenDescriptionDialog] = useState(false);
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    try {
      const {data} = await axios.get(`${config.apiBaseUrl}/items/get_all_items`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch items', error);
      setErrorMessage('ไม่สามารถดึงข้อมูลสินค้าได้');
    }
  };

  const handleOpenDescription = (itemDescription) => {
    setDescription(itemDescription);
    setOpenDescriptionDialog(true);
  };

  const handleCloseDescription = () => {
    setOpenDescriptionDialog(false);
    setDescription('');
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredItems = items.filter((item) => item.item_name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <CustomNavbar />
      <Box sx={{p: 3}}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant='h4' sx={{ml: 9}}>
            Stock Item
          </Typography>
          <TextField
            label='ค้นหา'
            variant='outlined'
            size='small'
            sx={{width: '280px', mr: 9}}
            InputProps={{
              startAdornment: <Search sx={{mr: 1}} />,
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>
        <TableContainer component={Paper} sx={{mt: 6, maxWidth: '90%', margin: '0 auto'}}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>รหัสสินค้า</TableCell>
                <TableCell>ชื่อสินค้า</TableCell>
                <TableCell>หมวดหมู่</TableCell>
                <TableCell>จำนวน</TableCell>
                <TableCell>ราคา</TableCell>
                <TableCell>คำอธิบายสินค้า</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
                <TableRow key={item.itemid}>
                  <TableCell>{item.item_pstid}</TableCell>
                  <TableCell>{item.item_name}</TableCell>
                  <TableCell>{item.categoryname}</TableCell>
                  <TableCell>{item.item_amount}</TableCell>
                  <TableCell>{item.item_prices}</TableCell>
                  <TableCell>
                    <Button variant='text' color='primary' onClick={() => handleOpenDescription(item.item_description)}>
                      คำอธิบาย
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component='div'
            count={filteredItems.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Box>

      {/* Dialog for Viewing Description */}
      <Dialog open={openDescriptionDialog} onClose={handleCloseDescription}>
        <DialogTitle>คำอธิบายสินค้า</DialogTitle>
        <DialogContent>
          <DialogContentText>{description}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDescription} color='primary'>
            ปิด
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage('')}
        message={errorMessage}
      />
    </div>
  );
}
