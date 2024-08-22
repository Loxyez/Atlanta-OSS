import React, { useState, useEffect } from 'react';
import { 
    TextField, 
    Button, 
    Typography, 
    CircularProgress, 
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
    TablePagination
} from '@mui/material';

import axios from 'axios';
import config from '../utils/config';
import CustomNavbar from '../components/navigation-bar/navbar';
import { Search, Edit, Delete } from '@mui/icons-material';
export default function CreateCategory() {
    const [categoryName, setCategoryName] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [categories, setCategories] = useState([]);
    const [editMode, setEditMode] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        try {
            const { data } = await axios.get(`${config.apiBaseUrl}/categories/get_category_details`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories', error);
        }
    };

    const handleAddCategory = async () => {
        setLoading(true);
    
        // Validate the input: only English letters allowed
        const englishRegex = /^[A-Za-z\s]+$/;
        if (!englishRegex.test(categoryName)) {
            setErrorMessage('กรุณากรอกชื่อหมวดหมู่เป็นภาษาอังกฤษเท่านั้น');
            setLoading(false);
            return;
        }
    
        // Convert category name to uppercase
        const uppercaseCategoryName = categoryName.toUpperCase();
    
        // Check if the category name already exists in the database
        const isDuplicate = categories.some(
            (category) => category.categoryname.toUpperCase() === uppercaseCategoryName
        );
    
        if (isDuplicate) {
            setErrorMessage('ชื่อหมวดหมู่นี้มีอยู่แล้วในระบบ');
            setLoading(false);
            return;
        }
    
        const newCategory = { categoryname: uppercaseCategoryName };
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            await axios.post(`${config.apiBaseUrl}/categories/create_category`, newCategory, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccessMessage('เพิ่มหมวดหมู่สำเร็จแล้ว!');
            setCategoryName(''); 
            fetchCategories();
        } catch (error) {
            console.error('ไม่สามารถเพิ่มหมวดหมู่ได้', error);
            setErrorMessage('ไม่สามารถเพิ่มหมวดหมู่ได้');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        try {
            await axios.delete(`${config.apiBaseUrl}/categories/delete_category/${categoryToDelete}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccessMessage('Category deleted successfully!');
            fetchCategories();
        } catch (error) {
            console.error('Failed to delete category', error);
            setErrorMessage('Failed to delete category');
        } finally {
            setConfirmDelete(false);
            setCategoryToDelete(null);
        }
    };

    const handleEdit = (categoryid) => {
        setEditMode(categoryid);
        const categoryToEdit = categories.find(category => category.categoryid === categoryid);
        setNewCategoryName(categoryToEdit.categoryname);
    };

    const handleSaveEdit = async (categoryid) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        try {
            await axios.put(`${config.apiBaseUrl}/categories/update_category/${categoryid}`, {
                categoryname: newCategoryName
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditMode(null);
            fetchCategories();
            setSuccessMessage('Category updated successfully!');
        } catch (error) {
            console.error('Failed to update category', error);
            setErrorMessage('Failed to update category');
        }
    };

    const handleCancelEdit = () => {
        setEditMode(null);
        setNewCategoryName('');
    };

    const handleConfirmDelete = (categoryid) => {
        setConfirmDelete(true);
        setCategoryToDelete(categoryid);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const filteredCategories = categories.filter(category => 
        category.categoryname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <CustomNavbar />
            <Box sx={{ p: 3 }}>
                <Box
                    sx={{
                        p: 3,
                        mx: 'auto',
                        maxWidth: '400px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center',
                        mb: 4
                    }}
                >
                    <Typography variant="h5" sx={{ mb: 2 }}>
                        เพิ่มหมวดหมู่สินค้า
                    </Typography>
                    <TextField
                        fullWidth
                        label="ชื่อหมวดหมู่"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={handleAddCategory}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'บันทึกข้อมูล'}
                    </Button>
                </Box>

                <TextField
                    label="ค้นหา"
                    fullWidth
                    sx={{ mb: 2, maxWidth: '400px' }}
                    InputProps={{
                        startAdornment: <Search sx={{ mr: 1 }} />,
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                {loading ? (
                    <CircularProgress />
                ) : (
                    <TableContainer component={Paper} sx={{ mt: 4, mx: 'auto', maxWidth: '600px' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ชื่อหมวดหมู่</TableCell>
                                    <TableCell>จัดการข้อมูล</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredCategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((category) => (
                                    <TableRow key={category.categoryid}>
                                        <TableCell>
                                            {editMode === category.categoryid ? (
                                                <TextField
                                                    value={newCategoryName}
                                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                                />
                                            ) : (
                                                category.categoryname
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editMode === category.categoryid ? (
                                                <>
                                                    <Button onClick={() => handleSaveEdit(category.categoryid)}>บันทึก</Button>
                                                    <Button onClick={handleCancelEdit}>ยกเลิก</Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        startIcon={<Edit />}
                                                        onClick={() => handleEdit(category.categoryid)}
                                                        sx={{ mr: 1 }}
                                                    >
                                                        แก้ไข
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        color="error"
                                                        startIcon={<Delete />}
                                                        onClick={() => handleConfirmDelete(category.categoryid)}
                                                    >
                                                        ลบข้อมูล
                                                    </Button>
                                                </>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={filteredCategories.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </TableContainer>

                )}
            </Box>

            {/* Confirm Delete Dialog */}
            <Dialog
                open={confirmDelete}
                onClose={() => setConfirmDelete(false)}
            >
                <DialogTitle>ยืนยันการลบหมวดหมู่</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        คุณต้องการลบหมวดหมู่นี้จริงหรือไม่?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDelete(false)}>ยกเลิก</Button>
                    <Button onClick={handleDelete} color="error">ลบ</Button>
                </DialogActions>
            </Dialog>

            {/* Success and Error Snackbar */}
            <Snackbar
                open={Boolean(successMessage)}
                autoHideDuration={3000}
                onClose={() => setSuccessMessage('')}
                message={successMessage}
            />
            <Snackbar
                open={Boolean(errorMessage)}
                autoHideDuration={3000}
                onClose={() => setErrorMessage('')}
                message={errorMessage}
            />
        </div>
    );
}
