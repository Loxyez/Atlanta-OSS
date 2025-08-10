import React, {useState, useEffect} from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  TablePagination,
  Typography,
  Divider,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import axios from 'axios';
import config from '../../utils/config';
import {Container} from 'react-bootstrap';
import CustomNavbar from '../navigation-bar/navbar';

export default function TaskStatus() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    setLoading(true);
    try {
      const response = await axios.get(`${config.apiBaseUrl}/tasks/get_all_tasks`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      const sortedTasks = response.data.sort((a, b) => a.taskid - b.taskid);
      setTasks(sortedTasks);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (task) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const newStatus =
      task.task_status === 'Pending' ? 'In Progress' : task.task_status === 'In Progress' ? 'Completed' : null;

    if (!newStatus) return;

    try {
      await axios.put(
        `${config.apiBaseUrl}/tasks/update_task_status/${task.taskid}`,
        {task_status: newStatus},
        {headers: {Authorization: `Bearer ${token}`}}
      );
      setDialogOpen(true); // Show success dialog
      fetchTasks(); // Reload task list after updating status
    } catch (error) {
      console.error('Failed to update task status', error);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div>
      <CustomNavbar />
      <Container>
        <Typography variant='h4' sx={{mt: 4, mb: 4}} gutterBottom>
          จัดการสถานะงาน (Task Status)
        </Typography>
        <Divider />
        {loading ? (
          <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Task ID</TableCell>
                  <TableCell>รายละเอียดงาน</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((task) => (
                  <TableRow key={task.taskid}>
                    <TableCell>{task.taskid}</TableCell>
                    <TableCell>{task.task_detail}</TableCell>
                    <TableCell>{task.task_status}</TableCell>
                    <TableCell>
                      <Button
                        variant='contained'
                        color={
                          task.task_status === 'Pending'
                            ? 'primary'
                            : task.task_status === 'In Progress'
                              ? 'warning'
                              : 'success'
                        }
                        disabled={task.task_status === 'Completed'}
                        onClick={() => handleStatusUpdate(task)}
                      >
                        {task.task_status === 'Pending'
                          ? 'In Progress'
                          : task.task_status === 'In Progress'
                            ? 'Completed'
                            : 'Completed'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component='div'
              count={tasks.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        )}

        {/* Success Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog}>
          <DialogTitle>สำเร็จ</DialogTitle>
          <DialogContent>
            <DialogContentText>อัพเดตสถานะสำเร็จ!</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color='primary'>
              ตกลง
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </div>
  );
}
