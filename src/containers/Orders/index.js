import React, { useState, useCallback, useEffect } from 'react';
import { useHistory } from 'react-router';
import { useSelector } from 'react-redux';
import Layout from '../../components/Layout';
import OrdersTable from '../../components/OrdersTable';
import Spinner from '../../components/Common/Spinner';
// import { getOrders } from '../../apis/orders.api';

import './style.scss';

const OrdersColumns = [
    {
        title: 'Image',
        key: 'product.image',
    },
    {
        title: 'Product Name',
        key: 'product.name',
    },
    {
        title: 'Price',
        key: 'product.price',
    },
    {
        title: 'Created At',
        key: 'createdAt',
    },
    {
        title: 'Status',
        key: 'status',
    },
];

const OrdersPage = () => {
    const history = useHistory();
    const [isLoading, setIsLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [keyword, setKeyword] = useState('');
    const [totalCount, setTotalCount] = useState(0);
    const bkdDriver = useSelector((state) => state.driverObject.bkdDriver);
    const showDetail = (id) => {
        history.push(`/orders/${id}`);
    };

    const fetchOrders = useCallback(async () => {
        try {
            if (!bkdDriver || !bkdDriver.headers)
                return;

            setIsLoading(true);
            const query = {
                page,
                limit: pageSize,
            };

            const res = await bkdDriver.myorders(query);
            setOrders(res.orders);
            setTotalCount(res.totalCount);
            setIsLoading(false);
        } catch (error) {
            console.log('myorders error', error);
            setIsLoading(false);
        }
        
    }, [page, pageSize, bkdDriver]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);


    console.log("orders",orders)
    return (
        <Layout title="My Orders">
            <div className="orders-page">
                <OrdersTable
                    columns={OrdersColumns}
                    orders={orders}
                    onRowClick={showDetail}
                    page={page}
                    setPage={setPage}
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                    keyword={keyword}
                    setKeyword={setKeyword}
                    totalCount={totalCount}
                />

                {isLoading && (
                    <div className="overlay">
                        <Spinner />
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default OrdersPage;
