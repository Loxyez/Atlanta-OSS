import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  Collapse,
  IconButton,
  Divider
} from '@mui/material';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { ExpandMore, ExpandLess, CalendarToday, EventNote } from '@mui/icons-material';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import axios from 'axios';
import config from '../../utils/config';
import { formatDateForAPI, getThaiDayName, isWeekend as isDateWeekend } from '../../utils/dateUtils';

export default function HolidayDialog({ 
  open, 
  onClose, 
  onSuccess, 
  onError, 
  editingHoliday = null,
  user
}) {
  // Form state
  const [holidayName, setHolidayName] = useState('');
  const [isHoliday, setIsHoliday] = useState(true);
  const [isWeekend, setIsWeekend] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // Date range state
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);

  // Custom static ranges in Thai
  const customStaticRanges = [
    {
      label: 'วันนี้',
      range: () => ({
        startDate: new Date(),
        endDate: new Date()
      }),
      isSelected(range) {
        const today = new Date();
        return range.startDate.toDateString() === today.toDateString() && 
               range.endDate.toDateString() === today.toDateString();
      }
    },
    {
      label: 'เมื่อวาน',
      range: () => ({
        startDate: addDays(new Date(), -1),
        endDate: addDays(new Date(), -1)
      }),
      isSelected(range) {
        const yesterday = addDays(new Date(), -1);
        return range.startDate.toDateString() === yesterday.toDateString() && 
               range.endDate.toDateString() === yesterday.toDateString();
      }
    },
    {
      label: 'สัปดาห์นี้',
      range: () => ({
        startDate: startOfWeek(new Date(), { weekStartsOn: 1 }),
        endDate: endOfWeek(new Date(), { weekStartsOn: 1 })
      }),
      isSelected(range) {
        const start = startOfWeek(new Date(), { weekStartsOn: 1 });
        const end = endOfWeek(new Date(), { weekStartsOn: 1 });
        return range.startDate.toDateString() === start.toDateString() && 
               range.endDate.toDateString() === end.toDateString();
      }
    },
    {
      label: 'สัปดาห์ที่แล้ว',
      range: () => ({
        startDate: startOfWeek(addDays(new Date(), -7), { weekStartsOn: 1 }),
        endDate: endOfWeek(addDays(new Date(), -7), { weekStartsOn: 1 })
      }),
      isSelected(range) {
        const start = startOfWeek(addDays(new Date(), -7), { weekStartsOn: 1 });
        const end = endOfWeek(addDays(new Date(), -7), { weekStartsOn: 1 });
        return range.startDate.toDateString() === start.toDateString() && 
               range.endDate.toDateString() === end.toDateString();
      }
    },
    {
      label: 'เดือนนี้',
      range: () => ({
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date())
      }),
      isSelected(range) {
        const start = startOfMonth(new Date());
        const end = endOfMonth(new Date());
        return range.startDate.toDateString() === start.toDateString() && 
               range.endDate.toDateString() === end.toDateString();
      }
    },
    {
      label: 'เดือนที่แล้ว',
      range: () => ({
        startDate: startOfMonth(addDays(new Date(), -30)),
        endDate: endOfMonth(addDays(new Date(), -30))
      }),
      isSelected(range) {
        const start = startOfMonth(addDays(new Date(), -30));
        const end = endOfMonth(addDays(new Date(), -30));
        return range.startDate.toDateString() === start.toDateString() && 
               range.endDate.toDateString() === end.toDateString();
      }
    },
    {
      label: 'ปีนี้',
      range: () => ({
        startDate: startOfYear(new Date()),
        endDate: endOfYear(new Date())
      }),
      isSelected(range) {
        const start = startOfYear(new Date());
        const end = endOfYear(new Date());
        return range.startDate.toDateString() === start.toDateString() && 
               range.endDate.toDateString() === end.toDateString();
      }
    }
  ];

  // Responsive handling
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load editing data
  useEffect(() => {
    if (editingHoliday && open) {
      setHolidayName(editingHoliday.holidayName || '');
      setIsHoliday(editingHoliday.extendedProps?.isHoliday ?? true);
      setIsWeekend(editingHoliday.extendedProps?.isWeekend ?? false);
      
      // Set date range from editing holiday
      const startDate = new Date(editingHoliday.start);
      const endDate = editingHoliday.end ? new Date(editingHoliday.end) : startDate;
      
      setDateRange([{
        startDate,
        endDate,
        key: 'selection'
      }]);
    } else {
      // Reset form for new holiday
      setHolidayName('');
      setIsHoliday(true);
      setIsWeekend(false);
      setDateRange([{
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection'
      }]);
    }
  }, [editingHoliday, open]);

  const handleDateRangeChange = (ranges) => {
    setDateRange([ranges.selection]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!holidayName.trim()) return;

    setSaving(true);
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const selectedRange = dateRange[0];

    try {
      if (editingHoliday) {
        // Update existing holiday
        const holidayId = editingHoliday.id.replace('holiday-', '');
        const editDate = selectedRange.startDate;
        const dayName = getThaiDayName(editDate);
        const isEditDateWeekend = isDateWeekend(editDate);

        const updateData = {
          // eslint-disable-next-line camelcase
          calendar_date: formatDateForAPI(editDate),
          // eslint-disable-next-line camelcase
          holiday_name: holidayName.trim(),
          // eslint-disable-next-line camelcase
          is_holiday: isHoliday,
          // eslint-disable-next-line camelcase
          is_weekend: isWeekend || isEditDateWeekend,
          // eslint-disable-next-line camelcase
          day_name: dayName,
          // eslint-disable-next-line camelcase
          start_date: formatDateForAPI(editDate),
          // eslint-disable-next-line camelcase
          end_date: formatDateForAPI(editDate),
        };

        const res = await axios.put(`${config.apiBaseUrl}/calendars/${holidayId}`, updateData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 200) {
          onSuccess('แก้ไขวันหยุดเรียบร้อยแล้ว!');
          onClose();
        } else {
          onError('ไม่สามารถแก้ไขวันหยุดได้: ' + res.data.message);
        }
      } else {
        // Create new holiday(s)
        const startDate = selectedRange.startDate;
        const endDate = selectedRange.endDate;

        if (startDate.toDateString() === endDate.toDateString()) {
          // Single day holiday
          const dayName = getThaiDayName(startDate);
          const isSelectedDateWeekend = isDateWeekend(startDate);

          const holidayRequest = {
            // eslint-disable-next-line camelcase
            calendar_date: formatDateForAPI(startDate),
            // eslint-disable-next-line camelcase
            day_name: dayName,
            // eslint-disable-next-line camelcase
            is_weekend: isSelectedDateWeekend || isWeekend,
            // eslint-disable-next-line camelcase
            is_holiday: isHoliday,
            // eslint-disable-next-line camelcase
            holiday_name: holidayName.trim(),
            // eslint-disable-next-line camelcase
            start_date: formatDateForAPI(startDate),
            // eslint-disable-next-line camelcase
            end_date: formatDateForAPI(startDate),
            // eslint-disable-next-line camelcase
            created_by: user?.staff_cardid || user?.name,
          };

          const res = await axios.post(`${config.apiBaseUrl}/calendars`, holidayRequest, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.status === 201) {
            onSuccess('เพิ่มวันหยุดเรียบร้อยแล้ว!');
          } else {
            onError('ไม่สามารถเพิ่มวันหยุดได้: ' + res.data.message);
            return;
          }
        } else {
          // Date range holiday
          const requests = [];
          const current = new Date(startDate);

          while (current <= endDate) {
            const dayName = getThaiDayName(current);
            const isCurrentDateWeekend = isDateWeekend(current);

            const holidayRequest = {
              // eslint-disable-next-line camelcase
              calendar_date: formatDateForAPI(current),
              // eslint-disable-next-line camelcase
              day_name: dayName,
              // eslint-disable-next-line camelcase
              is_weekend: isCurrentDateWeekend || isWeekend,
              // eslint-disable-next-line camelcase
              is_holiday: isHoliday,
              // eslint-disable-next-line camelcase
              holiday_name: holidayName.trim(),
              // eslint-disable-next-line camelcase
              start_date: formatDateForAPI(startDate),
              // eslint-disable-next-line camelcase
              end_date: formatDateForAPI(endDate),
              // eslint-disable-next-line camelcase
              created_by: user?.staff_cardid || user?.name,
            };

            requests.push(
              axios.post(`${config.apiBaseUrl}/calendars`, holidayRequest, {
                headers: { Authorization: `Bearer ${token}` },
              })
            );

            current.setDate(current.getDate() + 1);
          }

          await Promise.all(requests);
          onSuccess(`เพิ่มวันหยุดในช่วง ${format(startDate, 'dd/MM/yyyy')} ถึง ${format(endDate, 'dd/MM/yyyy')} เรียบร้อยแล้ว!`);
        }

        onClose();
      }
    } catch (error) {
      console.error('Error saving holiday:', error);
      onError('เกิดข้อผิดพลาดในการบันทึกวันหยุด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSaving(false);
    }
  };

  const selectedRange = dateRange[0];
  const isSingleDay = selectedRange.startDate.toDateString() === selectedRange.endDate.toDateString();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
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
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
          position: isMobile ? 'sticky' : 'relative',
          top: 0,
          zIndex: 1,
        }}
      >
        {editingHoliday ? '✏️ แก้ไขวันหยุด' : '🗓️ เพิ่มวันหยุดใหม่'}
      </DialogTitle>

      <DialogContent
        sx={{
          padding: { xs: 2, sm: 3 },
          maxHeight: isMobile ? 'calc(100vh - 160px)' : 'none',
          overflowY: 'auto',
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          {/* Holiday Name */}
          <Box sx={{ mb: 3 }}>
            <TextField
              label="🏷️ ชื่อวันหยุด"
              value={holidayName}
              onChange={(e) => setHolidayName(e.target.value)}
              fullWidth
              required
              variant="outlined"
              placeholder="เช่น วันปีใหม่, วันสงกรานต์"
              helperText="ระบุชื่อวันหยุดที่ต้องการเพิ่ม"
            />
          </Box>

          {/* Date Range Picker Section */}
          <Paper elevation={1} sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarToday />
                เลือกวันที่
              </Typography>
              <IconButton
                onClick={() => setShowDatePicker(!showDatePicker)}
                sx={{ color: '#1976d2' }}
              >
                {showDatePicker ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>

            <Collapse in={showDatePicker}>
              <Container maxWidth="md" sx={{ p: 0 }}>
                <DateRange
                  ranges={dateRange}
                  onChange={handleDateRangeChange}
                  showSelectionPreview={true}
                  moveRangeOnFirstSelection={false}
                  staticRanges={customStaticRanges}
                  inputRanges={[]}
                  direction={isMobile ? 'vertical' : 'horizontal'}
                  scroll={{ enabled: true }}
                  rangeColors={['#3d91ff']}
                  showDateDisplay={!isMobile}
                  showMonthAndYearPickers={true}
                />
              </Container>
            </Collapse>

            {/* Date Summary */}
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#e3f2fd', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#1976d2' }}>
                📅 วันที่ที่เลือก:
              </Typography>
              <Typography variant="body2">
                {isSingleDay 
                  ? `วันเดียว: ${format(selectedRange.startDate, 'dd/MM/yyyy')}`
                  : `ช่วงวันที่: ${format(selectedRange.startDate, 'dd/MM/yyyy')} - ${format(selectedRange.endDate, 'dd/MM/yyyy')}`
                }
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                {isSingleDay 
                  ? `จำนวน 1 วัน`
                  : `จำนวน ${Math.ceil((selectedRange.endDate - selectedRange.startDate) / (1000 * 60 * 60 * 24)) + 1} วัน`
                }
              </Typography>
            </Box>
          </Paper>

          {/* Holiday Options */}
          <Paper elevation={1} sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventNote />
              ตัวเลือกวันหยุด
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={isHoliday} 
                    onChange={(e) => setIsHoliday(e.target.checked)} 
                    color="primary" 
                  />
                }
                label="🎉 เป็นวันหยุดราชการ/บริษัท"
              />

              <FormControlLabel
                control={
                  <Checkbox 
                    checked={isWeekend} 
                    onChange={(e) => setIsWeekend(e.target.checked)} 
                    color="secondary" 
                  />
                }
                label="🏖️ เป็นวันหยุดสุดสัปดาห์"
              />
            </Box>
          </Paper>

          {/* Preview Section */}
          {holidayName && (
            <Paper elevation={1} sx={{ p: 2, backgroundColor: '#e8f5e8', borderLeft: '4px solid #4caf50' }}>
              <Typography variant="h6" sx={{ mb: 1, color: '#2e7d32', display: 'flex', alignItems: 'center', gap: 1 }}>
                👁️ ตัวอย่าง
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>ชื่อวันหยุด:</strong> {holidayName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>วันที่:</strong> {
                      isSingleDay 
                        ? format(selectedRange.startDate, 'dd/MM/yyyy')
                        : `${format(selectedRange.startDate, 'dd/MM/yyyy')} - ${format(selectedRange.endDate, 'dd/MM/yyyy')}`
                    }
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2">
                    <strong>ประเภท:</strong> {
                      [
                        isHoliday && '🎉 วันหยุดราชการ',
                        isWeekend && '🏖️ วันหยุดสุดสัปดาห์'
                      ].filter(Boolean).join(', ') || '📅 วันทำการปกติ'
                    }
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: { xs: 2, sm: 3 },
          gap: { xs: 1, sm: 1 },
          flexDirection: isMobile ? 'column' : 'row',
          position: isMobile ? 'sticky' : 'relative',
          bottom: 0,
          backgroundColor: '#f5f5f5',
        }}
      >
        <Button
          type="submit"
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!holidayName.trim() || saving}
          fullWidth={isMobile}
          sx={{
            borderRadius: 2,
            px: 3,
            fontSize: { xs: '0.875rem', sm: '1rem' },
            '&:hover': {
              transform: 'translateY(-1px)',
            },
          }}
        >
          {saving ? '🔄 กำลังบันทึก...' : '💾 บันทึกวันหยุด'}
        </Button>
        <Button
          onClick={onClose}
          variant="outlined"
          color="primary"
          fullWidth={isMobile}
          disabled={saving}
          sx={{
            borderRadius: 2,
            px: 3,
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          ❌ ยกเลิก
        </Button>
      </DialogActions>
    </Dialog>
  );
}
