import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from '@mui/material';
import CustomNavbar from '../navigation-bar/navbar';
import SuccessModal from '../Modal/SuccessModal';
import ErrorModal from '../Modal/ErrorModel';
import {jwtDecode} from 'jwt-decode';
import config from '../../utils/config';
import {formatDateForAPI} from '../../utils/dateUtils';
import {DateRange} from 'react-date-range';
import {format} from 'date-fns';
import {th} from 'date-fns/locale';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export default function LeaveRequest() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState('');
  const [leavePeriod, setLeavePeriod] = useState('full');
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const [reason, setReason] = useState('');
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUser({
          name: decodedToken.user_name,
          role: decodedToken.user_role,
          user_id: decodedToken.user_id,
          staff_cardid: decodedToken.staff_cardid,
        });
      } catch (err) {
        console.error('Failed to decode token', err);
      }
    }

    const fetchLeaveTypes = async () => {
      try {
        const res = await axios.get(`${config.apiBaseUrl}/leave_requests/leave_types`);
        setLeaveTypes(res.data);
      } catch (error) {
        console.error('Error fetching the leave types', error);
      }
    };

    const fetchUserLeaveBalance = async () => {
      try {
        const res = await axios.get(
          `${config.apiBaseUrl}/leave_requests/leave_balance/${jwtDecode(token).staff_cardid}`
        );
        setLeaveBalance(res.data);
      } catch (error) {
        console.error('Error fetching the leave balances', error);
      }
    };

    fetchUserLeaveBalance();
    fetchLeaveTypes();
  }, []);

  const handleModalClose = () => setShowModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    // Format dates properly to avoid timezone issues
    const leaveRequest = {
      staff_cardid: user.staff_cardid,
      leave_type_id: selectedLeave,
      leave_period: leavePeriod,
      start_date: formatDateForAPI(dateRange[0].startDate),
      end_date: formatDateForAPI(dateRange[0].endDate),
      reason,
    };

    try {
      const res = await axios.post(`${config.apiBaseUrl}/leave_requests/submit_leave_request`, leaveRequest, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 201) {
        setSuccess('ยื่นคำร้องขอวันลาเสร็จเรียบร้อย ระบบจะทำการตรวจสอบ 1-2 วัน');
        setSelectedLeave('');
        setLeavePeriod('full');
        setDateRange([
          {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection'
          }
        ]);
        setReason('');
        setShowSuccessModal(true);
      } else {
        setError('ไม่สามารถส่งคำร้องขอได้โปรดลองใหม่');
        setShowErrorModal(true);
      }
    } catch (error) {
      setError('An error occurred while submitting the leave request.');
      setShowErrorModal(true);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };

  // Thai static ranges for date picker
  const staticRanges = [
    {
      label: 'วันนี้',
      range: () => ({
        startDate: new Date(),
        endDate: new Date()
      }),
      isSelected(range) {
        const definedRange = this.range();
        return (
          format(range.startDate, 'yyyy-MM-dd') === format(definedRange.startDate, 'yyyy-MM-dd') &&
          format(range.endDate, 'yyyy-MM-dd') === format(definedRange.endDate, 'yyyy-MM-dd')
        );
      }
    },
    {
      label: 'เมื่อวาน',
      range: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          startDate: yesterday,
          endDate: yesterday
        };
      },
      isSelected(range) {
        const definedRange = this.range();
        return (
          format(range.startDate, 'yyyy-MM-dd') === format(definedRange.startDate, 'yyyy-MM-dd') &&
          format(range.endDate, 'yyyy-MM-dd') === format(definedRange.endDate, 'yyyy-MM-dd')
        );
      }
    },
    {
      label: 'สัปดาห์นี้',
      range: () => {
        const start = new Date();
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(start.setDate(diff));
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return {
          startDate: startOfWeek,
          endDate: endOfWeek
        };
      },
      isSelected(range) {
        const definedRange = this.range();
        return (
          format(range.startDate, 'yyyy-MM-dd') === format(definedRange.startDate, 'yyyy-MM-dd') &&
          format(range.endDate, 'yyyy-MM-dd') === format(definedRange.endDate, 'yyyy-MM-dd')
        );
      }
    },
    {
      label: 'เดือนนี้',
      range: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return {
          startDate: start,
          endDate: end
        };
      },
      isSelected(range) {
        const definedRange = this.range();
        return (
          format(range.startDate, 'yyyy-MM-dd') === format(definedRange.startDate, 'yyyy-MM-dd') &&
          format(range.endDate, 'yyyy-MM-dd') === format(definedRange.endDate, 'yyyy-MM-dd')
        );
      }
    }
  ];

  return (
    <div>
      <CustomNavbar user={user} />
      <Container maxWidth='md' sx={{mt: 4}}>
        <Paper elevation={3} sx={{p: 4}}>
          <Typography variant='h4' gutterBottom>
            ระบบแจ้งลากิจ/ลาป่วย
          </Typography>

          <Button variant='outlined' color='info' onClick={() => setShowModal(true)} sx={{mb: 4}}>
            สิทธิการลา (กดเพื่ออ่านข้อมูลเบื้องต้น)
          </Button>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label='ชนิดการลา'
                  value={selectedLeave}
                  onChange={(e) => setSelectedLeave(e.target.value)}
                  fullWidth
                  required
                >
                  <MenuItem value=''>
                    <em>เลือกชนิดการลา</em>
                  </MenuItem>
                  {leaveTypes.map((leaveType) => {
                    const balance = leaveBalance.find((b) => b.leave_type_id === leaveType.leave_type_id);
                    const daysLeft = balance ? balance.leave_days_left : 0;

                    return (
                      <MenuItem key={leaveType.leave_type_id} value={leaveType.leave_type_id}>
                        {leaveType.leave_name} - เหลือ {daysLeft} วัน
                      </MenuItem>
                    );
                  })}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label='เลือกรูปแบบการลา'
                  value={leavePeriod}
                  onChange={(e) => setLeavePeriod(e.target.value)}
                  fullWidth
                  required
                >
                  <MenuItem value='full'>เต็มวัน</MenuItem>
                  <MenuItem value='half-morning'>ครึ่งวันเช้า</MenuItem>
                  <MenuItem value='half-afternoon'>ครึ่งวันบ่าย</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                  เลือกช่วงวันที่ลา
                </Typography>
                <Box sx={{ 
                  width: '100%',
                  overflow: 'hidden',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '1px solid #e0e0e0',
                      width: '100%',
                      maxWidth: '800px',
                      '& .rdrCalendarWrapper': {
                        fontSize: '12px',
                        width: '100%'
                      },
                      '& .rdrDateRangeWrapper': {
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%'
                      },
                      '& .rdrDefinedRangesWrapper': {
                        borderRight: 'none',
                        borderBottom: '1px solid #e5e5e5',
                        width: '100%',
                        minHeight: 'auto',
                        '& .rdrStaticRangeLabel': {
                          fontSize: '12px'
                        }
                      },
                      '& .rdrCalendar': {
                        width: '100%'
                      },
                      '& .rdrMonth': {
                        padding: '5px',
                        width: '100%'
                      },
                      '& .rdrMonthAndYearWrapper': {
                        fontSize: '14px'
                      },
                      '& .rdrDateDisplayWrapper': {
                        backgroundColor: '#f5f5f5',
                        padding: '10px'
                      }
                    }}
                  >
                    <DateRange
                      ranges={dateRange}
                      onChange={(ranges) => setDateRange([ranges.selection])}
                      locale={th}
                      staticRanges={staticRanges}
                      inputRanges={[]}
                      showSelectionPreview={true}
                      moveRangeOnFirstSelection={false}
                      editableDateInputs={true}
                      direction="vertical"
                      calendarFocus="forwards"
                      months={1}
                      showDateDisplay={true}
                      showMonthAndYearPickers={true}
                      rangeColors={['#1976d2']}
                    />
                  </Paper>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                  วันที่เริ่มต้น: {format(dateRange[0].startDate, 'dd/MM/yyyy', { locale: th })}
                  {' - '}
                  วันที่สิ้นสุด: {format(dateRange[0].endDate, 'dd/MM/yyyy', { locale: th })}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label='เหตุผล (ถ้ามี)'
                  multiline
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  fullWidth
                  placeholder='กรุณาใส่เหตุผลของคุณที่นี่'
                />
              </Grid>

              <Grid item xs={12} sx={{textAlign: 'right'}}>
                <Button type='submit' variant='contained' color='primary'>
                  ส่งคำขอร้องการลา
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>

      <Dialog open={showModal} onClose={handleModalClose}>
        <DialogTitle>สิทธิการลา</DialogTitle>
        <DialogContent>
          <Typography variant='h6' color='primary'>
            สิทธิลากิจ
          </Typography>
          <Typography paragraph>
            พนักงานมีสิทธิ์ลากิจได้ปีละ 15 วันทำการ โดยต้องแจ้งลาล่วงหน้าอย่างน้อย 3 วันก่อนวันที่จะลา
          </Typography>
          <Typography variant='h6' color='warning'>
            สิทธิลาป่วย
          </Typography>
          <Typography paragraph>พนักงานมีสิทธิ์ลาป่วยได้ปีละ 30 วันทำการ โดยไม่จำเป็นต้องแจ้งลาล่วงหน้า</Typography>
          <Typography variant='h6' color='error'>
            สิทธิลาฉุกเฉิน
          </Typography>
          <Typography paragraph>พนักงานมีสิทธิ์ลาฉุกเฉินได้ 5 วันต่อปี โดยต้องแจ้งลาทันทีที่สามารถทำได้</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose} color='primary'>
            ปิด
          </Button>
        </DialogActions>
      </Dialog>

      <SuccessModal show={showSuccessModal} handleClose={handleCloseSuccessModal} message={success} />
      <ErrorModal show={showErrorModal} handleClose={handleCloseErrorModal} message={error} />
    </div>
  );
}
