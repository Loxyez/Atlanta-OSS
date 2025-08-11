import React, {memo} from 'react';
import {Page, Text, View, Document, Image, StyleSheet, Font} from '@react-pdf/renderer';

import THSarabunNew from './TH Sarabun PSK V-1/THSarabun.ttf'; // Update the path to your Thai font
import THSarabunNewBold from './TH Sarabun PSK V-1/THSarabun Bold.ttf'; // Update the path to your Thai font

Font.register({
  family: 'THSarabunNew',
  fonts: [{src: THSarabunNew}, {src: THSarabunNewBold, fontWeight: 'bold'}],
});

const styles = StyleSheet.create({
  // =================HEADER=================
  page: {
    fontFamily: 'THSarabunNew',
    fontSize: 13,
    padding: 20,
    lineHeight: 1.25,
    flexDirection: 'column',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Align elements to the left and right
    alignItems: 'flex-start',
    marginBottom: 2.5, // Add some bottom margin for spacing
  },

  empty_5: {
    width: '5%', // Adjusted width for better alignment
    textAlign: 'center',
  },

  // Left Side
  left_section: {
    flexDirection: 'row', // Ensure logo and receipt type are aligned horizontally
    alignItems: 'center', // Align items vertically
  },

  logo_left_first: {
    width: '25%', // Adjusted width for better alignment
    textAlign: 'center',
    fontWeight: 'bold',
    paddingLeft: 5,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
  },

  logo_left: {
    width: '30%', // Adjusted width for better alignment
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: 12,
  },

  receipt_type_left: {
    width: '10%', // Adjusted width for better alignment
    textAlign: 'left',
    fontWeight: 'bold',
  },

  date_left: {
    width: '40%', // Adjusted width for better alignment
    textAlign: 'right',
    fontWeight: 'bold',
  },

  // Right Side

  right_section: {
    flexDirection: 'row', // Ensure logo and receipt type are aligned horizontally
    alignItems: 'center', // Align items vertically
  },

  logo_right_first: {
    width: '25%', // Adjusted width for better alignment
    textAlign: 'center',
    fontWeight: 'bold',
    paddingLeft: 5,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
  },

  logo_right: {
    width: '30%', // Adjusted width for better alignment
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: 12,
  },

  receipt_type_right: {
    width: '10%', // Adjusted width for better alignment
    textAlign: 'center',
    fontWeight: 'bold',
  },

  date_right: {
    width: '40%', // Adjusted width for better alignment
    textAlign: 'right',
    fontWeight: 'bold',
  },

  // Empty space for center alignment
  empty_center: {
    width: '10%', // Adjusted width for center alignment
    textAlign: 'center',
  },
  // =================HEADER=================

  // =================Detail=================
  labels: {
    width: '30%', // Adjusted width for better alignment
    textAlign: 'left',
    fontWeight: 'bold',
  },

  detials: {
    width: '70%', // Adjusted width for better alignment
    textAlign: 'left',
    fontWeight: 'bold',
  },
  engineer: {
    width: '70%', // Adjusted width for better alignment
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12,
  },
  // =================Detail=================

  // =================Noti=================
  noti: {
    width: '45%', // Adjusted width for better alignment
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: 9,
  },
  // =================Noti=================

  // New style for the line
  line: {
    borderBottom: 1, // Border bottom with thickness 1
    borderColor: 'black', // Border color black
    width: '100%', // Full width
    marginBottom: 10, // Margin bottom for separation
  },
});

