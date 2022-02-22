import { Menu, MenuItem } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useSelector, useDispatch } from 'react-redux';
import { setNetwork } from '../../store/actions/web3action';

import * as React from 'react';

import { networks } from '../../constants/networks';
import './style.scss';

export default function NetworksMenu() {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const network = useSelector((state) => state.web3.network);
    const dispatch = useDispatch();
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    async function switchToCustomNetwork(ethereum, newNetwork) {
        try {
            await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: newNetwork.chainId }],
            });
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                try {
                    await ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainName: newNetwork.chainName,
                                chainId: newNetwork.chainId,
                                rpcUrls: [newNetwork.rpcUrl],
                                nativeCurrency: newNetwork.nativeCurrency,
                            },
                        ],
                    });
                } catch (addError) {
                    // handle "add" error
                    console.log(addError);
                }
            }
            // handle other "switch" errors
        }
    }
    const handleClose = async (network) => {
        console.log(network);
        if (network && network?.chainId) {
            dispatch(setNetwork(network));
            await switchToCustomNetwork(window.ethereum, network);
            localStorage.removeItem(process.env.REACT_APP_USER_MAIN_TOKEN_KEY);
            localStorage.removeItem(process.env.REACT_APP_USER_CHAT_TOKEN_KEY);
            localStorage.setItem(
                process.env.REACT_APP_CURRENT_NETWORK,
                JSON.stringify(network)
            );
            document.location.href = '/';
        }
        setAnchorEl(null);
    };

    return (
        <div>
            <button
                className="connect-btn"
                onClick={handleClick}
            >
                <img src="/networks/NetworkIcon.png" alt="User" />
                {/* <p className="name">Network</p> */}
                {/* <ExpandMoreIcon /> */}
            </button>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                {Object.keys(networks).map((key, index) => (
                    <MenuItem onClick={() => handleClose(networks[key])}>
                        <img
                            className="networkIcon"
                            src={networks[key].icon}
                            alt="User"
                        />
                        {networks[key].chainName}
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
}
