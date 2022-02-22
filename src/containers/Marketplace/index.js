import React, { useState, useCallback, useEffect } from 'react';
import { useHistory } from 'react-router';

import Layout from '../../components/Layout';
import Spinner from '../../components/Common/Spinner';
import ProductsTable from '../../components/ProductsTable';
import { getProducts } from '../../apis/products.api';

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

    const showDetail = (id) => {
        history.push(`/products/${id}`);
    };

    const fetchProducts = useCallback(() => {
        setIsLoading(true);
        const query = {
            page,
            limit: pageSize,
            sortBy: 'id',
            order: 'DESC',
        };

        getProducts(query)
            .then((res) => {
                setProducts(res.data.products);
                setTotalCount(res.data.totalCount);
            })
            .catch((err) => {
                console.log(err);
                setProducts([]);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [page, pageSize]);

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
