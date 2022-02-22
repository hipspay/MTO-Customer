import { Button } from '@material-ui/core';
import { Person } from '@material-ui/icons';

import React, { useEffect, useState } from 'react';

import { useHistory } from 'react-router';

import { getDispute } from '../../apis/disputs.api';
import Layout from '../../components/Layout';
import { parseDate } from '../../utils/index';
import ConfirmDialog from '../../components/Common/ComfirmDialog';
import Spinner from '../../components/Common/Spinner';

import './style.scss';

const DisputeDetailPage = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState();
    const [isOpenConfirmDialog, setIsOpenConfirmDialog] = useState(false);
    const history = useHistory();

    useEffect(() => {
        setIsLoading(true);
        const id = history.location.pathname.split('/disputes/')[1];
        getDispute(id)
            .then((res) => {
                setData(res.data);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [history.location.pathname]);

    const cancelDispute = () => {
        setIsLoading(true);
        setIsOpenConfirmDialog(false);
        setTimeout(() => {
            setIsLoading(false);
            history.push('/disputes');
        }, 5000);
    };

    const disputeWithDraw = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            history.push('/marketplace');
        }, 5000);
    };

    return (
        <Layout title="Dispute">
            {data && (
                <div className="dispute-detail-page">
                    <div className="block block-rounded">
                        <div className="block-header block-header-default">
                            <div className="block-title">Dispute</div>

                            <div
                                className={`status ${data.status.toLowerCase()}`}
                            >
                                {data.status}
                            </div>
                        </div>
                        <div className="block-content">
                            <div className="main-info">
                                <div className="product-image">
                                    <img
                                        src={`${data.order.product.image}`}
                                        alt=""
                                    />
                                </div>

                                <div className="product-name">
                                    <p>{data.order.product.name}</p>
                                    <p>
                                        <strong>Price: </strong>
                                        {`${data.order.product.price} MTO`}
                                    </p>
                                </div>

                                <div className="info">
                                    <p className="label">Dispute Created At:</p>
                                    <p>{parseDate(data.createdAt)}</p>
                                </div>

                                <div className="info">
                                    <p className="label">Purchased At</p>
                                    <p>{parseDate(data.order.createdAt)}</p>
                                </div>
                            </div>
                            <div className="info">
                                <p className="label">Product Description:</p>
                                <p>{data.order.product.description}</p>
                            </div>
                            <div className="info">
                                <p className="label">Dispute Description:</p>
                                <p>{data.description}</p>
                            </div>

                            <div className="info">
                                <p className="label">Merchant Info:</p>
                                <div className="merchant-info">
                                    <Person />
                                    <a className="merchant-name">
                                        {data.order.product.merchant.name}
                                    </a>
                                </div>
                            </div>

                            <div className="info align-items-end">
                                <div className="info-block">
                                    <div className="info-item">
                                        <span>Delivery period:</span>
                                        <span>
                                            {parseDate(data.order.deliveryTime)}
                                        </span>
                                    </div>

                                    <div className="info-item">
                                        <span>Escrow period:</span>
                                        <span>
                                            {parseDate(data.order.escrowTime)}
                                        </span>
                                    </div>
                                </div>
                                {(data.status === 'Init' ||
                                    data.status === 'Waiting' ||
                                    data.status === 'Review') && (
                                    <div className="info-block">
                                        <div className="info-item">
                                            <span>Agents in Review:</span>
                                            <span>{data.agentsInReview}</span>
                                        </div>

                                        <div className="info-item">
                                            <span>Agents in Approved:</span>
                                            <span>{data.agentsInApproved}</span>
                                        </div>

                                        <div className="info-item">
                                            <span>Agents in Review:</span>
                                            <span>
                                                {data.agentsInDisapproved}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {(data.status === 'Fail' ||
                                data.status === 'Win') && (
                                <>
                                    {data.status === 'Fail' ? (
                                        <p className="help-text">
                                            Sorry, your dispute has been
                                            disapproved by 2 agents, so you got
                                            failed for this case.
                                        </p>
                                    ) : (
                                        <p className="help-text">
                                            Congrats! You have won a dispute.
                                            <br />
                                            Please withdraw the deposited funds
                                            from an escrow contract.
                                        </p>
                                    )}
                                </>
                            )}

                            <div className="actions">
                                {data.status === 'Init' && (
                                    <Button
                                        className="init"
                                        color="secondary"
                                        variant="contained"
                                        onClick={() =>
                                            setIsOpenConfirmDialog(true)
                                        }
                                    >
                                        Cancel
                                    </Button>
                                )}

                                {data.status === 'Win' && (
                                    <Button
                                        className="win"
                                        color="secondary"
                                        variant="contained"
                                        onClick={disputeWithDraw}
                                    >
                                        Withdraw
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {isLoading && (
                        <div className="overlay">
                            <Spinner />
                        </div>
                    )}
                </div>
            )}

            <ConfirmDialog
                open={isOpenConfirmDialog}
                handler={cancelDispute}
                content="Are you sure to cancel this dispute?"
                onClose={() => setIsOpenConfirmDialog(false)}
                isDispute={false}
            />
        </Layout>
    );
};

export default DisputeDetailPage;
