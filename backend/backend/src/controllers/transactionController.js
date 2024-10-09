import Transaction from "../models/transaction.js";

const getMonthIndex = (month) => {
    const monthMapping = {
        january: 0,
        february: 1,
        march: 2,
        april: 3,
        may: 4,
        june: 5,
        july: 6,
        august: 7,
        september: 8,
        october: 9,
        november: 10,
        december: 11,
    };
    return monthMapping[month.toLowerCase().trim()];
};

export const getDateRangeFromMonth = (month) => {
    const monthIndex = getMonthIndex(month);
    const start = new Date(new Date().getFullYear(), monthIndex, 1);
    const end = new Date(new Date().getFullYear(), monthIndex + 1, 0);
    return { start, end };
};

export const initializeDatabase = async (req, res) => {
    try {
        const response = await fetch('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const transactions = data.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            price: item.price,
            category: item.category,
            dateOfSale: new Date(item.dateOfSale),
            sold: item.sold
        }));
        await Transaction.insertMany(transactions); 
        res.status(200).send('Database initialized with seed data');
    } catch (error) {
        res.status(500).json({ error: 'Failed to initialize database', details: error.message });
    }
};

export const listTransactions = async (req, res) => {
    const { month, page = 1, perPage = 10, search = '' } = req.query;
    const monthIndex = getMonthIndex(month);
    if (monthIndex === undefined) {
        return res.status(400).json({ error: 'Invalid month provided' });
    }
    try {
        const transactions = await Transaction.find();
        const filteredTransactions = transactions.filter(transaction => {
            const saleDate = new Date(transaction.dateOfSale);
            return saleDate.getMonth() === monthIndex;
        });
        const searchedTransactions = filteredTransactions.filter(transaction => {
            const searchTerm = search.toLowerCase();
            return (
                transaction.title.toLowerCase().includes(searchTerm) ||
                transaction.description.toLowerCase().includes(searchTerm) ||
                transaction.price.toString().includes(searchTerm)
            );
        });
        const total = searchedTransactions.length;
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + parseInt(perPage);
        const paginatedTransactions = searchedTransactions.slice(startIndex, endIndex);
        res.status(200).json({
            total,
            page: parseInt(page),
            perPage: parseInt(perPage),
            transactions: paginatedTransactions,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve transactions', details: error.message });
    }
};

export const getStatistics = async (req, res) => {
    const { month } = req.query;
    const monthIndex = getMonthIndex(month);
    if (monthIndex === undefined) {
        return res.status(400).json({ error: 'Invalid month provided' });
    }
    try {
        const transactions = await Transaction.find();
        const filteredTransactions = transactions.filter(transaction => {
            const saleDate = new Date(transaction.dateOfSale);
            return saleDate.getMonth() === monthIndex;
        });
        const totalSaleAmount = filteredTransactions.reduce((acc, transaction) => acc + transaction.price, 0);
        const totalSoldItems = filteredTransactions.filter(transaction => transaction.sold).length;
        const totalNotSoldItems = filteredTransactions.filter(transaction => !transaction.sold).length;
        res.status(200).json({
            totalSaleAmount,
            totalSoldItems,
            totalNotSoldItems,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve statistics', details: error.message });
    }
};

export const getBarChart = async (req, res) => {
    const { month } = req.query;
    const monthIndex = getMonthIndex(month);
    if (monthIndex === undefined) {
        return res.status(400).json({ error: 'Invalid month provided' });
    }
    try {
        const transactions = await Transaction.find();
        const filteredTransactions = transactions.filter(transaction => {
            const saleDate = new Date(transaction.dateOfSale);
            return saleDate.getMonth() === monthIndex;
        });
        const priceRanges = {
            "0-100": 0,
            "101-200": 0,
            "201-300": 0,
            "301-400": 0,
            "401-500": 0,
            "501-600": 0,
            "601-700": 0,
            "701-800": 0,
            "801-900": 0,
            "901-above": 0,
        };
        filteredTransactions.forEach(transaction => {
            const price = transaction.price;
            if (price >= 0 && price <= 100) {
                priceRanges["0-100"]++;
            } else if (price >= 101 && price <= 200) {
                priceRanges["101-200"]++;
            } else if (price >= 201 && price <= 300) {
                priceRanges["201-300"]++;
            } else if (price >= 301 && price <= 400) {
                priceRanges["301-400"]++;
            } else if (price >= 401 && price <= 500) {
                priceRanges["401-500"]++;
            } else if (price >= 501 && price <= 600) {
                priceRanges["501-600"]++;
            } else if (price >= 601 && price <= 700) {
                priceRanges["601-700"]++;
            } else if (price >= 701 && price <= 800) {
                priceRanges["701-800"]++;
            } else if (price >= 801 && price <= 900) {
                priceRanges["801-900"]++;
            } else {
                priceRanges["901-above"]++;
            }
        });
        res.status(200).json(priceRanges);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve bar chart data', details: error.message });
    }
};

export const getPieChart = async (req, res) => {
    const { month } = req.query;
    const monthIndex = getMonthIndex(month);
    if (monthIndex === undefined) {
        return res.status(400).json({ error: 'Invalid month provided' });
    }
    try {
        const transactions = await Transaction.find();
        const filteredTransactions = transactions.filter(transaction => {
            const saleDate = new Date(transaction.dateOfSale);
            return saleDate.getMonth() === monthIndex;
        });
        const categoryCounts = {};
        filteredTransactions.forEach(transaction => {
            const category = transaction.category;
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
        const result = Object.keys(categoryCounts).map(category => ({
            category,
            count: categoryCounts[category]
        }));
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve pie chart data', details: error.message });
    }
};

export const getCombinedData = async (req, res) => {
    const { month } = req.query;
    try {
        const [transactions, statistics, barChart, pieChart] = await Promise.all([
            Transaction.find({ dateOfSale: { $gte: getDateRangeFromMonth(month).start, $lte: getDateRangeFromMonth(month).end } }),
            getStatistics(req, res),
            getBarChart(req, res),
            getPieChart(req, res)
        ]);
        res.json({ transactions, statistics, barChart, pieChart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
