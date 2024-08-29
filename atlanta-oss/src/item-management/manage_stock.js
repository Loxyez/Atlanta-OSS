import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Box,
    Snackbar,
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
    Typography
} from '@mui/material';

import axios from 'axios';
import config from '../utils/config';
import CustomNavbar from '../components/navigation-bar/navbar';
import { Search, Edit, Delete } from '@mui/icons-material';

export default function ManageStock() {
    const [items, setItems] = useState([]);
    const [newItemDetails, setNewItemDetails] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [itemToDelete, setItemToDelete] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDescriptionDialog, setOpenDescriptionDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [description, setDescription] = useState('');

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        try {
            const { data } = await axios.get(`${config.apiBaseUrl}/items/get_all_items`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setItems(data);
        } catch (error) {
            console.error('Failed to fetch items', error);
            setErrorMessage('ไม่สามารถดึงข้อมูลสินค้าได้');
        }
    };

    const handleEdit = (itemid) => {
        const itemToEdit = items.find(item => item.itemid === itemid);
        if (itemToEdit) {
            setNewItemDetails({ ...itemToEdit });
            setOpenEditDialog(true);
        } else {
            setErrorMessage('ไม่พบสินค้าที่ต้องการแก้ไข');
        }
    };

    const handleSaveEdit = async () => {
        if (!newItemDetails.itemid || !newItemDetails.item_name || !newItemDetails.item_prices || !newItemDetails.item_amount) {
            setErrorMessage('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
            return;
        }

        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        try {
            await axios.put(`${config.apiBaseUrl}/items/update_item/${newItemDetails.itemid}`, newItemDetails, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccessMessage('อัปเดตข้อมูลสำเร็จแล้ว!');
            setOpenEditDialog(false);
            fetchItems();
        } catch (error) {
            console.error('ไม่สามารถอัปเดตสินค้าได้', error);
            setErrorMessage('ไม่สามารถอัปเดตสินค้าได้');
        }
    };

    const handleCancelEdit = () => {
        setNewItemDetails({});
        setOpenEditDialog(false);
    };

    const handleConfirmDelete = (itemid) => {
        setOpenDeleteDialog(true);
        setItemToDelete(itemid);
    };

    const handleDelete = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        try {
            await axios.delete(`${config.apiBaseUrl}/items/delete_item/${itemToDelete}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccessMessage('ลบสินค้าเรียบร้อยแล้ว!');
            fetchItems();
        } catch (error) {
            console.error('ไม่สามารถลบสินค้าได้', error);
            setErrorMessage('ไม่สามารถลบสินค้าได้');
        } finally {
            setOpenDeleteDialog(false);
            setItemToDelete(null);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenDescription = (itemDescription) => {
        setDescription(itemDescription);
        setOpenDescriptionDialog(true);
    };

    const handleCloseDescription = () => {
        setOpenDescriptionDialog(false);
        setDescription('');
    };

    const handleCancelDelete = () => {
        setOpenDeleteDialog(false);
        setItemToDelete(null);
    };

    const filteredItems = items.filter(item => 
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <CustomNavbar />
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ ml: 9 }}>Stock Management</Typography> 
                <TableContainer component={Paper} sx={{ mt: 4, mx: 'auto', maxWidth: '90%' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>รหัสสินค้า</TableCell>
                                <TableCell>ชื่อสินค้า</TableCell>
                                <TableCell>หมวดหมู่</TableCell>
                                <TableCell>จำนวน</TableCell>
                                <TableCell>ราคา</TableCell>
                                <TableCell>คำอธิบายสินค้า</TableCell>
                                <TableCell sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    จัดการข้อมูล
                                    <TextField
                                        label="ค้นหา"
                                        sx={{ ml: 2, width: '200px' }}
                                        InputProps={{
                                            startAdornment: <Search sx={{ mr: 1 }} />,
                                        }}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </TableCell>
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
                                        <Button
                                            variant="text"
                                            color="primary"
                                            onClick={() => handleOpenDescription(item.item_description)}
                                        >
                                            คำอธิบาย
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<Edit />}
                                            onClick={() => handleEdit(item.itemid)}
                                            sx={{ mr: 1 }}
                                        >
                                            แก้ไข
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            startIcon={<Delete />}
                                            onClick={() => handleConfirmDelete(item.itemid)}
                                        >
                                            ลบข้อมูล
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredItems.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </TableContainer>
            </Box>
            {/* Dialog for Editing Item */}
            <Dialog open={openEditDialog} onClose={handleCancelEdit}>
                <DialogTitle>แก้ไขสินค้า</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="ชื่อสินค้า"
                        type="text"
                        fullWidth
                        value={newItemDetails.item_name || ''}
                        onChange={(e) => setNewItemDetails({ ...newItemDetails, item_name: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="คำอธิบาย"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        value={newItemDetails.item_description || ''}
                        onChange={(e) => setNewItemDetails({ ...newItemDetails, item_description: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="ราคา"
                        type="number"
                        fullWidth
                        value={newItemDetails.item_prices || ''}
                        onChange={(e) => setNewItemDetails({ ...newItemDetails, item_prices: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="จำนวน"
                        type="number"
                        fullWidth
                        value={newItemDetails.item_amount || ''}
                        onChange={(e) => setNewItemDetails({ ...newItemDetails, item_amount: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelEdit}>ยกเลิก</Button>
                    <Button onClick={handleSaveEdit} color="primary">บันทึก</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog for Viewing Description */}
            <Dialog open={openDescriptionDialog} onClose={handleCloseDescription}>
                <DialogTitle>คำอธิบายสินค้า</DialogTitle>
                <DialogContent>
                    <DialogContentText>{description}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDescription} color="primary">ปิด</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog for Confirm Delete */}
            <Dialog open={openDeleteDialog} onClose={handleCancelDelete}>
                <DialogTitle>ยืนยันการลบข้อมูล</DialogTitle>
                <DialogContent>
                    <DialogContentText>คุณแน่ใจหรือว่าต้องการลบสินค้านี้?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete}>ยกเลิก</Button>
                    <Button onClick={handleDelete} color="error">ลบข้อมูล</Button>
                </DialogActions>
            </Dialog>

            {/* Success Snackbar */}
            <Snackbar
                open={!!successMessage}
                autoHideDuration={6000}
                onClose={() => setSuccessMessage('')}
                message={successMessage}
            />

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
