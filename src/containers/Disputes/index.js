import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { useSelector } from 'react-redux';
import Layout from '../../components/Layout';
import DisputesTable from '../../components/DisputesTable';
import Spinner from '../../components/Common/Spinner';
// import { getDisputes } from '../../apis/disputs.api';

import './style.scss';

const DisputesColumns = [
    {
        title: 'Image',
        key: 'order.product.image',
    },
    {
        title: 'Product Name',
        key: 'order.product.name',
    },
    {
        title: 'Price',
        key: 'order.product.price',
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

const DisputesPage = () => {
    const history = useHistory();
    const [isLoading, setIsLoading] = useState(false);
    const [disputes, setDisputes] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [keyword, setKeyword] = useState('');
    const [totalCount, setTotalCount] = useState(0);
    const bkdDriver = useSelector((state) => state.driverObject.bkdDriver);

    const fetchDisputes = useCallback(async () => {
        if (!bkdDriver || !bkdDriver.headers)
            return;
        setIsLoading(true);
        const query = {
            page,
            limit: pageSize,
        };

        const res = await bkdDriver.getDisputes(query);
        setDisputes(res.disputes);
        setTotalCount(res.totalCount);
        setIsLoading(false);
    }, [page, pageSize, bkdDriver]);

    useEffect(() => {
        fetchDisputes();
    }, [fetchDisputes]);

    const showDetail = (id) => {
        history.push(`/disputes/${id}`);
    };

    return (
        <Layout title="Dispute">
            <div className="disputes-page">
                <DisputesTable
                    columns={DisputesColumns}
                    disputes={disputes}
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

export default DisputesPage;
