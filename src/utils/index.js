export const generateSignature = () => 'wallet_address';

export const getAddress = () => 'wallet_address';

export const parseDate = (d) => {
    const date = new Date(d).getDate();
    const month = new Date(d).getMonth() + 1;
    const year = new Date(d).getFullYear();

    const hours = new Date(d).getHours();
    const minutes = new Date(d).getMinutes();
    return `${date}/${month}/${year} ${hours}:${minutes}`;
};
export const toWei = (web3, amount) =>
    web3.utils.toWei(web3.utils.toBN(amount), 'ether');

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getStandardTime = (time) => {
    const standardTimestamp = new Date(time).getTime() + new Date(time).getTimezoneOffset() * 60 * 1000
    const standardTime = new Date(standardTimestamp);
    return standardTime;
};