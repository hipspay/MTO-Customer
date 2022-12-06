import { Button } from '@material-ui/core';
import { Person } from '@material-ui/icons';

import React, { useEffect, useState, useCallback } from 'react';

import { useHistory } from 'react-router';

import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';

// import { getOrderByEscrow } from '../../apis/orders.api';
// import { getProduct } from '../../apis/products.api';
import Layout from '../../components/Layout';
// import escrowABI from '../../constants/escrowABI.json';
// import tokenABI from '../../constants/tokenABI.json';
import { toWei, sleep } from '../../utils/index';
import Spinner from '../../components/Common/Spinner';

import './style.scss';

const notificationConfig = {
    preventDuplicate: true,
    vertical: 'bottom',
    horizontal: 'right',
};
const ProductDetailPage = () => {
    const history = useHistory();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    // const [escrowContract, setEscrowContract] = useState(null);
    // const [tokenContract, setTokenContract] = useState(null);
    const bkdDriver = useSelector((state) => state.driverObject.bkdDriver);
    const scDriver = useSelector((state) => state.driverObject.scDriver);
    const { enqueueSnackbar } = useSnackbar();
    const { web3, account, connected } = useSelector((state) => state.web3);

    const showNotification = (msg) => {
        enqueueSnackbar(msg, {
            ...notificationConfig,
            variant: 'error',
        });
    };

    const fetchData = useCallback(async () => {
        if (!bkdDriver || !bkdDriver.headers)
            return;

        setIsLoading(true);
        const id = history.location.pathname.split('/products/')[1];

        const res = await bkdDriver.getProductById(id);
        setData(res);
        setIsLoading(false);
    }, [history.location.pathname, bkdDriver]);

    useEffect(() => {
        fetchData();
    }, [fetchData, history.location.pathname]);

    const verifyOrder = async (escrowId, timeToEnd) => {
        if (!bkdDriver || !bkdDriver.headers)
            return;
            
        try {
            const { id } = await bkdDriver.getOrderByEscrow(escrowId);
            if (id) {
                return id;
            } else {
                await sleep(2000);
                if (Date.now() > timeToEnd) {
                    return false;
                }
                return verifyOrder(escrowId, timeToEnd);
            }
        } catch (error) {
            console.log('error ', error);
            await sleep(2000);
            if (Date.now() > timeToEnd) {
                return false;
            }
            return verifyOrder(escrowId, timeToEnd);
        }
    };

    const purchaseProduct = async () => {
        setIsLoading(true);

        const createdAt = Math.round(new Date().getTime() / 1000);
        const escrowWithdrawableTime = createdAt + 900;
        const escrowDisputableTime = createdAt + 120;
        try {
            // const { transactionHash: transactionHashApprove } =
            //     await tokenContract.methods
            //         .approve(
            //             process.env.REACT_APP_ESCROW_CONTRACT_ADDRESS,
            //             toWei(web3, data.price)
            //         )
            //         .send({ from: account });

            // await web3.eth.getTransactionReceipt(transactionHashApprove);

            // const result = await escrowContract.methods
            //     .purchase(
            //         data.id,
            //         data.merchant.walletAddress,
            //         toWei(web3, data.price),
            //         escrowWithdrawableTime,
            //         escrowDisputableTime
            //     )
            //     .send({ from: account });

            const priceAmount = toWei(web3, data.price);
            const balance = await scDriver.getTokenBalance();
            if(Number(balance.toString()) < Number(priceAmount)) {
                showNotification('User does not have enough balance.');                
                setIsLoading(false);
                return
            }

            const result = await scDriver.purchase(
                data.id,
                data.merchant.walletAddress,
                priceAmount,
                escrowDisputableTime,
                escrowWithdrawableTime,
                {gasLimit: 600000}
            )
            const receipt = await result.wait();
            console.log('purchase receipt', receipt);
            const escrow = receipt.events?.filter((x) => x.event === "Escrowed");
            const _escrowId = escrow[0].args._escrowId.toString();
            console.log('purchase _escrowId', _escrowId);

            // const { transactionHash: transactionHashPurchase } = result;

            // const purchaseReceipt = await web3.eth.getTransactionReceipt(
            //     transactionHashPurchase
            // );
            // const blockLog = purchaseReceipt.logs.filter(
            //     (elem) =>
            //         elem.address.toLowerCase() ===
            //         process.env.REACT_APP_ESCROW_CONTRACT_ADDRESS.toLowerCase()
            // )[0];

            // const pastEvents = await escrowContract.getPastEvents('allEvents', {
            //     fromBlock: blockLog.blockNumber,
            //     toBlock: blockLog.blockNumber,
            // });
            // const escrowId = pastEvents[0].returnValues._escrowId;
            const endRequestsAt = Date.now() + 120000;
            const orderId = await verifyOrder(_escrowId, endRequestsAt);
            if (orderId) {
                history.push(`/orders/${orderId}`);
            }

            setIsLoading(false);
        } catch (error) {
            console.log(error, 'error');

            setIsLoading(false);
        }
    };

    // React.useEffect(() => {
    //     if (escrowContract && tokenContract) return;
    //     if (!connected) return;

    //     const EscrowContract = new web3.eth.Contract(
    //         escrowABI,
    //         process.env.REACT_APP_ESCROW_CONTRACT_ADDRESS
    //     );

    //     const TokenContract = new web3.eth.Contract(
    //         tokenABI,
    //         process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS
    //     );

    //     setEscrowContract(EscrowContract);
    //     setTokenContract(TokenContract);
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [web3]);

    return (
        <Layout title="Product">
            {data && (
                <div className="product-detail-page">
                    <div className="block block-rounded">
                        <div className="block-header block-header-default">
                            <h3 className="block-title">{data.name}</h3>
                        </div>
                        <div className="block-content">
                            <div className="main-info">
                                <div className="product-image">
                                    <img src={`${data.image}`} alt="" />
                                </div>

                                <div className="product-name">
                                    <p>{data.name}</p>
                                    <p>
                                        <strong>Price: </strong>
                                        {data.price} MTO
                                    </p>
                                </div>
                            </div>

                            <div className="info">
                                <p className="label">Description:</p>
                                <p>{data.description}</p>
                            </div>

                            <div className="info">
                                <p className="label">Location:</p>
                                <p>{data.shopAddress}</p>
                            </div>

                            <div className="info">
                                <p className="label">Merchant Info:</p>
                                <div className="merchant-info">
                                    <Person />
                                    <a className="merchant-name">
                                        {data.merchant.name}
                                    </a>
                                </div>
                            </div>

                            <div className="actions">
                                <Button
                                    color="secondary"
                                    variant="contained"
                                    onClick={purchaseProduct}
                                    disabled={!connected}
                                >
                                    Purchase
                                </Button>
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
        </Layout>
    );
};

export default ProductDetailPage;
