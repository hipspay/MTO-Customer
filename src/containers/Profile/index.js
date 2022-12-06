import React, { useState, useEffect } from 'react';
import { IconButton, Button, TextField } from '@material-ui/core';
import { AccountCircle, Edit } from '@material-ui/icons';
import Dropzone from 'react-dropzone';
import { useSelector } from 'react-redux';
import Layout from '../../components/Layout';
import Spinner from '../../components/Common/Spinner';
// import { getProfile, updateProfile } from '../../apis/profile.api';
import './style.scss';

const ProfilePage = () => {
    const { web3, account, connected } = useSelector((state) => state.web3);

    const [data, setData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const bkdDriver = useSelector((state) => state.driverObject.bkdDriver);

    const profile = async () => {
        console.log('profile1');
        if (!bkdDriver || !bkdDriver.headers)
            return;
        
        console.log('profile2', bkdDriver);
        setIsLoading(true);

        const res = await bkdDriver.getProfile({address: account});

        console.log('res', res);
        setData(res);
        setIsLoading(false);
    }
   
    useEffect(() => {
        profile();
    }, [account]);

    const [isEditingMode, setIsEditingMode] = useState(false);
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [shippingAddress, setShippingAddress] = useState('');
    const [externalLink, setExternalLink] = useState('');

    const changeAvatar = (value) => {
        setAvatar(value[0]);
    };

    useEffect(() => {
        if (isEditingMode) {
            setName(data.name);
            setShippingAddress(data.shippingAddress);
            setExternalLink(data.externalLink);
        }
    }, [data.externalLink, data.name, data.shippingAddress, isEditingMode]);

    const update = async () => {
        if (!bkdDriver || !bkdDriver.headers)
            return;

        setIsLoading(true);
        const updateResult = await bkdDriver.updateProfile({ name, shippingAddress, externalLink, address:account });
        setData(updateResult);
        setIsLoading(false);
        setIsEditingMode(false);
    };

    return (
        <Layout title="Profile">
            <div className="profile-page">
                <div className="user-avatar">
                    {isEditingMode ? (
                        <Dropzone
                            name="file"
                            className="drop-zone"
                            multiple={false}
                            accept="image/*"
                            onDrop={changeAvatar}
                        >
                            {avatar ? (
                                <img src={avatar.preview} alt="" />
                            ) : (
                                <Button className="choose-btn">
                                    Choose Image
                                </Button>
                            )}
                        </Dropzone>
                    ) : (
                        <AccountCircle />
                    )}
                </div>

                <div className="form-field name">
                    {isEditingMode ? (
                        <TextField
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    ) : (
                        <h1>{data.name}</h1>
                    )}
                </div>

                <div className="form-field">
                    <label>Address:</label>
                    {isEditingMode ? (
                        <TextField
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                        />
                    ) : (
                        <span>{data.shippingAddress}</span>
                    )}
                </div>

                <div className="form-field">
                    <label>Web Site Link:</label>
                    {isEditingMode ? (
                        <TextField
                            value={externalLink}
                            onChange={(e) => setExternalLink(e.target.value)}
                        />
                    ) : (
                        <span>{data.externalLink}</span>
                    )}
                </div>

                {!isEditingMode ? (
                    <IconButton
                        onClick={() => setIsEditingMode(true)}
                        className="edit-btn"
                    >
                        <Edit />
                    </IconButton>
                ) : (
                    <div className="actions">
                        <Button
                            color="default"
                            variant="contained"
                            onClick={() => setIsEditingMode(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="primary"
                            variant="contained"
                            onClick={update}
                        >
                            Update
                        </Button>
                    </div>
                )}

                {isLoading && (
                    <div className="overlay">
                        <Spinner />
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ProfilePage;
