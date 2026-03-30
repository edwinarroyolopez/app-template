export const generateObjectId = () => {
    const timestamp = Math.floor(Date.now() / 1000).toString(16);
    return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
        return Math.floor(Math.random() * 16).toString(16);
    }).toLowerCase();
};