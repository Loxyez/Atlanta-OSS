import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function RequestForm () {
    const [requests, setRequest] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('http://localhost:3001/requests_form');
                console.log('Data fetched:', res.data);
                setRequest(res.data);
            } catch (error) {
                console.error('Error fetching the workers data', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <h1>รายชื่อคำร้องขอ</h1>
            <ul>
                {requests.map((req_list) => (
                    <li key={req_list.mid}>
                        {req_list.uid} - {req_list.email} - {req_list.tel} - {req_list.role} - {req_list.reason}
                    </li>
                ))}
            </ul>
        </div>
    )
}