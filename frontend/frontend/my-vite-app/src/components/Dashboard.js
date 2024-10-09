// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Select, MenuItem, Button } from '@mui/material';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [month, setMonth] = useState(3); // Default to March
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchData();
    }, [month, search, page]);

    const fetchData = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/combined?month=${month}&search=${search}&page=${page}`);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    if (!data) return <div>Loading...</div>;

    return (
        <div>
            <h1>Transaction Dashboard</h1>
            
            <Select value={month} onChange={(e) => setMonth(e.target.value)}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                    <MenuItem key={m} value={m}>
                        {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                    </MenuItem>
                ))}
            </Select>

            <TextField 
                label="Search" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                variant="outlined"
                style={{ margin: '16px 0' }}
            />

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Sold</TableCell>
                            <TableCell>Date of Sale</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.transactions.transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell>{transaction.id}</TableCell>
                                <TableCell>{transaction.title}</TableCell>
                                <TableCell>{transaction.description}</TableCell>
                                <TableCell>${transaction.price}</TableCell>
                                <TableCell>{transaction.category}</TableCell>
                                <TableCell>{transaction.sold ? 'Yes' : 'No'}</TableCell>
                                <TableCell>{new Date(transaction.dateOfSale).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Button onClick={() => setPage(page - 1)} disabled={page === 1}>Previous</Button>
            <Button onClick={() => setPage(page + 1)} disabled={page === data.transactions.totalPages}>Next</Button>

            <h2>Statistics</h2>
            <p>Total Sale Amount: ${data.statistics.totalSaleAmount}</p>
            <p>Total Sold Items: {data.statistics.totalSoldItems}</p>
            <p>Total Not Sold Items: {data.statistics.totalNotSoldItems}</p>

            <h2>Bar Chart</h2>
            <Bar
                data={{
                    labels: data.barChart.map(item => item.range),
                    datasets: [{
                        label: 'Number of Items',
                        data: data.barChart.map(item => item.count),
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    }]
                }}
                options={{
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                        },
                    },
                }}
            />
        </div>
    );
};

export default Dashboard;
