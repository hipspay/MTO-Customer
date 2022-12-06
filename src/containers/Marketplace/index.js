import React, { useState, useCallback, useEffect } from 'react';
import { useHistory } from 'react-router';
import { useSelector } from 'react-redux';
import Layout from '../../components/Layout';
import Spinner from '../../components/Common/Spinner';
import ProductsTable from '../../components/ProductsTable';
// import { getProducts } from '../../apis/products.api';

import './style.scss';

const productTableColumns = [
    {
        title: 'Image',
        key: 'image',
    },
    {
        title: 'Product Name',
        key: 'name',
    },
    {
        title: 'Price',
        key: 'price',
    },
    {
        title: 'Sold out',
        key: 'soldOutItems',
    },
];

const Marketplace = () => {
    const history = useHistory();
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [keyword, setKeyword] = useState('');
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const bkdDriver = useSelector((state) => state.driverObject.bkdDriver);
    const showDetail = (id) => {
        history.push(`/products/${id}`);
    };

    const fetchProducts = useCallback( async() => {
        if (!bkdDriver || !bkdDriver.headers)
            return;
        setIsLoading(true);
        const query = {
            page,
            limit: pageSize,
            sortBy: 'id',
            order: 'DESC',
        };

        const res = await bkdDriver.getProducts(query);
        if (res) {
            setProducts(res.products);
            setTotalCount(res.totalCount);
        } else {
            setProducts([]);
        }
        setIsLoading(false);
    }, [page, pageSize, bkdDriver]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts, page, pageSize]);

    return (
        <Layout title="Marketplace">
            <div className="marketplace-page">
                <ProductsTable
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

export default Marketplace;
