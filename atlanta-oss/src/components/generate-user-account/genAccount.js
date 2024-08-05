import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import config from '../../utils/config';
import { Spinner } from 'react-bootstrap';
import CustomNavbar from '../navigation-bar/navbar';
import SuccessModal from '../Modal/SuccessModal';
import ErrorModal from '../Modal/ErrorModel';
import { useTable, usePagination, useSortBy } from 'react-table';
import { Table, Button, Pagination} from 'react-bootstrap';

export default function CreateAccount() {
    const [request, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [requestAccounts, setRequestAccount] = useState([]);
    const [user, setUser] = useState({
        user_name: '',
        user_password: '',
        user_role: '',
        user_uid: '',
    });
    const [userRole, setUserRole] = useState([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [ticketID, setTicketID] = useState('');
    const [status, setStatus] = useState('');
    const [loadingAccount, setLoadingAccount] = useState(false);
    const [loadingOther, setLoadingOther] = useState(false);

    useEffect(() => {
        const fetchDataRequest = async () => {
            const token = localStorage.getItem('token');
            try {
                setLoadingOther(true);
                const res = await axios.get(`${config.apiBaseUrl}/requests/open_tickets`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (Array.isArray(res.data)) {
                    setRequests(res.data);
                } else {
                    setRequests([]);
                }
            } catch (error) {
                console.error('Error fetching the request data', error);
                setRequests([]);
            } finally {
                setLoadingOther(false);
            }
        };

        const fetchDataRoles = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get(`${config.apiBaseUrl}/users/user_roles`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setUserRole(res.data);
            } catch (error) {
                console.error('Error fetching the user roles',  error);
            }
        };

        const fetchDataAccount = async () => {
            const token = localStorage.getItem('token');
            try {
                setLoadingAccount(true);
                const res = await axios.get(`${config.apiBaseUrl}/users/user_accounts`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (Array.isArray(res.data)) {
                    setRequestAccount(res.data);
                } else {
                    setRequestAccount([]);
                }
            } catch (error) {
                console.error('Error fetching the request data', error);
                setRequestAccount([]);
            } finally {
                setLoadingAccount(false);
            }
        }

        fetchDataRequest();
        fetchDataRoles();
        fetchDataAccount();
    }, []);

    const handleChange = (e) => {
        setUser({...user, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(false);
        const token = localStorage.getItem('token');
        if (!token) {
            setMessage('User is not authenticated');
            showErrorModal(true);
            return;
        }
        try {
            const res = await axios.post(`${config.apiBaseUrl}/users/create_user`, user, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.data && res.data.ticketid && res.data.mid) {
                setRequests([...request, res.data]);
            }

            setMessage('User created successfully');
            setUser({
                user_name: '',
                user_password: '',
                user_role: '',
                user_uid: '',
            });
            setTicketID('');
            setSelectedRequest(null);
            setShowSuccessModal(true);
        } catch (err) {
            setMessage('Error creating user', err);
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleTicketChange = async (e) => {
        const ticketID = e.target.value;
        setTicketID(ticketID);
        const token = localStorage.getItem('token');
        if (ticketID !== '-' && ticketID !== 'N/A') {
            try {
                const res = await axios.get(`${config.apiBaseUrl}/requests/${ticketID}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setSelectedRequest(res.data);
            } catch (error) {
                console.error('Error fetching the selected request details', error);
            }
        } else {
            setSelectedRequest(null);
        }
    };

    const handleStatusChange = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            setMessage('User is not authenticated');
            return;
        }
        try {
            const res = await axios.put(`${config.apiBaseUrl}/requests/${ticketID}/status`, {status}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setMessage('Request status updated successfully');
            setShowSuccessModal(true);
            setSelectedRequest({ ...selectedRequest, status });
        } catch (err) {
            setMessage('Error updating request status.');
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
    };

    const handleCloseErrorModal = () => {
        setShowErrorModal(false);
    };

    const sendEmail = async (email, user_name, user_password) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${config.apiBaseUrl}/users/send_email`, {
                email, user_name, user_password
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data.success) {
                setMessage('Email sent successfully');
                setShowSuccessModal(true);
            } else {
                setMessage('Failed to send email');
                setShowErrorModal(true);
            }
        } catch (error) {
            setMessage('Failed to send email');
            setShowErrorModal(true);
        }
    };

    const column_Ticket = useMemo(
        () => [
            { Header: 'Ticket ID', accessor: 'ticketid' },
            { Header: 'UID', accessor: 'uid' },
            { Header: 'Email', accessor: 'email' },
            { Header: 'Telephone', accessor: 'tel' },
            { Header: 'Role', accessor: 'role' },
            { Header: 'Reason', accessor: 'reason' },
            { Header: 'Status', accessor: 'status' },
            { Header: 'Created', accessor: 'created_at', Cell: ({ value }) => new Date(value).toLocaleString() }
        ],
        []
    );

    const column_userAccount = useMemo(
        () => [
            { Header: 'UID', accessor: 'user_uid' },
            { Header: 'Username', accessor: 'user_name' },
            { Header: 'Role', accessor: 'user_role' },
            { Header: 'Created', accessor: 'created_at', Cell: ({ value }) => new Date(value).toLocaleString() },
            {
                Header: 'Action',
                accessor: 'action',
                Cell: ({ row }) => (
                    <Button
                        className='btn btn-primary'
                        onClick={() => sendEmail(row.original.user_name, row.original.user_name, row.original.n_user_password)}
                    >
                        Send Email
                    </Button>
                )
            }
        ],
        []
    );

    const TableComponent = ({ data, columns, loading }) => {
        const {
            getTableProps,
            getTableBodyProps,
            headerGroups,
            prepareRow,
            page,
            canPreviousPage,
            canNextPage,
            pageOptions,
            pageCount,
            gotoPage,
            nextPage,
            previousPage,
            setPageSize,
            state: { pageIndex, pageSize },
        } = useTable(
            {
                columns,
                data,
                initialState: { pageIndex: 0 },
            },
            useSortBy,
            usePagination
        );

        return (
            <div>
                {loading ? (
                    <Spinner animation="border" />
                ) : (
                    <Table striped bordered hover {...getTableProps()}>
                        <thead>
                            {headerGroups.map(headerGroup => (
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers.map(column => (
                                        <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                                            {column.render('Header')}
                                            <span>
                                                {column.isSorted
                                                    ? column.isSortedDesc
                                                        ? ' 🔽'
                                                        : ' 🔼'
                                                    : ''}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody {...getTableBodyProps()}>
                            {page.map(row => {
                                prepareRow(row);
                                return (
                                    <tr {...row.getRowProps()}>
                                        {row.cells.map(cell => (
                                            <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                )}
                <div className="pagination">
                    <button className='btn btn-primary' onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                        {'<<'}
                    </button>{' '}
                    <button className='btn btn-primary' onClick={() => previousPage()} disabled={!canPreviousPage}>
                        {'<'}
                    </button>{' '}
                    <button className='btn btn-primary' onClick={() => nextPage()} disabled={!canNextPage}>
                        {'>'}
                    </button>{' '}
                    <button className='btn btn-primary' onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                        {'>>'}
                    </button>{' '}
                    <span className='container'>
                        Page{' '}
                        <strong>
                            {pageIndex + 1} of {pageOptions.length}
                        </strong>{' '}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div>
            <CustomNavbar/>
            <div className='container mt-5'>
                <h1>Create User Account</h1>
                <p>For operator only this operation allow generate user account for access the one stop service.</p>
                <TableComponent data={request} columns={column_Ticket} loading={loadingOther} />
                <hr/>
                <h5>Ticket Detail</h5>
                <form>
                    <div className='form-group row'>
                        <div className='col-sm-6 mb-3 mb-sm-0'>
                        <label htmlFor='TicketID'>Select Ticket</label>
                            <select className='form-select' id='TicketID' name="TicketID" onChange={handleTicketChange}>
                                <option value="-">-</option>
                                {
                                    request.length > 0 ? (
                                        request.map((val, key) => (
                                            val.ticketid ? (
                                                <option key={val.mid} value={val.ticketid}>{val.ticketid}</option>
                                            ) : (
                                                <option key={val.mid} value="N/A">No Ticket ID Load yet</option>
                                            )
                                        ))
                                    ) : (
                                        <option value="-">No data has been found</option>
                                    )
                                }
                            </select>
                        </div>
                    </div>
                    {selectedRequest && (
                        <div>
                            <div className='form-group row'>
                                <div className='col-sm-6 mb-3 mb-sm-0'>
                                    <label htmlFor='email'>Email</label>
                                    <input
                                        type='text'
                                        className='form-control'
                                        id='email'
                                        name='email'
                                        value={selectedRequest.email}
                                        readOnly
                                    />
                                </div>
                                <div className='col-sm-6'>
                                    <label htmlFor='tel'>Telephone</label>
                                    <input
                                        type='text'
                                        className='form-control'
                                        id='tel'
                                        name='tel'
                                        value={selectedRequest.tel}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className='form-group row'>
                                <div className='col-sm-6 mb-3 mb-sm-0'>
                                    <label htmlFor='role'>Role</label>
                                    <input
                                        type='text'
                                        className='form-control read-only'
                                        id='role'
                                        name='role'
                                        value={selectedRequest.role}
                                        readOnly
                                    />
                                </div>
                                <div className='col-sm-6'>
                                    <label htmlFor='status'>Status</label>
                                    <select
                                        className='form-select'
                                        id='status'
                                        name='status'
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="-">-</option>
                                        <option value="Close">Close</option>
                                        <option value="Re-Open">Re-Open</option>
                                    </select>
                                </div>
                            </div>
                            <div className='form-group row'>
                                <div className='col-sm-12'>
                                    <label htmlFor='reason'>Reason</label>
                                    <textarea
                                        className='form-control read-only'
                                        id='reason'
                                        name='reason'
                                        value={selectedRequest.reason}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className='col-sm-12 mt-3'>
                                <button type='submit' className='btn btn-primary' disabled={loading} onClick={handleStatusChange}>
                                    {loading ? <Spinner as='span' animation='border' size='sm' role='status' aria-hidden='true'/> : 'Update Status'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
                <hr/>
                <h5>Create User Account</h5>
                <form onSubmit={handleSubmit}>
                    <div className='form-group row'>
                        <div className='col-sm-6 mb-3 mb-sm-0'>
                            <label htmlFor='user_name'>Username</label>
                            <input
                                type='text'
                                className='form-control'
                                id='user_name'
                                name='user_name'
                                value={user.user_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className='col-sm-6'>
                            <label htmlFor='user_password'>Password</label>
                            <input
                                type='password'
                                className='form-control'
                                id='user_password'
                                name='user_password'
                                value={user.user_password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className='form-group row'>
                        <div className='col-sm-6 mb-3 mb-sm-0'>
                            <label htmlFor='user_role'>User Role</label>
                            <select className='form-select' id="RoleCategory" name="RoleCategory" onChange={(e) => {
                                setUser({ ...user, user_role: e.target.value });
                            }} required>
                                <option value="-">-</option>
                                {userRole.length > 0 ? (
                                    userRole.map((val, key) => (
                                        <option key={val.role_id} value={val.role_name}>{val.role_name}</option>
                                    ))
                                ) : (
                                    <option value="-">ไม่พบรายชื่อของตำแหน่ง</option>
                                )}
                            </select>
                        </div>
                        <div className='col-sm-6'>
                            <label htmlFor='user_uid'>User</label>
                            <input
                                type='text'
                                className='form-control'
                                id='user_uid'
                                name='user_uid'
                                value={user.user_uid}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <hr/>
                    <button type='submit' className='btn btn-success' disabled={loading}>
                        {loading ? <Spinner as='span' animation='border' size='sm' role='status' aria-hidden='true'/> : 'Create User'}
                    </button>
                </form>
                <hr/>
                    <TableComponent data={requestAccounts} columns={column_userAccount} loading={loadingAccount} />
                <hr/>
            </div>
            <SuccessModal show={showSuccessModal} handleClose={handleCloseSuccessModal} message={message}/>
            <ErrorModal show={showErrorModal} handleClose={handleCloseErrorModal} message={message}/>
        </div>
    )
}