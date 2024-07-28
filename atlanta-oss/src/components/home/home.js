import React from 'react';
import CustomNavbar from '../navigation-bar/navbar';

export default function Home () {
    return(
        <div>
            <CustomNavbar />
            <div className='container mt-5'>
                <h1 className='display-4 text-center'>Atlanta-OSS & PST-OSS</h1>
                <p className='lead'>ระบบการจัดการข้อมูลและส่งคำร้องขอ</p>
                <hr className='my-4'/>
                <ul>
                    <li>ขอสิทธิ์เข้าใช้ระบบ One Stop Service</li>
                    <li>ตรวจสอบสิทธ์วันลาต่างๆ</li>
                    <li>ส่งคำร้องขอวันลา</li>
                </ul>
            </div>
        </div>
    )
}