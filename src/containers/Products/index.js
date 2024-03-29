import React, { useState, useCallback, useEffect } from 'react';

import { useHistory } from 'react-router';
import { useSelector } from 'react-redux';
// import { getMyProducts } from '../../apis/products.api';
// import { getMyCompletedOrders } from '../../apis/orders.api';
import Layout from '../../components/Layout';
// import ProductsTable from '../../components/ProductsTable';
import Spinner from '../../components/Common/Spinner';

import './style.scss';
import OrdersTable from '../../components/OrdersTable';

const productTableColumns = [
    {
        title: 'Image',
        // key: 'image',
        key: 'product.image',
    },
    {
        title: 'Product Name',
        // key: 'name',
        key: 'product.name',
    },
    {
        title: 'Price',
        key: 'product.price',
    },
    {
        title: 'Purchased At',
        key: 'createdAt',
    },
];

function ProductsPage() {
    const history = useHistory();
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [keyword, setKeyword] = useState('');
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const bkdDriver = useSelector((state) => state.driverObject.bkdDriver);

    const showDetail = (id) => {
        // history.push(`/products/${id}`);
        const order  = products.find(pro=> pro.id===id)
        history.push(`/products/${order.product.id}`);
    };

    const fetchProducts = useCallback(async () => {
        try {
            if (!bkdDriver || !bkdDriver.headers)
                return;
            setIsLoading(true);
            const query = {
                page,
                limit: pageSize,
                sortBy: 'id',
                order: 'DESC',
            };

            // getMyProducts(query)
            const res = await bkdDriver.completedorders(query)
            if (res) {
                console.log(res);
                setProducts(res.orders);
                setTotalCount(res.totalCount);
            } else {
                setProducts([]);
            }
            setIsLoading(false);
        } catch (error) {
            console.log('completedorders error', error);
            setIsLoading(false);
        }
        
    }, [page, pageSize, bkdDriver]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts, page, pageSize]);

    return (
        <Layout title="My Products">
            <div className="products-page">
                {/* <ProductsTable
                    columns={productTableColumns}
                    products={products}
                    onRowClick={showDetail}
                    page={page}
                    pageSize={pageSize}
                    setPage={setPage}
                    setPageSize={setPageSize}
                    keyword={keyword}
                    setKeyword={setKeyword}
                    totalCount={totalCount}
                /> */}

              <OrdersTable
                    columns={productTableColumns}
                    orders={products}
                    onRowClick={showDetail}
                    page={page}
                    pageSize={pageSize}
                    setPage={setPage}
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
}

export default ProductsPage;
