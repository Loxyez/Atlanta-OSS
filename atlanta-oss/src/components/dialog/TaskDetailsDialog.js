import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {HourglassBottom, Build, Done} from '@mui/icons-material';
import {format} from 'date-fns';

export default function TaskDetailsDialog({open, tasks = [], onClose}) {
  const groupTasksByStatus = (status) => {
    return tasks.filter((task) => task.task_status === status);
  };

  const openTasks = groupTasksByStatus('Open');
  const inProgressTasks = groupTasksByStatus('In Progress');
  const doneTasks = groupTasksByStatus('Completed');

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return format(date, 'dd/MM/yyyy HH:mm');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>รายระเอียดงาน</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography color='red' variant='h6'>
              <HourglassBottom /> รอดำเนินการ ({openTasks.length} รายการ)
            </Typography>
            <List>
              {openTasks.map((task) => (
                <ListItem key={task.taskID}>
                  <ListItemText
                    primary={task.task_detail}
                    secondary={`อัพเดตล่าสุด: ${formatDateTime(task.task_created_at)}`}
                  />
                </ListItem>
              ))}
              {openTasks.length === 0 && <Typography variant='body2'>ไม่มีงานคงค้างที่สถานะรอดำเนินงาน</Typography>}
            </List>
          </Grid>
          <Divider />
          <Grid item xs={12}>
            <Typography color='darkblue' variant='h6'>
              <Build /> กำลังดำเนินงาน ({inProgressTasks.length} รายการ)
            </Typography>
            <List>
              {inProgressTasks.map((task) => (
                <ListItem key={task.taskID}>
                  <ListItemText
                    primary={task.task_detail}
                    secondary={`อัพเดตล่าสุด: ${formatDateTime(task.task_created_at)}`}
                  />
                </ListItem>
              ))}
              {inProgressTasks.length === 0 && (
                <Typography variant='body2'>ไม่มีงานคงค้างที่สถานะระหว่างดำเดินงาน</Typography>
              )}
            </List>
          </Grid>
          <Divider />
          <Grid item xs={12}>
            <Typography color='green' variant='h6'>
              <Done /> เสร็จ/พร้อมส่งมอบ ({doneTasks.length} รายการ)
            </Typography>
            <List>
              {doneTasks.map((task) => (
                <ListItem key={task.taskID}>
                  <ListItemText
                    primary={task.task_detail}
                    secondary={`อัพเดตล่าสุด: ${formatDateTime(task.task_created_at)}`}
                  />
                </ListItem>
              ))}
              {doneTasks.length === 0 && (
                <Typography variant='body2'>ไม่มีงานคงค้างที่สถานะเสร็จหรือพร้อมส่งมอบ</Typography>
              )}
            </List>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='primary'>
          ปิด
        </Button>
      </DialogActions>
    </Dialog>
  );
}
