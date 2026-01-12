import {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import CustomNavbar from '../navigation-bar/navbar';
import {jwtDecode} from 'jwt-decode';
import config from '../../utils/config';
import {parseLocalDate, formatDateForAPI, getThaiDayName, isWeekend as isDateWeekend} from '../../utils/dateUtils';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './calendar.css';
import HolidayDialog from '../dialog/HolidayDialog';
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
  TextField,
  FormControlLabel,
  Checkbox,
  Collapse,
  IconButton,
} from '@mui/material';
import {DateRange, DefinedRange, createStaticRanges, defaultStaticRanges} from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import {FilterList, ExpandMore, ExpandLess} from '@mui/icons-material';
import SuccessModal from '../Modal/SuccessModal';
import ErrorModal from '../Modal/ErrorModel';
import {set} from 'date-fns';

export default function Calendar() {
  const [user, setUser] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [allEvents, setAllEvents] = useState(null); // Store all events for filtering
  const [selectedDate, setSelectedDate] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showCRUDLeaveCalendar, setShowCRUDLeaveCalendar] = useState(false);
  const [holidayDetails, setHolidayDetails] = useState([]);

  const [isWeekend, setIsWeekend] = useState(false);
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayName, setHolidayName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // New holiday dialog state
  const [showNewHolidayDialog, setShowNewHolidayDialog] = useState(false);
  const [isLoadingCalendarData, setIsLoadingCalendarData] = useState(false);

  // Date range picker state
  const [showDateRangeFilter, setShowDateRangeFilter] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const [isDateRangeActive, setIsDateRangeActive] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

    // Use the centralized refresh function for initial load
    refreshCalendarData();
  }, []);

  // Function to refresh calendar data after creating/updating holidays
  const refreshCalendarData = useCallback(async (retryCount = 0) => {
    // Prevent multiple simultaneous API calls
    if (isLoadingCalendarData) {
      console.log('Calendar data is already being loaded, skipping...');
      return;
    }

    setIsLoadingCalendarData(true);
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    try {
      console.log('Starting calendar data refresh...');
      
      // Fetch both holidays and leave requests in parallel
      const [holidaysRes, leaveRes] = await Promise.all([
        axios.get(`${config.apiBaseUrl}/calendars`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000 // 10 second timeout
        }),
        axios.get(`${config.apiBaseUrl}/leave_requests/all_leave_requests`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000 // 10 second timeout
        })
      ]);
      
      console.log('API responses received - Holidays:', holidaysRes.data);
      console.log('API responses received - Leave:', leaveRes.data);

      const allEvents = [];

      // Process holidays
      if (holidaysRes.data && Array.isArray(holidaysRes.data)) {
        const holidayEvents = holidaysRes.data.map((holiday) => ({
          id: `holiday-${holiday.id}`,
          title: `🎊 ${holiday.holiday_name}`,
          start: holiday.calendar_date.split('T')[0],
          allDay: true,
          backgroundColor: '#9c27b0',
          borderColor: '#7b1fa2',
          textColor: '#ffffff',
          extendedProps: {
            holidayName: holiday.holiday_name,
            isHoliday: holiday.is_holiday,
            isWeekend: holiday.is_weekend,
            dayName: holiday.day_name,
            eventType: 'holiday',
          },
        }));
        allEvents.push(...holidayEvents);
        console.log('Processed holiday events:', holidayEvents);
      } else {
        console.warn('No holiday data received or data is not an array:', holidaysRes.data);
      }

      // Process leave requests
      if (leaveRes.data && Array.isArray(leaveRes.data)) {
        const leaveEvents = leaveRes.data
          .map((req) => {
            // Determine event color based on status
            let color = '#099ce5'; // default
            if (req.status === 'Approved') color = '#4caf50';
            else if (req.status === 'Denied') color = '#f44336';
            else if (req.status === 'Pending') color = '#ff9800';

            const eventsForRequest = [];
            const startDateStr = req.start_date.split('T')[0];
            const endDateStr = req.end_date.split('T')[0];

            // Calculate the end date for FullCalendar
            const endDateParts = endDateStr.split('-');
            const calendarEndDate = new Date(endDateParts[0], endDateParts[1] - 1, parseInt(endDateParts[2]) + 1);
            const calendarEndDateStr = `${calendarEndDate.getFullYear()}-${String(calendarEndDate.getMonth() + 1).padStart(2, '0')}-${String(calendarEndDate.getDate()).padStart(2, '0')}`;

            const isMultiDay = startDateStr !== endDateStr;

            if (isMultiDay || req.leave_period === 'full-day' || req.leave_period === 'full') {
              eventsForRequest.push({
                id: `leave-${req.request_id}`,
                title: `${req.staff_name || req.staff_cardid} - ${req.leave_name || 'Leave'}`,
                start: startDateStr,
                end: calendarEndDateStr,
                allDay: true,
                backgroundColor: color,
                borderColor: color,
                extendedProps: {
                  staffName: req.staff_name || req.staff_cardid,
                  leaveType: req.leave_name,
                  reason: req.reason,
                  status: req.status,
                  leavePeriod: req.leave_period,
                  requestId: req.request_id,
                  eventType: 'leave',
                },
              });
            } else {
              // For half-day leave
              let startTime, endTime;
              if (req.leave_period === 'half-morning') {
                startTime = '09:00:00';
                endTime = '12:00:00';
              } else if (req.leave_period === 'half-afternoon') {
                startTime = '13:00:00';
                endTime = '17:00:00';
              } else {
                startTime = '09:00:00';
                endTime = '17:00:00';
              }

              eventsForRequest.push({
                id: `leave-${req.request_id}`,
                title: `${req.staff_name || req.staff_cardid} - ${req.leave_name || 'Leave'}`,
                start: `${startDateStr}T${startTime}`,
                end: `${startDateStr}T${endTime}`,
                allDay: false,
                backgroundColor: color,
                borderColor: color,
                extendedProps: {
                  staffName: req.staff_name || req.staff_cardid,
                  leaveType: req.leave_name,
                  reason: req.reason,
                  status: req.status,
                  leavePeriod: req.leave_period,
                  requestId: req.request_id,
                  eventType: 'leave',
                },
              });
            }

            return eventsForRequest;
          })
          .flat();
        allEvents.push(...leaveEvents);
        console.log('Processed leave events:', leaveEvents);
      } else {
        console.warn('No leave data received or data is not an array:', leaveRes.data);
      }

      console.log('Final combined events:', allEvents);

      // Update both state variables with the complete event list
      setAllEvents(allEvents);
      setEventDetails(allEvents);
      
      console.log('Calendar data refresh completed successfully');
      
    } catch (err) {
      console.error('Error refreshing calendar data:', err);
      
      // Retry mechanism for network errors
      if (retryCount < 2 && (err.code === 'NETWORK_ERROR' || err.message.includes('timeout'))) {
        console.log(`Retrying calendar data refresh... Attempt ${retryCount + 1}/3`);
        setTimeout(() => {
          refreshCalendarData(retryCount + 1);
        }, 1000 * (retryCount + 1)); // Exponential backoff
      } else {
        console.error('Failed to refresh calendar data after retries');
      }
    } finally {
      setIsLoadingCalendarData(false);
    }
  }, [isLoadingCalendarData]);

  const handleCRUDClose = () => {
    setShowCRUDLeaveCalendar(false);
    setEditingHoliday(null);
    setHolidayName('');
    setStartDate('');
    setEndDate('');
    setSelectedDate('');
    setIsHoliday(false);
    setIsWeekend(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    try {
      // If editing existing holiday
      if (editingHoliday) {
        const holidayId = editingHoliday.id.replace('holiday-', '');

        // Get the date being edited (use selectedDate if it's set, otherwise use the original date)
        const editDate = selectedDate || startDate || editingHoliday.start;
        const editDateObj = parseLocalDate(editDate);

        // Calculate day_name and is_weekend for the date being edited
        const dayName = getThaiDayName(editDateObj);
        const isEditDateWeekend = isDateWeekend(editDateObj);

        const updateData = {
          calendar_date: formatDateForAPI(editDate),
          holiday_name: holidayName,
          is_holiday: isHoliday,
          is_weekend: isWeekend || isEditDateWeekend, // Use checkbox value or auto-detected weekend
          day_name: dayName,
          start_date: formatDateForAPI(editDate),
          end_date: formatDateForAPI(editDate), // Single day holiday
        };

        const res = await axios.put(`${config.apiBaseUrl}/calendars/${holidayId}`, updateData, {
          headers: {Authorization: `Bearer ${token}`},
        });

        if (res.status === 200) {
          setSuccess('แก้ไขวันหยุดเรียบร้อยแล้ว!');
          setShowSuccessModal(true);
          setShowCRUDLeaveCalendar(false);
          setEditingHoliday(null);

          // Reset form
          setHolidayName('');
          setStartDate('');
          setEndDate('');
          setSelectedDate('');
          setIsHoliday(false);
          setIsWeekend(false);

          // Refresh calendar data instead of full page reload
          await refreshCalendarData();
          return;
        } else {
          setError('ไม่สามารถแก้ไขวันหยุดได้: ' + res.data.message);
          setShowErrorModal(true);
          return;
        }
      }

      // Original logic for creating new holidays
      // Get the day name for the selected date in Thai using utility function
      const calendarDayName = getThaiDayName(selectedDate);

      // Check if it's a weekend using utility function
      const isSelectedDateWeekend = isDateWeekend(selectedDate);

      // If date range is provided, create multiple calendar entries
      if (startDate && endDate) {
        const start = parseLocalDate(startDate);
        const end = parseLocalDate(endDate);
        const requests = [];

        // Generate all dates in the range
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
          const currentDate = new Date(date);
          const currentDayName = getThaiDayName(currentDate);
          const isCurrentDateWeekend = isDateWeekend(currentDate);

          const holidayRequest = {
            calendar_date: formatDateForAPI(currentDate),
            day_name: currentDayName,
            is_weekend: isCurrentDateWeekend,
            is_holiday: isHoliday,
            holiday_name: holidayName,
            start_date: formatDateForAPI(startDate),
            end_date: formatDateForAPI(endDate),
            created_by: user?.staff_cardid || user?.name,
          };

          requests.push(
            axios.post(`${config.apiBaseUrl}/calendars`, holidayRequest, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
          );
        }

        // Execute all requests
        await Promise.all(requests);
        setSuccess(`เพิ่มวันหยุดในช่วง ${startDate} ถึง ${endDate} เรียบร้อยแล้ว!`);
      } else if (selectedDate) {
        // Single date entry
        const holidayRequest = {
          calendar_date: formatDateForAPI(selectedDate),
          day_name: calendarDayName,
          is_weekend: isSelectedDateWeekend,
          is_holiday: isHoliday,
          holiday_name: holidayName,
          start_date: formatDateForAPI(selectedDate),
          end_date: formatDateForAPI(selectedDate),
          created_by: user?.staff_cardid || user?.name,
        };

        const res = await axios.post(`${config.apiBaseUrl}/calendars`, holidayRequest, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 201) {
          setSuccess('เพิ่มวันหยุดเรียบร้อยแล้ว!');
        } else {
          setError('ไม่สามารถเพิ่มวันหยุดได้: ' + res.data.message);
          setShowErrorModal(true);
          return;
        }
      } else {
        setError('กรุณาเลือกวันที่หรือช่วงวันที่');
        setShowErrorModal(true);
        return;
      }

      setShowSuccessModal(true);
      setShowCRUDLeaveCalendar(false);

      // Reset form
      setHolidayName('');
      setStartDate('');
      setEndDate('');
      setSelectedDate('');
      setIsHoliday(false);
      setIsWeekend(false);

      // Refresh calendar data to show new holiday
      await refreshCalendarData();
    } catch (error) {
      console.error('Error creating holiday request:', error);
      setError('Error creating holiday request: ' + (error.response?.data?.message || error.message));
      setShowErrorModal(true);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };

  // Custom static ranges for Thai locale
  const customStaticRanges = [
    {
      label: 'วันนี้',
      range: () => ({
        startDate: new Date(),
        endDate: new Date()
      }),
      isSelected(range) {
        const definedRange = this.range();
        return (
          range.startDate.toDateString() === definedRange.startDate.toDateString() &&
          range.endDate.toDateString() === definedRange.endDate.toDateString()
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
          range.startDate.toDateString() === definedRange.startDate.toDateString() &&
          range.endDate.toDateString() === definedRange.endDate.toDateString()
        );
      }
    },
    {
      label: 'สัปดาห์นี้',
      range: () => {
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        return {
          startDate: startOfWeek,
          endDate: endOfWeek
        };
      },
      isSelected(range) {
        const definedRange = this.range();
        return (
          range.startDate.toDateString() === definedRange.startDate.toDateString() &&
          range.endDate.toDateString() === definedRange.endDate.toDateString()
        );
      }
    },
    {
      label: 'สัปดาห์ที่แล้ว',
      range: () => {
        const now = new Date();
        const startOfLastWeek = new Date(now.setDate(now.getDate() - now.getDay() - 7));
        const endOfLastWeek = new Date(now.setDate(now.getDate() - now.getDay() - 1));
        return {
          startDate: startOfLastWeek,
          endDate: endOfLastWeek
        };
      },
      isSelected(range) {
        const definedRange = this.range();
        return (
          range.startDate.toDateString() === definedRange.startDate.toDateString() &&
          range.endDate.toDateString() === definedRange.endDate.toDateString()
        );
      }
    },
    {
      label: 'เดือนนี้',
      range: () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return {
          startDate: startOfMonth,
          endDate: endOfMonth
        };
      },
      isSelected(range) {
        const definedRange = this.range();
        return (
          range.startDate.toDateString() === definedRange.startDate.toDateString() &&
          range.endDate.toDateString() === definedRange.endDate.toDateString()
        );
      }
    },
    {
      label: 'เดือนที่แล้ว',
      range: () => {
        const now = new Date();
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        return {
          startDate: startOfLastMonth,
          endDate: endOfLastMonth
        };
      },
      isSelected(range) {
        const definedRange = this.range();
        return (
          range.startDate.toDateString() === definedRange.startDate.toDateString() &&
          range.endDate.toDateString() === definedRange.endDate.toDateString()
        );
      }
    }
  ];

  // Date range filtering functions
  const handleDateRangeChange = (ranges) => {
    setDateRange([ranges.selection]);
    if (isDateRangeActive) {
      filterEventsByDateRange(ranges.selection);
    }
  };

  const filterEventsByDateRange = (range) => {
    if (!allEvents || !range) return;

    const {startDate, endDate} = range;
    
    // If start date is after end date, don't filter
    if (startDate > endDate) {
      setEventDetails(allEvents);
      return;
    }

    const filteredEvents = allEvents.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = event.end ? new Date(event.end) : eventStart;
      
      // Check if event overlaps with selected date range
      return (eventStart <= endDate && eventEnd >= startDate);
    });

    setEventDetails(filteredEvents);
  };

  const toggleDateRangeFilter = () => {
    setShowDateRangeFilter(!showDateRangeFilter);
    if (!showDateRangeFilter) {
      // Reset to show all events when closing
      setIsDateRangeActive(false);
      setEventDetails(allEvents);
    }
  };

  const applyDateRangeFilter = () => {
    setIsDateRangeActive(true);
    filterEventsByDateRange(dateRange[0]);
  };

  const clearDateRangeFilter = () => {
    setIsDateRangeActive(false);
    setEventDetails(allEvents);
    setDateRange([{
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }]);
  };

  // FullCalendar event handlers
  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    const props = event.extendedProps;

    if (props.eventType === 'holiday') {
      // Handle holiday event
      setSelectedEvent({
        id: event.id, // Include the event ID for editing/deleting
        title: event.title,
        holidayName: props.holidayName,
        dayName: props.dayName,
        isHoliday: props.isHoliday,
        isWeekend: props.isWeekend,
        start: event.start,
        end: event.end,
        allDay: event.allDay,
        eventType: 'holiday',
      });
    } else {
      // Handle leave event
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
        eventType: 'leave',
      });
    }

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

  const handleEditHoliday = () => {
    if (selectedEvent) {
      // Store the selectedEvent with the id for editing
      setEditingHoliday({
        ...selectedEvent,
        id: selectedEvent.id || `holiday-${selectedEvent.holidayId}`, // Use stored ID or construct from holidayId
      });
      
      setDialogOpen(false);
      setShowNewHolidayDialog(true);
    }
  };

  const handleDeleteHoliday = () => {
    setHolidayToDelete(selectedEvent);
    setConfirmDeleteOpen(true);
  };

  const confirmDeleteHoliday = async () => {
    if (!holidayToDelete) return;

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    try {
      const holidayId = holidayToDelete.id.replace('holiday-', '');
      await axios.delete(`${config.apiBaseUrl}/calendars/${holidayId}`, {
        headers: {Authorization: `Bearer ${token}`},
      });

      setSuccess('ลบวันหยุดเรียบร้อยแล้ว');
      setShowSuccessModal(true);
      setConfirmDeleteOpen(false);
      setDialogOpen(false);
      setHolidayToDelete(null);

      // Refresh calendar data instead of full page reload
      await refreshCalendarData();
    } catch (error) {
      setError('ไม่สามารถลบวันหยุดได้ กรุณาลองใหม่อีกครั้ง');
      setShowErrorModal(true);
      setConfirmDeleteOpen(false);
    }
  };

  const cancelDeleteHoliday = () => {
    setConfirmDeleteOpen(false);
    setHolidayToDelete(null);
  };

  // New holiday dialog handlers
  const handleHolidaySuccess = async (message) => {
    setSuccess(message);
    setShowSuccessModal(true);
    setShowNewHolidayDialog(false);
    setEditingHoliday(null);
    // Refresh calendar data instead of full page reload
    await refreshCalendarData();
  };

  const handleHolidayError = (message) => {
    setError(message);
    setShowErrorModal(true);
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
      <Container
        maxWidth='lg'
        sx={{
          mt: {xs: 2, sm: 3, md: 4},
          mb: {xs: 2, sm: 3, md: 4},
          px: {xs: 1, sm: 2},
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: {xs: 2, sm: 3, md: 4},
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: 3,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: {xs: 'column', md: 'row'},
              justifyContent: 'space-between',
              alignItems: {xs: 'stretch', md: 'center'},
              mb: 3,
              gap: {xs: 2, md: 0},
            }}
          >
            <Typography
              variant='h4'
              gutterBottom
              sx={{
                fontWeight: 'bold',
                color: '#2c3e50',
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                fontSize: {xs: '1.5rem', sm: '2rem', md: '2.125rem'},
                textAlign: {xs: 'center', md: 'left'},
                mb: {xs: 1, md: 1},
              }}
            >
              📅 ปฏิทินวันลา / วันหยุด
            </Typography>

            <Box
              sx={{
                display: 'flex',
                gap: {xs: 0.5, sm: 1},
                flexWrap: 'wrap',
                justifyContent: {xs: 'center', md: 'flex-end'},
              }}
            >
              <Chip
                icon={<span>🟢</span>}
                label='อนุมัติ'
                variant='outlined'
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  color: '#4caf50',
                  borderColor: '#4caf50',
                  fontSize: {xs: '0.75rem', sm: '0.875rem'},
                }}
              />
              <Chip
                icon={<span>🟠</span>}
                label='รอดำเนินการ'
                variant='outlined'
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  color: '#ff9800',
                  borderColor: '#ff9800',
                  fontSize: {xs: '0.75rem', sm: '0.875rem'},
                }}
              />
              <Chip
                icon={<span>🔴</span>}
                label='ไม่อนุมัติ'
                variant='outlined'
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  color: '#f44336',
                  borderColor: '#f44336',
                  fontSize: {xs: '0.75rem', sm: '0.875rem'},
                }}
              />
              <Chip
                icon={<span>🎉</span>}
                label='วันหยุดราชการ'
                variant='outlined'
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  color: '#9c27b0',
                  borderColor: '#9c27b0',
                  fontSize: {xs: '0.75rem', sm: '0.875rem'},
                }}
              />
            </Box>
          </Box>

          {/* Date Range Filter Section */}
          <Box
            sx={{
              mb: 3,
              p: 2,
              backgroundColor: 'rgba(255,255,255,0.7)',
              borderRadius: 2,
              border: '1px solid #e0e0e0',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: {xs: 'column', sm: 'row'},
                alignItems: {xs: 'stretch', sm: 'center'},
                justifyContent: 'space-between',
                gap: 2,
                mb: showDateRangeFilter ? 2 : 0,
              }}
            >
              <Typography
                variant='h6'
                sx={{
                  color: '#2c3e50',
                  fontWeight: 'bold',
                  fontSize: {xs: '1rem', sm: '1.25rem'},
                }}
              >
                🗓️ กรองช่วงวันที่
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant={showDateRangeFilter ? 'contained' : 'outlined'}
                  onClick={toggleDateRangeFilter}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    borderRadius: 2,
                    minWidth: 'auto',
                    px: {xs: 2, sm: 3},
                  }}
                >
                  <FilterList sx={{ mr: 0.5, fontSize: {xs: '1rem', sm: '1.25rem'} }} />
                  {showDateRangeFilter ? 'ซ่อน' : 'เลือกช่วงวันที่'}
                </Button>
                
                {isDateRangeActive && (
                  <Button
                    variant='outlined'
                    color='secondary'
                    onClick={clearDateRangeFilter}
                    size={isMobile ? 'small' : 'medium'}
                    sx={{ borderRadius: 2 }}
                  >
                    ล้างตัวกรอง
                  </Button>
                )}
              </Box>
            </Box>

            <Collapse in={showDateRangeFilter}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Paper
                  elevation={2}
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: {xs: 'column', md: 'row'},
                    '& .rdrCalendarWrapper': {
                      fontSize: {xs: '0.8rem', sm: '1rem'},
                      color: '#2c3e50 !important',
                    },
                    '& .rdrDefinedRangesWrapper': {
                      border: 'none !important',
                      borderRight: {xs: 'none', md: '1px solid #e0e0e0 !important'},
                      borderBottom: {xs: '1px solid #e0e0e0 !important', md: 'none'},
                      width: {xs: '100%', md: '200px'},
                      backgroundColor: '#f8f9fa !important',
                    },
                    '& .rdrStaticRange': {
                      padding: '8px 12px !important',
                      borderBottom: '1px solid #e0e0e0 !important',
                      '&:hover': {
                        backgroundColor: '#e3f2fd !important',
                      },
                    },
                    '& .rdrStaticRangeSelected': {
                      backgroundColor: '#1976d2 !important',
                      color: '#fff !important',
                    },
                    '& .rdrCalendarWrapper .rdrMonth': {
                      margin: '0 !important',
                    },
                    '& .rdrDateRangeWrapper': {
                      '& .rdrDateInput': {
                        backgroundColor: '#f5f5f5',
                      },
                    },
                  }}
                >
                  <Box sx={{ width: '100%', display: 'flex', flexDirection: {xs: 'column', md: 'row'} }}>
                    <DateRange
                      ranges={dateRange}
                      onChange={handleDateRangeChange}
                      months={isMobile ? 1 : 2}
                      direction={isMobile ? 'vertical' : 'horizontal'}
                      showSelectionPreview={true}
                      moveRangeOnFirstSelection={false}
                      editableDateInputs={true}
                      showDateDisplay={false}
                    />
                  </Box>
                </Paper>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={applyDateRangeFilter}
                    size={isMobile ? 'small' : 'medium'}
                    sx={{ borderRadius: 2 }}
                    disabled={
                      !dateRange[0].startDate || 
                      !dateRange[0].endDate || 
                      dateRange[0].startDate.toDateString() === dateRange[0].endDate.toDateString()
                    }
                  >
                    ใช้ตัวกรอง
                  </Button>
                  
                  {isDateRangeActive && (
                    <Button
                      variant='outlined'
                      color='secondary'
                      onClick={clearDateRangeFilter}
                      size={isMobile ? 'small' : 'medium'}
                      sx={{ borderRadius: 2 }}
                    >
                      ล้างตัวกรอง
                    </Button>
                  )}
                  
                  {isDateRangeActive && dateRange[0].startDate && dateRange[0].endDate && (
                    <Chip
                      label={
                        `${dateRange[0].startDate.toLocaleDateString('th-TH')} - ` +
                        `${dateRange[0].endDate.toLocaleDateString('th-TH')}`
                      }
                      color='primary'
                      variant='outlined'
                      sx={{ 
                        fontSize: {xs: '0.75rem', sm: '0.875rem'},
                        maxWidth: {xs: '250px', sm: 'none'},
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Collapse>
          </Box>

          {user && ['Manager', 'operator', 'Developer'].includes(user.role) && (
            <Button
              variant='contained'
              color='primary'
              sx={{
                mb: 3,
                borderRadius: 2,
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                fontSize: {xs: '0.875rem', sm: '1rem'},
                padding: {xs: '8px 16px', sm: '10px 22px'},
                width: {xs: '100%', sm: 'auto'},
                '&:hover': {
                  boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                  transform: 'translateY(-1px)',
                },
              }}
              onClick={() => setShowNewHolidayDialog(true)}
            >
              ➕ เพิ่ม / แก้ไข วันหยุด
            </Button>
          )}

          <Paper
            elevation={2}
            sx={{
              p: {xs: 1, sm: 2},
              borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              overflow: 'hidden', // Prevent horizontal scroll
            }}
            className='calendar-glow'
          >
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={isMobile ? 'dayGridMonth' : 'dayGridMonth'}
              locale={thaiLocale}
              headerToolbar={{
                left: isMobile ? 'prev,next' : 'prev,next today',
                center: 'title',
                right: isMobile ? '' : 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              events={eventDetails}
              eventClick={handleEventClick}
              dateClick={handleDateClick}
              selectable={true}
              selectMirror={true}
              height='auto'
              contentHeight={isMobile ? 400 : 'auto'}
              firstDay={1}
              eventDisplay='block'
              dayMaxEvents={isMobile ? 2 : 3}
              moreLinkClick='popover'
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }}
              dayHeaderFormat={isMobile ? {weekday: 'narrow'} : {weekday: 'short'}}
              titleFormat={{year: 'numeric', month: isMobile ? 'short' : 'long'}}
              aspectRatio={isMobile ? 1.0 : 1.35}
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

                // Mobile-specific event styling
                if (isMobile) {
                  info.el.style.fontSize = '0.75rem';
                  info.el.style.padding = '1px 2px';
                }
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
          fullScreen={isMobile}
          PaperProps={{
            sx: {
              borderRadius: isMobile ? 0 : 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              backdropFilter: 'blur(10px)',
              margin: isMobile ? 0 : 1,
              maxHeight: isMobile ? '100vh' : '90vh',
            },
          }}
        >
          <DialogTitle
            sx={{
              pb: 1,
              fontWeight: 'bold',
              fontSize: {xs: '1.25rem', sm: '1.5rem'},
              position: isMobile ? 'sticky' : 'relative',
              top: 0,
              zIndex: 1,
              backgroundColor: 'rgba(0,0,0,0.1)',
            }}
          >
            {selectedEvent?.eventType === 'holiday' ? '🎉 รายละเอียดวันหยุด' : '📋 รายละเอียดการลา'}
          </DialogTitle>
          <DialogContent
            sx={{
              padding: {xs: 2, sm: 3},
              maxHeight: isMobile ? 'calc(100vh - 140px)' : 'none',
              overflowY: 'auto',
            }}
          >
            {selectedEvent && (
              <Box sx={{pt: 1}}>
                <Typography
                  variant='h6'
                  sx={{
                    mb: 2,
                    fontWeight: 'bold',
                    fontSize: {xs: '1.1rem', sm: '1.25rem'},
                    lineHeight: 1.2,
                  }}
                >
                  {selectedEvent.title}
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gap: {xs: 1, sm: 1.5},
                    fontSize: {xs: '0.875rem', sm: '1rem'},
                  }}
                >
                  {selectedEvent.eventType === 'holiday' ? (
                    // Holiday event details
                    <>
                      <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        <span>🎊</span>
                        <Typography>
                          <strong>ชื่อวันหยุด:</strong> {selectedEvent.holidayName}
                        </Typography>
                      </Box>

                      <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        <span>📅</span>
                        <Typography>
                          <strong>วันที่:</strong> {new Date(selectedEvent.start).toLocaleDateString('th-TH')}
                        </Typography>
                      </Box>

                      <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        <span>📝</span>
                        <Typography>
                          <strong>วัน:</strong> {selectedEvent.dayName}
                        </Typography>
                      </Box>

                      <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        <span>🏷️</span>
                        <Typography>
                          <strong>ประเภท:</strong>
                          {selectedEvent.isHoliday && (
                            <Chip
                              label='วันหยุดราชการ'
                              size='small'
                              sx={{
                                ml: 1,
                                backgroundColor: '#9c27b0',
                                color: 'white',
                              }}
                            />
                          )}
                          {selectedEvent.isWeekend && (
                            <Chip
                              label='วันหยุดสุดสัปดาห์'
                              size='small'
                              sx={{
                                ml: 1,
                                backgroundColor: '#ff5722',
                                color: 'white',
                              }}
                            />
                          )}
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    // Leave event details
                    <>
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
                    </>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions
            sx={{
              p: {xs: 2, sm: 3},
              flexDirection: isMobile ? 'column' : 'row',
              gap: {xs: 1, sm: 0},
              position: isMobile ? 'sticky' : 'relative',
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.1)',
            }}
          >
            {/* Edit and Delete buttons for holidays (Manager, Developer, Operator only) */}
            {selectedEvent?.eventType === 'holiday' &&
              user &&
              ['Manager', 'operator', 'Developer'].includes(user.role) && (
                <>
                  <Button
                    onClick={handleEditHoliday}
                    variant='contained'
                    fullWidth={isMobile}
                    sx={{
                      backgroundColor: '#2196f3',
                      color: 'white',
                      mr: isMobile ? 0 : 1,
                      fontSize: {xs: '0.875rem', sm: '1rem'},
                      '&:hover': {backgroundColor: '#1976d2'},
                    }}
                  >
                    ✏️ แก้ไข
                  </Button>
                  <Button
                    onClick={handleDeleteHoliday}
                    variant='contained'
                    fullWidth={isMobile}
                    sx={{
                      backgroundColor: '#f44336',
                      color: 'white',
                      mr: isMobile ? 0 : 1,
                      fontSize: {xs: '0.875rem', sm: '1rem'},
                      '&:hover': {backgroundColor: '#d32f2f'},
                    }}
                  >
                    🗑️ ลบ
                  </Button>
                </>
              )}
            <Button
              onClick={handleCloseDialog}
              variant='contained'
              fullWidth={isMobile}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                fontSize: {xs: '0.875rem', sm: '1rem'},
                '&:hover': {backgroundColor: 'rgba(255,255,255,0.3)'},
              }}
            >
              ปิด
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={confirmDeleteOpen}
          onClose={cancelDeleteHoliday}
          maxWidth='sm'
          fullWidth
          fullScreen={isMobile}
          PaperProps={{
            sx: {
              borderRadius: isMobile ? 0 : 3,
              background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              color: 'white',
              margin: isMobile ? 0 : 1,
            },
          }}
        >
          <DialogTitle
            sx={{
              pb: 1,
              fontWeight: 'bold',
              fontSize: {xs: '1.25rem', sm: '1.5rem'},
              textAlign: 'center',
            }}
          >
            🗑️ ยืนยันการลบวันหยุด
          </DialogTitle>
          <DialogContent
            sx={{
              padding: {xs: 2, sm: 3},
              textAlign: 'center',
            }}
          >
            <Typography
              variant='body1'
              sx={{
                mb: 2,
                fontSize: {xs: '1rem', sm: '1.125rem'},
              }}
            >
              คุณแน่ใจหรือไม่ที่ต้องการลบวันหยุด "{holidayToDelete?.holidayName}"?
            </Typography>
            <Typography
              variant='body2'
              sx={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: {xs: '0.875rem', sm: '1rem'},
              }}
            >
              การดำเนินการนี้ไม่สามารถยกเลิกได้
            </Typography>
          </DialogContent>
          <DialogActions
            sx={{
              p: {xs: 2, sm: 3},
              flexDirection: isMobile ? 'column' : 'row',
              gap: {xs: 1, sm: 0},
            }}
          >
            <Button
              onClick={cancelDeleteHoliday}
              variant='contained'
              fullWidth={isMobile}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontSize: {xs: '0.875rem', sm: '1rem'},
                '&:hover': {backgroundColor: 'rgba(255,255,255,0.3)'},
              }}
            >
              ยกเลิก
            </Button>
            <Button
              onClick={confirmDeleteHoliday}
              variant='contained'
              fullWidth={isMobile}
              sx={{
                backgroundColor: '#d32f2f',
                color: 'white',
                fontSize: {xs: '0.875rem', sm: '1rem'},
                '&:hover': {backgroundColor: '#b71c1c'},
              }}
            >
              ลบ
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

      <Dialog
        open={showCRUDLeaveCalendar}
        onClose={handleCRUDClose}
        maxWidth='md'
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            margin: isMobile ? 0 : 1,
            maxHeight: isMobile ? '100vh' : '95vh',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: {xs: '1.25rem', sm: '1.5rem'},
            position: isMobile ? 'sticky' : 'relative',
            top: 0,
            zIndex: 1,
          }}
        >
          {editingHoliday ? '✏️ แก้ไขวันหยุด' : '🗓️ จัดการวันหยุด / เพิ่มวันหยุด'}
        </DialogTitle>
        <DialogContent
          sx={{
            mt: 2,
            padding: {xs: 2, sm: 3},
            maxHeight: isMobile ? 'calc(100vh - 160px)' : 'none',
            overflowY: 'auto',
          }}
        >
          <Typography
            variant='body1'
            sx={{
              mb: 3,
              fontSize: {xs: '0.875rem', sm: '1rem'},
            }}
          >
            คุณสามารถ:
            <ul style={{paddingLeft: '20px', margin: '8px 0'}}>
              <li>เพิ่มวันหยุดวันเดียว (เลือกวันที่เดียว)</li>
              <li>เพิ่มวันหยุดช่วงวันที่ (เลือกวันเริ่มต้นและสิ้นสุด)</li>
              <li>ระบุชื่อวันหยุดและประเภท</li>
            </ul>
          </Typography>

          <Box
            component='form'
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: {xs: 2, sm: 3},
            }}
          >
            {/* Holiday Name */}
            <TextField
              label='🏷️ ชื่อวันหยุด'
              value={holidayName}
              onChange={(e) => setHolidayName(e.target.value)}
              fullWidth
              required
              variant='outlined'
              placeholder='เช่น วันปีใหม่, วันสงกรานต์'
              helperText='ระบุชื่อวันหยุดที่ต้องการเพิ่ม'
            />

            {/* Date Selection Section */}
            <Box
              sx={{
                p: 2,
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                backgroundColor: '#f8f9fa',
              }}
            >
              <Typography variant='h6' sx={{mb: 2, color: '#1976d2'}}>
                📅 เลือกวันที่
              </Typography>

              <Typography variant='body2' sx={{mb: 2, color: '#666'}}>
                เลือกวิธีการกำหนดวันหยุด:
              </Typography>

              {/* Single Date */}
              <Box sx={{mb: 2}}>
                <Typography variant='subtitle2' sx={{mb: 1, fontWeight: 'bold'}}>
                  📍 วันหยุดวันเดียว
                </Typography>
                <TextField
                  label='วันที่'
                  type='date'
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    // Clear date range when single date is selected
                    if (e.target.value) {
                      setStartDate('');
                      setEndDate('');
                    }
                  }}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  helperText='เลือกวันที่เดียวสำหรับวันหยุด'
                />
              </Box>

              <Typography variant='body2' sx={{textAlign: 'center', my: 1, color: '#999'}}>
                หรือ
              </Typography>

              {/* Date Range */}
              <Box>
                <Typography variant='subtitle2' sx={{mb: 1, fontWeight: 'bold'}}>
                  📊 วันหยุดช่วงวันที่
                </Typography>
                <Box sx={{display: 'flex', gap: 2, flexDirection: {xs: 'column', sm: 'row'}}}>
                  <TextField
                    label='📅 วันที่เริ่มต้น'
                    type='date'
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      // Clear single date when range is selected
                      if (e.target.value) {
                        setSelectedDate('');
                      }
                    }}
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    helperText='วันแรกของช่วงวันหยุด'
                  />
                  <TextField
                    label='📅 วันที่สิ้นสุด'
                    type='date'
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    fullWidth
                    inputProps={{
                      min: startDate, // Prevent end date before start date
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    helperText='วันสุดท้ายของช่วงวันหยุด'
                    disabled={!startDate}
                  />
                </Box>
              </Box>
            </Box>

            {/* Holiday Options */}
            <Box
              sx={{
                p: 2,
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                backgroundColor: '#f8f9fa',
              }}
            >
              <Typography variant='h6' sx={{mb: 2, color: '#1976d2'}}>
                ⚙️ ตัวเลือกวันหยุด
              </Typography>

              <FormControlLabel
                control={
                  <Checkbox checked={isHoliday} onChange={(e) => setIsHoliday(e.target.checked)} color='primary' />
                }
                label='🎉 เป็นวันหยุดราชการ/บริษัท'
              />

              <FormControlLabel
                control={
                  <Checkbox checked={isWeekend} onChange={(e) => setIsWeekend(e.target.checked)} color='secondary' />
                }
                label='🏖️ เป็นวันหยุดสุดสัปดาห์'
              />
            </Box>

            {/* Preview Section */}
            {(selectedDate || (startDate && endDate)) && (
              <Box
                sx={{
                  p: 2,
                  backgroundColor: '#e3f2fd',
                  borderRadius: 2,
                  border: '1px solid #2196f3',
                }}
              >
                <Typography variant='h6' sx={{mb: 1, color: '#1976d2'}}>
                  👁️ ตัวอย่าง
                </Typography>
                <Typography variant='body2'>
                  <strong>ชื่อวันหยุด:</strong> {holidayName || 'ยังไม่ได้ระบุ'}
                </Typography>
                <Typography variant='body2'>
                  <strong>วันที่:</strong>{' '}
                  {selectedDate
                    ? new Date(selectedDate).toLocaleDateString('th-TH')
                    : startDate && endDate
                      ? `${new Date(startDate).toLocaleDateString('th-TH')} - ${new Date(endDate).toLocaleDateString('th-TH')}`
                      : 'ยังไม่ได้เลือก'}
                </Typography>
                <Typography variant='body2'>
                  <strong>ประเภท:</strong> {isHoliday ? '🎉 วันหยุดราชการ' : ''}{' '}
                  {isWeekend ? '🏖️ วันหยุดสุดสัปดาห์' : ''} {!isHoliday && !isWeekend ? '📅 วันทำการปกติ' : ''}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            p: {xs: 2, sm: 3},
            gap: {xs: 1, sm: 1},
            flexDirection: isMobile ? 'column' : 'row',
            position: isMobile ? 'sticky' : 'relative',
            bottom: 0,
            backgroundColor: '#f5f5f5',
          }}
        >
          <Button
            type='submit'
            variant='contained'
            color='primary'
            onClick={handleSubmit}
            disabled={!holidayName || (!selectedDate && !(startDate && endDate))}
            fullWidth={isMobile}
            sx={{
              borderRadius: 2,
              px: 3,
              fontSize: {xs: '0.875rem', sm: '1rem'},
              '&:hover': {
                transform: 'translateY(-1px)',
              },
            }}
          >
            💾 บันทึกวันหยุด
          </Button>
          <Button
            onClick={handleCRUDClose}
            variant='outlined'
            color='primary'
            fullWidth={isMobile}
            sx={{
              borderRadius: 2,
              px: 3,
              fontSize: {xs: '0.875rem', sm: '1rem'},
            }}
          >
            ❌ ยกเลิก
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Holiday Dialog with Date Range Picker */}
      <HolidayDialog
        open={showNewHolidayDialog}
        onClose={() => {
          setShowNewHolidayDialog(false);
          setEditingHoliday(null);
        }}
        onSuccess={handleHolidaySuccess}
        onError={handleHolidayError}
        editingHoliday={editingHoliday}
        user={user}
      />

      <SuccessModal show={showSuccessModal} handleClose={handleCloseSuccessModal} message={success} />
      <ErrorModal show={showErrorModal} handleClose={handleCloseErrorModal} message={error} />
    </div>
  );
}
