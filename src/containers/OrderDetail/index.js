import { Button } from '@material-ui/core';
import { Person } from '@material-ui/icons';

import React, { useEffect, useState } from 'react';

import { useHistory } from 'react-router';

import { useSelector } from 'react-redux';

import { useSnackbar } from 'notistack';

import { orderStatus, getOrderStatus } from '../../constants';
import {
    getDisputeByEscrow,
    updateDisputeByEscrow,
} from '../../apis/disputs.api';
import { getOrder } from '../../apis/orders.api';
import Layout from '../../components/Layout';
import escrowABI from '../../constants/escrowABI.json';
import tokenABI from '../../constants/tokenABI.json';
import { parseDate, toWei, sleep } from '../../utils/index';
import ConfirmDialog from '../../components/Common/ComfirmDialog';
import Spinner from '../../components/Common/Spinner';
import './style.scss';

const notificationConfig = {
    preventDuplicate: true,
    vertical: 'bottom',
    horizontal: 'right',
};

const OrderDetailPage = () => {
    const history = useHistory();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState();
    const [isConfirmArrival, setIsConfirmArrival] = useState(false);
    const [isConfirmDispute, setIsConfirmDispute] = useState(false);
    const [remainTime, setRemainTime] = useState('');

    const [escrowContract, setEscrowContract] = useState(null);
    const [tokenContract, setTokenContract] = useState(null);

    const { web3, account, connected } = useSelector((state) => state.web3);

    const showNotification = (msg) => {
        enqueueSnackbar(msg, {
            ...notificationConfig,
            variant: 'error',
        });
    };

    useEffect(() => {
        if (!data) {
            return;
        }

        const deadline = new Date(data.deliveryTime).getTime();
        const timer = setInterval(() => {
            const seconds = (deadline - new Date().getTime()) / 1000;
            let minutes = Math.floor(seconds / 60);
            let hours = Math.floor(minutes / 60);
            minutes %= 60;
            const days = Math.floor(hours / 24);
            hours %= 24;
            setRemainTime(
                `${days > 0 ? days : 0}d: ${hours > 0 ? hours : 0}h: ${
                    minutes > 0 ? minutes : 0
                }m`
            );
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, [data]);

    useEffect(() => {
        setIsLoading(true);
        const id = history.location.pathname.split('/orders/')[1];
        getOrder(id)
            .then((res) => {
                setData(res.data);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [history.location.pathname]);

    const confirmArrival = () => {
        setIsLoading(true);
        setIsConfirmArrival(false);
        setTimeout(() => {
            setIsLoading(false);
            history.push('/myproducts');
        }, 5000);
    };

    React.useEffect(() => {
        if (escrowContract && tokenContract) return;
        if (!connected) return;

        const EscrowContract = new web3.eth.Contract(
            escrowABI,
            process.env.REACT_APP_ESCROW_CONTRACT_ADDRESS
        );

        const TokenContract = new web3.eth.Contract(
            tokenABI,
            process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS
        );

        setEscrowContract(EscrowContract);
        setTokenContract(TokenContract);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [web3]);

    const verifyDispute = async (escrowId, timeToEnd) => {
        try {
            const {
                data: { id },
            } = await getDisputeByEscrow(escrowId);
            console.log('returning', id);
            return id;
        } catch (error) {
            console.log(error);
            await sleep(2000);
            if (Date.now() > timeToEnd) {
                return false;
            }
            return verifyDispute(escrowId, timeToEnd);
        }
    };

    const updateDisputeDescription = async (disputeId, description) => {
        try {
            const {
                data: { id },
            } = await updateDisputeByEscrow(disputeId, {
                description,
            });
            console.log('returning', id);
            return id;
        } catch (error) {
            console.log(error);
        }
    };

    const disputeOrder = async (description) => {
        console.log(description, 'description');

        setIsLoading(true);
        setIsConfirmDispute(false);
        try {
            const { transactionHash: transactionHashApprove } =
                await tokenContract.methods
                    .approve(
                        process.env.REACT_APP_ESCROW_CONTRACT_ADDRESS,
                        toWei(web3, 2)
                    )
                    .send({ from: account });

            await web3.eth.getTransactionReceipt(transactionHashApprove);

            const result = await escrowContract.methods
                .dispute(data.escrowId)
                .send({ from: account });

            const { transactionHash: transactionHashPurchase } = result;
            const purchaseReceipt = await web3.eth.getTransactionReceipt(
                transactionHashPurchase
            );

            const blockLog = purchaseReceipt.logs.filter(
                (elem) =>
                    elem.address.toLowerCase() ===
                    process.env.REACT_APP_ESCROW_CONTRACT_ADDRESS.toLowerCase()
            )[0];
            const pastEvents = await escrowContract.getPastEvents('allEvents', {
                fromBlock: blockLog.blockNumber,
                toBlock: blockLog.blockNumber,
            });

            const escrowId = pastEvents[0].returnValues._disputeId;

            const endRequestsAt = Date.now() + 120000;
            const orderId = await verifyDispute(escrowId, endRequestsAt);
            if (orderId) {
                const disputeUpdateResult = await updateDisputeDescription(
                    escrowId,
                    description
                );
                console.log('disputeUpdateResult', disputeUpdateResult);

                history.push(`/disputes/${orderId}`);
            }

            setIsLoading(false);
        } catch (error) {
            console.log(error, 'error');

            setIsLoading(false);
        }
    };

    const handleDispute = () => {
        if (new Date(data.deliveryTime).getTime() >= new Date().getTime()) {
            showNotification('Dispute can only be created after delivery time');
            return;
        }
        if (new Date().getTime() >= new Date(data.escrowTime).getTime()) {
            showNotification('Dispute can not be created after withdraw time');
            return;
        }
        setIsConfirmDispute(true);
    };

    return (
        <Layout title="Order Detail">
            {data && (
                <div className="order-detail-page">
                    <div className="block block-rounded">
                        <div className="block-header block-header-default">
                            <h3 className="block-title">Order</h3>
                            <div className={`status ${getOrderStatus(data)}`}>
                                {orderStatus[getOrderStatus(data)]}
                            </div>
                        </div>

                        <div className="block-content">
                            <div className="main-info">
                                <div className="order-image">
                                    <img src={`${data.product.image}`} alt="" />
                                </div>

                                <div className="order-name">
                                    <p>{data.product.name}</p>
                                    <p>
                                        <strong>Price: </strong>
                                        {`${data.product.price} MTO`}
                                    </p>
                                </div>

                                <div className="info">
                                    {data.status === 'in_delivery' ? (
                                        <p className="label">
                                            Delivery period will be ended in:
                                        </p>
                                    ) : (
                                        <p className="label">
                                            Escrow period will be ended in:
                                        </p>
                                    )}
                                    <p>{remainTime}</p>
                                </div>

                                <div className="info">
                                    <p className="label">Purchased At:</p>
                                    <p>{parseDate(data.createdAt)}</p>
                                </div>
                            </div>

                            <div className="info">
                                <p className="label">Description:</p>
                                <p>{data.product.description}</p>
                            </div>

                            <div className="info">
                                <p className="label">Location: </p>
                                <p>{data.product.shopAddress}</p>
                            </div>

                            <div className="info">
                                <p className="label">Merchant Info:</p>
                                <div className="merchant-info">
                                    <Person />
                                    <a className="merchant-name">
                                        {data.product.merchant.name}
                                    </a>
                                </div>
                            </div>

                            <div
                                className="info align-items-start"
                                style={{ fontSize: 13, width: '100%' }}
                            >
                                <div className="info-block">
                                    <div className="info-item">
                                        <span>Delivery period Ends On:</span>
                                        <span>
                                            {parseDate(data.deliveryTime)}
                                        </span>
                                    </div>

                                    <div className="info-item">
                                        <span>Withdraw period Ends On:</span>
                                        <span>
                                            {parseDate(data.escrowTime)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="actions">
                                {data.status === orderStatus.in_delivery && (
                                    <Button
                                        className="arrival"
                                        color="black"
                                        variant="contained"
                                        onClick={() =>
                                            setIsConfirmArrival(true)
                                        }
                                    >
                                        Confirm arrival
                                    </Button>
                                )}

                                {data.status === orderStatus.over_delivery && (
                                    <>
                                        <Button
                                            className="arrival"
                                            color="black"
                                            variant="contained"
                                            onClick={() =>
                                                setIsConfirmArrival(true)
                                            }
                                        >
                                            Confirm arrival
                                        </Button>
                                    </>
                                )}

                                {/* dispute is possible only after the delivery/dispute time 
and dispute can not be raised after widraw time, as after that merchant had
withdraw the money if no dispute occurs upto now.
*/}
                                {
                                    <>
                                        <Button
                                            disabled={
                                                !connected ||
                                                data.status === 'in_dispute'
                                            }
                                            className="dispute"
                                            color="black"
                                            variant="contained"
                                            onClick={() => handleDispute()}
                                        >
                                            {data.status === 'in_dispute'
                                                ? 'In Dispute'
                                                : ' Dispute'}
                                        </Button>
                                    </>
                                }
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
                open={isConfirmArrival}
                handler={confirmArrival}
                content="Are you sure if you got the delivery product ?"
                onClose={() => setIsConfirmArrival(false)}
                isDispute={false}
            />

            <ConfirmDialog
                open={isConfirmDispute}
                handler={disputeOrder}
                content="You should pay 1 MTO to raise a dispute case. Are you sure ?"
                onClose={() => setIsConfirmDispute(false)}
                // eslint-disable-next-line react/jsx-boolean-value
                isDispute={true}
            />
        </Layout>
    );
};

export default OrderDetailPage;
