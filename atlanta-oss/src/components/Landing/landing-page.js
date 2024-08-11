import React from 'react';
import { Link } from 'react-router-dom';
import CustomNavbar from '../navigation-bar/navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './LandingPage.css'; // เพิ่มไฟล์ CSS

export default function LandingPage() {
    return (
        <div>
            <CustomNavbar />
            <div className="container-landing mt-5">
                <h1>Welcome to Atlanta-OSS Management</h1>
                <p>เลือกการดำเนินการที่ต้องการทำ:</p>
                <div className="row">
                    <div className="col-md-4">
                        <div className="card-landing mb-4">
                            <div className="card-body-landing">
                                <h5 className="card-title-landing">คำร้องขอเข้าใช้ระบบ</h5>
                                <p className="card-text-landing">ส่งคำร้องขอเพื่อเข้าใช้งานระบบของ OSS</p>
                                <Link to="/request-form" className="btn btn-primary">ส่งคำร้องขอ</Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card-landing mb-4">
                            <div className="card-body-landing">
                                <h5 className="card-title-landing">ตรวจสอบสถานะ</h5>
                                <p className="card-text-landing">ตรวจสอบสถานะคำร้องขอของคุณ</p>
                                <Link to="/status-check" className="btn btn-primary">ตรวจสอบสถานะ</Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card-landing mb-4">
                            <div className="card-body-landing">
                                <h5 className="card-title-landing">การตั้งค่า</h5>
                                <p className="card-text-landing">จัดการการตั้งค่าบัญชีและโปรไฟล์</p>
                                <Link to="/settings" className="btn btn-primary">ตั้งค่า</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
