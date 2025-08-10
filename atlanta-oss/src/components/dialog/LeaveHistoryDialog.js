import React, {useState, useEffect} from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import axios from 'axios';
import config from '../../utils/config';

export default function LeaveHistoryDialog({open, staff_CARDID, leaveTypeId, onClose}) {
  const [leaveHistory, setLeaveHistory] = useState([]);

  useEffect(() => {
    if (open) {
      fetchLeaveHistory();
    }
  }, [open]);

  const fetchLeaveHistory = async () => {
    try {
      console.log(leaveTypeId);
      const response = await axios.get(
        `${config.apiBaseUrl}/leave_requests/leave_request/${staff_CARDID}/${leaveTypeId}`
      );
      setLeaveHistory(response.data);
    } catch (error) {
      console.error('Error fetching leave history', error);
      setLeaveHistory([]);
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

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>ประวัติการลา {staff_CARDID}</DialogTitle>
      <DialogContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ชนิดการลา</TableCell>
              <TableCell>ช่วงเวลา</TableCell>
              <TableCell>เริ่มวันที่</TableCell>
              <TableCell>จนถึงวันที่</TableCell>
              <TableCell>สถานะ</TableCell>
              <TableCell>เหตุผล</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(leaveHistory) && leaveHistory.length > 0 ? (
              leaveHistory.map((leave) => (
                <TableRow key={leave.request_id}>
                  <TableCell>{leave.leave_types.leave_name}</TableCell>
                  <TableCell>{leavePeriodMapping[leave.leave_period] || leave.leave_period}</TableCell>
                  <TableCell>{leave.start_date}</TableCell>
                  <TableCell>{leave.end_date}</TableCell>
                  <TableCell>{statusMapping[leave.status] || leave.status}</TableCell>
                  <TableCell>{leave.reason}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>ยังไม่มีการแจ้งลาลงในระบบ</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DialogContent>
      <Button onClick={onClose}>ปิด</Button>
    </Dialog>
  );
}
