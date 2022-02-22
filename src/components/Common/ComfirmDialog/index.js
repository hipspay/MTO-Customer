import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    TextField,
} from '@material-ui/core';

import './style.scss';

const ConfirmDialog = ({ open, onClose, handler, content, isDispute }) => {
    const [description, setDescription] = useState('');
    const [error, setError] = useState(false);
    const submitForm = async () => {
        if (description === '') {
            setError(true);
        } else {
            setError(false);
            handler(description);
        }
    };
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogContent>
                <DialogContentText>{content}</DialogContentText>
                {isDispute && (
                    <div className="form-field">
                        <span className="label w-100">
                            Give a detail description:
                        </span>

                        <TextField
                            name="description"
                            multiline
                            rows={4}
                            variant="outlined"
                            error={error}
                            helperText="Detail reason for dispute, max 500 character."
                            value={description}
                            onChange={(e) => {
                                setDescription(e.target.value);
                            }}
                        />
                    </div>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={submitForm} color="primary" autoFocus>
                    Yes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

ConfirmDialog.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    handler: PropTypes.func,
    content: PropTypes.string,
    isDispute: PropTypes.bool,
};

ConfirmDialog.defaultProps = {
    open: false,
    onClose: () => {},
    handler: () => {},
    content: '',
    isDispute: false,
};

export default ConfirmDialog;
