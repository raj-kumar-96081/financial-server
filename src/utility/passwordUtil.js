const generateTemporaryPassword = (desiredlength) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';

    let result = '';
    for (i = 0; i < desiredlength; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

module.exports = { generateTemporaryPassword };