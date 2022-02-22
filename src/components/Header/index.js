import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { IconButton, Menu, MenuItem, Button } from '@material-ui/core';
import { PermIdentity, Menu as MenuIcon } from '@material-ui/icons';
import { useHistory } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';

import Web3 from 'web3';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import axios from 'axios';
import { auth } from '../../apis/auth.api';

import {
    setWeb3Data,
    clearWeb3Data,
    Web3Object,
    web3Connected,
    setMetaMask,
    setNetwork,
} from '../../store/actions/web3action';

import ConnectButton from '../ConnectButton/index';

import useAuth from '../ConnectButton/useAuth';
import { networks } from '../../constants/networks';
// import { UserService } from "../../services/user.service";
import { setUserData } from '../../store/actions/authAction';
import { setChatJWT, setMainJWT } from '../../store/actions/jwtAction';

import NetworksMenu from '../NetworksMenu';

import './style.scss';

const Header = ({ toggleSidebar }) => {
    const history = useHistory();
    const dispatch = useDispatch();

    const { login, logout } = useAuth();

    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const { web3, account, balance, connected } = useSelector(
        (state) => state.web3
    );

    const isWeb3Connected = useSelector((state) => state.web3.web3connected);
    const metaMaskAddress = useSelector((state) => state.web3.metaMaskAddress);
    const web3Object = useSelector((state) => state.web3.web3object);
    const network = useSelector((state) => state.web3.network);

    useEffect(() => {
        const savedNetwork = JSON.parse(
            localStorage.getItem(process.env.REACT_APP_CURRENT_NETWORK)
        );
        const dispatchNetwork =
            savedNetwork || networks[process.env.REACT_APP_DEFAULT_NETWORK];
        console.log(dispatchNetwork);
        dispatch(setNetwork(dispatchNetwork));
        // if (metaMaskAddress && Object.keys(web3Object).length !== 0) {
        //   getUserBalance();
        // }
    }, [dispatch, metaMaskAddress, web3Object]);

    const providerOptions = {
        walletconnect: {
            display: {
                name: 'Mobile',
            },
            package: WalletConnectProvider,
            options: {
                infuraId: process.env.REACT_APP_INFURA_KEY,
            },
        },
    };

    const web3Modal = new Web3Modal({
        network: 'rinkeby',
        // cacheProvider: true,
        providerOptions, // required
    });

    // const disconnectWallet = async () => {
    //     dispatch(
    //         clearWeb3Data({
    //             web3: null,
    //             connected: false,
    //             balance: null,
    //             account: null,
    //         })
    //     );
    //     web3Modal.clearCachedProvider();
    //     setAnchorEl(null);

    //     sessionStorage.setItem('web3', null);
    //     sessionStorage.setItem('userBalance', null);
    //     sessionStorage.setItem('userAccount', null);
    // };

    const disconnectWallet = async () => {
        logout();
        sessionStorage.removeItem('userConnected');
        sessionStorage.removeItem('userAccount');
        sessionStorage.removeItem('userBalance');
        localStorage.removeItem('walletconnect');
        localStorage.removeItem('connectedWith');
        localStorage.removeItem('accounts');
        localStorage.removeItem('token');
        localStorage.removeItem('connectorId');
        localStorage.removeItem('userConnected');
        localStorage.removeItem('main_access_token');
        localStorage.removeItem('chat_access_token');
        dispatch(web3Connected(false));
        dispatch(Web3Object(''));
        dispatch(setUserData(''));
        dispatch(setMetaMask(''));
        dispatch(
            clearWeb3Data({
                web3: null,
                connected: false,
                balance: null,
                account: null,
            })
        );
        // handleClose();
        setAnchorEl(null);

        // window.location.reload()
    };

    const aunthenticate = async (provider) => {
        try {
            const web3 = new Web3(provider);
            const accounts = await web3.eth.getAccounts();
            const ethers = Web3.utils.fromWei(
                await web3.eth.getBalance(accounts[0]),
                'ether'
            );

            if (
                sessionStorage.getItem('userAccount') &&
                sessionStorage.getItem('userAccount').toLowerCase() ===
                    accounts[0].toLowerCase()
            ) {
                dispatch(Web3Object(web3));
                dispatch(web3Connected(true));
                dispatch(
                    setWeb3Data({
                        web3,
                        connected: true,
                        balance: Number(ethers).toFixed(2),
                        account: accounts[0],
                    })
                );
                return;
            }

            const signature = await web3.eth.personal.sign(
                process.env.REACT_APP_SIGN_STRING,
                accounts[0]
            );
            const result = await auth(signature);
            if (result) {
                localStorage.setItem('token', result.data.token);
                sessionStorage.setItem(
                    'userBalance',
                    Number(ethers).toFixed(2)
                );
                sessionStorage.setItem('userAccount', accounts[0]);
                dispatch(Web3Object(web3));
                dispatch(web3Connected(true));
                dispatch(
                    setWeb3Data({
                        web3,
                        connected: true,
                        balance: Number(ethers).toFixed(2),
                        account: accounts[0],
                    })
                );
            }
        } catch (error) {
            console.log(error);
            if (error && error.code === 4001) {
                sessionStorage.removeItem('userBalance');
                sessionStorage.removeItem('userAccount');
                sessionStorage.removeItem('userConnected');
                localStorage.removeItem('token');
                localStorage.removeItem('walletconnect');
                localStorage.removeItem('connectedWith');
                localStorage.removeItem('accounts');
                localStorage.removeItem('connectorId');
                localStorage.removeItem('userConnected');

                dispatch(Web3Object(''));
                dispatch(web3Connected(false));
                dispatch(setUserData(''));
                dispatch(setMetaMask(''));
                dispatch(
                    clearWeb3Data({
                        web3: null,
                        connected: false,
                        balance: null,
                        account: null,
                    })
                );
            }
        }
    };

    // React.useEffect(() => {
    //     if (web3) {
    //         aunthenticate();
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [web3]);

    // const connectWallet = async () => {
    //     localStorage.removeItem('walletconnect');
    //     const provider = await web3Modal.connect();
    //     // Subscribe to accounts change
    //     provider.on('accountsChanged', (accounts) => {
    //         if (accounts.length === 0) {
    //             disconnectWallet();
    //         }
    //         console.log('accountsChanged', accounts);
    //     });

    //     // Subscribe to chainId change
    //     provider.on('chainChanged', (chainId) => {
    //         console.log('chainChanged', chainId);
    //     });

    //     // Subscribe to provider connection
    //     provider.on('connect', (info) => {
    //         console.log('connect', info);
    //     });

    //     // Subscribe to provider disconnection
    //     provider.on('disconnect', (error) => {
    //         console.log('disconnect', error);
    //     });

    //     const web3 = new Web3(provider);
    //     const accounts = await web3.eth.getAccounts();
    //     const ethers = Web3.utils.fromWei(
    //         await web3.eth.getBalance(accounts[0]),
    //         'ether'
    //     );
    //     dispatch(
    //         setWeb3Data({
    //             web3,
    //             connected: true,
    //             balance: Number(ethers).toFixed(2),
    //             account: accounts[0],
    //         })
    //     );

    //     sessionStorage.setItem('userBalance', Number(ethers).toFixed(2));
    //     sessionStorage.setItem('userAccount', accounts[0]);
    //     // saveUser(accounts[0], web3);
    //     dispatch(Web3Object(web3));
    //     dispatch(web3Connected(true));
    // };

    const connectWallet = async (provider) => {
        aunthenticate(provider);
    };

    const visitProfilePage = () => {
        history.push('/profile');
        setAnchorEl(null);
    };

    return (
        <div className="app-header">
            <div className="container">
                <div>
                    <Button className="toggle-btn" onClick={toggleSidebar}>
                        <MenuIcon />
                    </Button>
                </div>
                <div className="user-menu">
                    {/* {!connected && (
                        <button
                            className="connect-btn"
                            onClick={() => connectWallet()}
                        >
                            Connect Wallet
                        </button>
                    )} */}

                    {!isWeb3Connected ? (
                        <div className="">
                            <ConnectButton
                                connectWallet={connectWallet}
                                handleLogout={disconnectWallet}
                            />
                        </div>
                    ) : (
                        <></>
                    )}

                    {isWeb3Connected && (
                        <>
                            <IconButton onClick={handleClick}>
                                <PermIdentity />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={handleClose}>
                                    ETH Address: {account}
                                </MenuItem>
                                <MenuItem onClick={handleClose}>
                                    ETH Balance: {balance}
                                </MenuItem>
                                <MenuItem onClick={handleClose}>
                                    MTO Balance
                                </MenuItem>
                                <MenuItem onClick={visitProfilePage}>
                                    Profile
                                </MenuItem>
                                <MenuItem onClick={disconnectWallet}>
                                    Disconnect
                                </MenuItem>
                            </Menu>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

Header.propTypes = {
    toggleSidebar: PropTypes.func,
};

Header.defaultProps = {
    toggleSidebar: () => {},
};

export default Header;
