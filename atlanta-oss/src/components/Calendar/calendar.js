import {useState, useEffect} from 'react';
import axios from 'axios';
import CustomNavbar from '../navigation-bar/navbar';
import {jwtDecode} from 'jwt-decode';
import config from '../../utils/config';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './calendar.css';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';

export default function Calendar() {
  const [user, setUser] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

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

    const fetchLeaveRequests = async () => {
      try {
        const res = await axios.get(`${config.apiBaseUrl}/leave_requests/all_leave_requests`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.data) {
          setEventDetails(
            res.data
              .map((req) => {
                // Determine event color based on status
                let color = '#099ce5'; // default
                if (req.status === 'Approved') color = '#4caf50';
                else if (req.status === 'Denied') color = '#f44336';
                else if (req.status === 'Pending') color = '#ff9800';

                // For multi-day leave, create an event for each day
                const eventsForRequest = [];
                const startDate = new Date(req.start_date);
                const endDate = new Date(req.end_date);

                // Calculate the end date for FullCalendar (needs to be the day after for multi-day events)
                const calendarEndDate = new Date(endDate);
                calendarEndDate.setDate(calendarEndDate.getDate() + 1);

                // Determine if this is a multi-day event or single day
                const isMultiDay = startDate.toDateString() !== endDate.toDateString();

                if (isMultiDay || req.leave_period === 'full-day') {
                  // Create a single all-day event for multi-day or full-day leave
                  eventsForRequest.push({
                    id: `leave-${req.request_id}`,
                    title: `${req.staff_details?.staff_name || req.staff_cardid} - ${req.leave_types?.leave_name || 'Leave'}`,
                    start: startDate.toISOString().slice(0, 10),
                    end: calendarEndDate.toISOString().slice(0, 10),
                    allDay: true,
                    backgroundColor: color,
                    borderColor: color,
                    extendedProps: {
                      staffName: req.staff_details?.staff_name || req.staff_cardid,
                      leaveType: req.leave_types?.leave_name,
                      reason: req.reason,
                      status: req.status,
                      leavePeriod: req.leave_period,
                      requestId: req.request_id,
                    },
                  });
                } else {
                  // For half-day leave, create timed events
                  let startTime;
                  let endTime;
                  if (req.leave_period === 'half-morning') {
                    startTime = '09:00:00';
                    endTime = '12:00:00';
                  } else if (req.leave_period === 'half-afternoon') {
                    startTime = '13:00:00';
                    endTime = '17:00:00';
                  } else {
                    // Default full day
                    startTime = '09:00:00';
                    endTime = '17:00:00';
                  }

                  eventsForRequest.push({
                    id: `leave-${req.request_id}`,
                    title: `${req.staff_details?.staff_name || req.staff_cardid} - ${req.leave_types?.leave_name || 'Leave'}`,
                    start: `${startDate.toISOString().slice(0, 10)}T${startTime}`,
                    end: `${startDate.toISOString().slice(0, 10)}T${endTime}`,
                    allDay: false,
                    backgroundColor: color,
                    borderColor: color,
                    extendedProps: {
                      staffName: req.staff_details?.staff_name || req.staff_cardid,
                      leaveType: req.leave_types?.leave_name,
                      reason: req.reason,
                      status: req.status,
                      leavePeriod: req.leave_period,
                      requestId: req.request_id,
                    },
                  });
                }

                return eventsForRequest;
              })
              .flat()
          );
        } else {
          console.error('Failed to fetch leave requests:', res.data.message);
        }
      } catch (err) {
        console.error('Error fetching leave requests:', err);
      }
    };

    fetchLeaveRequests();
  }, []);

  // FullCalendar event handlers
  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    const props = event.extendedProps;

    setSelectedEvent({
      title: event.title,
      staffName: props.staffName,
      leaveType: props.leaveType,
      status: props.status,
      period: props.leavePeriod,
      reason: props.reason || 'ไม่ได้ระบุเหตุผล',
      start: event.start,
      end: event.end,
      allDay: event.allDay,
    });
    setDialogOpen(true);
  };

  const handleDateClick = (dateClickInfo) => {
    setSelectedDate(dateClickInfo.dateStr);
    const formattedDate = new Date(dateClickInfo.dateStr).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
    setSnackbarMessage(`เลือกวันที่: ${formattedDate}`);
    setSnackbarOpen(true);

    // You can add additional logic here, such as:
    // - Opening a form to create a new leave request
    // - Showing available slots for the selected date
    console.log('วันที่ที่เลือก:', dateClickInfo.dateStr, 'สถานะ:', selectedDate);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedEvent(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Thai locale configuration
  const thaiLocale = {
    code: 'th',
    week: {
      dow: 1, // Monday is the first day of the week
    },
    buttonText: {
      prev: 'ก่อนหน้า',
      next: 'ถัดไป',
      today: 'วันนี้',
      month: 'เดือน',
      week: 'สัปดาห์',
      day: 'วัน',
      list: 'รายการ',
    },
    weekText: 'สัปดาห์',
    allDayText: 'ทั้งวัน',
    moreLinkText: function (n) {
      return 'อีก ' + n + ' รายการ';
    },
    noEventsText: 'ไม่มีกิจกรรมที่จะแสดง',
    dayNames: ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'],
    dayNamesShort: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
    monthNames: [
      'มกราคม',
      'กุมภาพันธ์',
      'มีนาคม',
      'เมษายน',
      'พฤษภาคม',
      'มิถุนายน',
      'กรกฎาคม',
      'สิงหาคม',
      'กันยายน',
      'ตุลาคม',
      'พฤศจิกายน',
      'ธันวาคม',
    ],
    monthNamesShort: [
      'ม.ค.',
      'ก.พ.',
      'มี.ค.',
      'เม.ย.',
      'พ.ค.',
      'มิ.ย.',
      'ก.ค.',
      'ส.ค.',
      'ก.ย.',
      'ต.ค.',
      'พ.ย.',
      'ธ.ค.',
    ],
  };

  return (
    <div>
      <CustomNavbar />
      <Container maxWidth='lg' sx={{mt: 4, mb: 4}}>
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: 3,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography
              variant='h4'
              gutterBottom
              sx={{
                fontWeight: 'bold',
                color: '#2c3e50',
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              📅 ปฏิทินวันลา / วันหยุด
            </Typography>

            <Box sx={{display: 'flex', gap: 1}}>
              <Chip
                icon={<span>🟢</span>}
                label='อนุมัติ'
                variant='outlined'
                sx={{color: '#4caf50', borderColor: '#4caf50'}}
              />
              <Chip
                icon={<span>🟠</span>}
                label='รอดำเนินการ'
                variant='outlined'
                sx={{color: '#ff9800', borderColor: '#ff9800'}}
              />
              <Chip
                icon={<span>🔴</span>}
                label='ไม่อนุมัติ'
                variant='outlined'
                sx={{color: '#f44336', borderColor: '#f44336'}}
              />
            </Box>
          </Box>

          {user && ['Manager', 'operator', 'Developer'].includes(user.role) && (
            <Button
              variant='contained'
              color='primary'
              sx={{
                mb: 3,
                borderRadius: 2,
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                  transform: 'translateY(-1px)',
                },
                // Make
              }}
            >
              ➕ เพิ่ม / แก้ไข วันหยุด
            </Button>
          )}

          <Paper
            elevation={2}
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
            }}
            className='calendar-glow'
          >
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView='dayGridMonth'
              locale={thaiLocale}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              events={eventDetails}
              eventClick={handleEventClick}
              dateClick={handleDateClick}
              selectable={true}
              selectMirror={true}
              height='auto'
              firstDay={1}
              eventDisplay='block'
              dayMaxEvents={3}
              moreLinkClick='popover'
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }}
              dayHeaderFormat={{weekday: 'short'}}
              titleFormat={{year: 'numeric', month: 'long'}}
              eventClassNames={(info) => {
                const status = info.event.extendedProps.status;
                if (status === 'Approved') return ['event-approved'];
                if (status === 'Denied') return ['event-denied'];
                if (status === 'Pending') return ['event-pending'];
                return [];
              }}
              dayCellClassNames={(info) => {
                const today = new Date();
                const cellDate = info.date;
                const isToday = cellDate.toDateString() === today.toDateString();
                const isWeekend = cellDate.getDay() === 0 || cellDate.getDay() === 6;

                const classes = [];
                if (isToday) classes.push('fc-day-today-custom');
                if (isWeekend) classes.push('fc-day-weekend');

                return classes;
              }}
              eventDidMount={(info) => {
                // Add tooltip
                info.el.title = `${info.event.title}\nสถานะ: ${info.event.extendedProps.status}\nเหตุผล: ${info.event.extendedProps.reason || 'ไม่ได้ระบุ'}`;
              }}
            />
          </Paper>
        </Paper>

        {/* Event Details Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth='sm'
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              backdropFilter: 'blur(10px)',
            },
          }}
        >
          <DialogTitle sx={{pb: 1, fontWeight: 'bold', fontSize: '1.5rem'}}>📋 รายละเอียดการลา</DialogTitle>
          <DialogContent>
            {selectedEvent && (
              <Box sx={{pt: 1}}>
                <Typography variant='h6' sx={{mb: 2, fontWeight: 'bold'}}>
                  {selectedEvent.title}
                </Typography>

                <Box sx={{display: 'grid', gap: 1.5}}>
                  <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <span>👤</span>
                    <Typography>
                      <strong>ชื่อพนักงาน:</strong> {selectedEvent.staffName}
                    </Typography>
                  </Box>

                  <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <span>📝</span>
                    <Typography>
                      <strong>ประเภทการลา:</strong> {selectedEvent.leaveType}
                    </Typography>
                  </Box>

                  <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <span>📊</span>
                    <Typography>
                      <strong>สถานะ:</strong>
                      <Chip
                        label={selectedEvent.status}
                        size='small'
                        sx={{
                          ml: 1,
                          backgroundColor:
                            selectedEvent.status === 'Approved'
                              ? '#4caf50'
                              : selectedEvent.status === 'Denied'
                                ? '#f44336'
                                : '#ff9800',
                          color: 'white',
                        }}
                      />
                    </Typography>
                  </Box>

                  <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <span>⏰</span>
                    <Typography>
                      <strong>ช่วงเวลา:</strong> {selectedEvent.period}
                    </Typography>
                  </Box>

                  <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <span>📅</span>
                    <Typography>
                      <strong>วันที่:</strong>{' '}
                      {selectedEvent.allDay
                        ? `${new Date(selectedEvent.start).toLocaleDateString('th-TH')} - ${new Date(selectedEvent.end).toLocaleDateString('th-TH')}`
                        : new Date(selectedEvent.start).toLocaleDateString('th-TH')}
                    </Typography>
                  </Box>

                  <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1}}>
                    <span>💬</span>
                    <Typography>
                      <strong>เหตุผล:</strong> {selectedEvent.reason}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{p: 3}}>
            <Button
              onClick={handleCloseDialog}
              variant='contained'
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                '&:hover': {backgroundColor: 'rgba(255,255,255,0.3)'},
              }}
            >
              ปิด
            </Button>
          </DialogActions>
        </Dialog>

        {/* Date Selection Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
        >
          <Alert onClose={handleCloseSnackbar} severity='info' variant='filled' sx={{borderRadius: 2}}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </div>
  );
}