const RepairReceiptPdf = ({data, member, staff}) => {
  const moment = require('moment');
  const parsedDate = moment(data.task_created_at);
  const formattedDate = parsedDate.format('DD/MM/YYYY');

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo_left_first}>P.S.T.Computer</Text>
          <Text style={styles.empty_5}></Text>
          <Text style={styles.receipt_type_left}>ใบรับซ่อม</Text>
          <Text style={styles.empty}></Text>
          <Text style={styles.date_left}>วันที่ {formattedDate}</Text>

          <Text style={styles.empty_center}>|</Text>

          <Text style={styles.logo_right_first}>P.S.T.Computer</Text>
          <Text style={styles.empty_5}></Text>
          <Text style={styles.receipt_type_right}>ใบรับสินค้า</Text>
          <Text style={styles.empty}></Text>
          <Text style={styles.date_right}>วันที่ {formattedDate}</Text>
        </View>

        {/* Name Customer */}
        <View style={styles.header}>
          <Text style={styles.logo_left}>ชื่อ: {member.member_name}</Text>
          <Text style={styles.receipt_type_left}></Text>
          <Text style={styles.empty}></Text>
          <Text style={styles.date_left}></Text>

          <Text style={styles.empty_center}>|</Text>

          <Text style={styles.logo_right}>ชื่อ: {member.member_name}</Text>
          <Text style={styles.receipt_type_right}>รายการเสนอซ่อม</Text>
          <Text style={styles.empty}></Text>
          <Text style={styles.date_right}></Text>
        </View>

        {/* Tel Customer */}
        <View style={styles.header}>
          <Text style={styles.logo_left}>โทร: {member.member_phone}</Text>
          <Text style={styles.receipt_type_left}></Text>
          <Text style={styles.empty}></Text>
          <Text style={styles.date_left}></Text>

          <Text style={styles.empty_center}>|</Text>

          <Text style={styles.logo_right}>โทร: {member.member_phone}</Text>
          <Text style={styles.receipt_type_right}>1..............................................................</Text>
          <Text style={styles.empty}></Text>
          <Text style={styles.date_right}></Text>
        </View>

        {/* Series Type Customer */}
        <View style={styles.header}>
          <Text style={styles.logo_left}>
            รุ่น: {data.task_device_category}:{data.task_device_model}
          </Text>
          <Text style={styles.receipt_type_left}></Text>
          <Text style={styles.empty}></Text>
          <Text style={styles.date_left}></Text>

          <Text style={styles.empty_center}>|</Text>

          <Text style={styles.logo_right}>
            รุ่น: {data.task_device_category}:{data.task_device_model}
          </Text>
          <Text style={styles.receipt_type_right}>2..............................................................</Text>
          <Text style={styles.empty}></Text>
          <Text style={styles.date_right}></Text>
        </View>

        {/* Series Type Customer */}
        <View style={styles.header}>
          <Text style={styles.detials}>อาการที่พบเจอ:</Text>

          <Text style={styles.empty_center}>|</Text>

          <Text style={styles.detials}>
            อาการที่พบเจอ: 3...........................................................
          </Text>
        </View>

        {/* Detail */}
        <View style={styles.header}>
          <Text style={styles.detials}>- {data.task_device_detail}</Text>

          <Text style={styles.empty_center}>|</Text>

          <Text style={styles.detials}>- {data.task_fix_detail}</Text>
        </View>

        {/* Series Type Customer */}
        <View style={styles.header}>
          <Text style={styles.detials}>อุปกรณ์ที่นำมา:</Text>

          <Text style={styles.empty_center}>|</Text>

          <Text style={styles.detials}>อุปกรณ์ที่นำมา:</Text>
        </View>

        {/* Details */}
        <View style={styles.header}>
          <Text style={styles.detials}>
            - {data.task_device_category}:{data.task_device_model}
          </Text>

          <Text style={styles.empty_center}>|</Text>

          <Text style={styles.detials}>
            - {data.task_device_category}:{data.task_device_model}
          </Text>
        </View>

        {/* Signature */}
        <View style={styles.header}>
          <Text style={styles.logo_left}>ผู้รับเครื่อง: {staff.staff_name}</Text>
          <Text style={styles.engineer}>ช่างผู้ตรวจซ่อม: {staff.staff_name}</Text>

          <Text style={styles.empty_center}>|</Text>

          <Text style={styles.logo_right}>ผู้รับเครื่อง: {staff.staff_name}</Text>
          <Text style={styles.engineer}>ช่างผู้ตรวจซ่อม: {staff.staff_name}</Text>
        </View>

        {/* Signature */}
        <View style={styles.header}>
          <Text style={styles.noti}>
            - ติดต่อชอรับสินค้าภายใน 30 วันมิฉะนั้นทางร้านจะไม่รับผิดชอบต่อความเสียหายที่เกิดขึ้น{'\n'}-
            กรุณาเก็บใบรับซ่อมไว้เป็นหลักฐาน ในการมารับทุกครั้ง{'\n'}- กรุณาสำรองงานก่อนนำเรื่องเข้ารับการซ่อม
            หากเกิดการสูญหายทางร้านจะไม่รับผิดชอบทุกกรณี
          </Text>

          <Text style={styles.empty_center}>|</Text>

          <Text style={styles.noti}></Text>
        </View>

        {/* Signature */}
        <View style={styles.header}>
          <Text style={styles.logo_left}></Text>
          <Text style={styles.engineer}></Text>

          <Text style={styles.empty_center}>|</Text>

          <Text style={styles.logo_right}></Text>
          <Text style={styles.engineer}></Text>
        </View>

        {/* Signature */}
        <View style={styles.header}>
          <Text style={styles.logo_left}>ผู้ส่งซ่อม:..............................................</Text>
          <Text style={styles.engineer}></Text>

          <Text style={styles.empty_center}>|</Text>

          <Text style={styles.logo_right}>ผู้ส่งซ่อม:..............................................</Text>
          <Text style={styles.engineer}></Text>
        </View>

        {/* End row */}
        <View style={styles.line} />
        <View style={{marginVertical: 5}} />
      </Page>
    </Document>
  );
};

export default RepairReceiptPdf;
