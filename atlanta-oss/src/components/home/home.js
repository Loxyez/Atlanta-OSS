import React from 'react';
import { Link } from 'react-router-dom';

export default function Home () {
    return(
        <div>
            <h1>Welcome to Atlanta-OSS</h1>
            <nav>
                <ul>
                    <li>
                        <Link to="/request_form">ส่งแบบคำร้องขอใช้ระบบ</Link>
                    </li>
                </ul>
            </nav>
        </div>
    )
}