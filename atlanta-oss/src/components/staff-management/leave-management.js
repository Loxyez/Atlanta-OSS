import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Box,
  TablePagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
} from '@mui/material';
import config from '../../utils/config';
import CustomNavbar from '../navigation-bar/navbar';

export default function LeaveManagement() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    setLoading(true);
    try {
      const res = await axios.get(`${config.apiBaseUrl}/leave_requests/all_leave_requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLeaveRequests(res.data);
    } catch (error) {
      console.log('Error fetching leave requests', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRequest = async (requestId, status) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    console.log('Token', token);
    setLoading(true);
    try {
      await axios.put(
        `${config.apiBaseUrl}/leave_requests/update_leave_requests`,
        {
          request_id: requestId,
          status: status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchLeaveRequests();
    } catch (error) {
      console.error('Error updating leave request', error);
    } finally {
      setLoading(false);
    }
  };

  const leavePeriodMapping = {
    full: 'เต็มวัน',
    'half-morning': 'ครึ่งวันเช้า',
    'half-afternoon': 'ครึ่งวันบ่าย',
  };

  const statusMapping = {
    Pending: 'รอดำเนินการ',
    Approved: 'อนุมัติ',
    Denied: 'ปฏิเสธ',
    Rejected: 'ปฏิเสธ',
  };

  const handleOpenDialog = (reason) => {
    setSelectedReason(reason);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const paginatedRequests = leaveRequests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div>
      <CustomNavbar />
      <Container>
        <Typography variant='h4' sx={{mt: 4, mb: 4}}>
          จัดการคำร้องขอวันลา
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
                  <TableCell>รหัสพนักงาน</TableCell>
                  <TableCell>ชื่อพนักงาน</TableCell>
                  <TableCell>ประเภทการลา</TableCell>
                  <TableCell>ช่วงเวลา</TableCell>
                  <TableCell>วันที่เริ่มต้น</TableCell>
                  <TableCell>วันที่สิ้นสุด</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>การจัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRequests.map((request) => (
                  <TableRow key={request.request_id}>
                    <TableCell>{request.staff_cardid}</TableCell>
                    <TableCell>{request.staff_details.staff_name}</TableCell>
                    <TableCell>{request.leave_types.leave_name}</TableCell>
                    <TableCell>{leavePeriodMapping[request.leave_period] || request.leave_period}</TableCell>
                    <TableCell>{request.start_date}</TableCell>
                    <TableCell>{request.end_date}</TableCell>
                    <TableCell>{statusMapping[request.status] || request.status}</TableCell>
                    <TableCell>
                      {request.status === 'Pending' && (
                        <>
                          <Button
                            variant='contained'
                            color='success'
                            onClick={() => handleUpdateRequest(request.request_id, 'Approved')}
                            sx={{mr: 1}}
                          >
                            อนุมัติ
                          </Button>
                          <Button
                            variant='contained'
                            color='error'
                            sx={{mr: 1}}
                            onClick={() => handleUpdateRequest(request.request_id, 'Denied')}
                          >
                            ปฏิเสธ
                          </Button>
                        </>
                      )}
                      <Button variant='contained' color='warning' onClick={() => handleOpenDialog(request.reason)}>
                        ดูข้อมูลเพิ่มเติม
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component='div'
              count={leaveRequests.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        )}
      </Container>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>เหตุผลสำหรับการตัดสินใจ</DialogTitle>
        <Divider />
        <DialogContent>
          <p>{selectedReason}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color='primary'>
            ปิด
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
