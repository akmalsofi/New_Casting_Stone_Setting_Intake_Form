const axios = require('axios');
require('dotenv').config();

async function attachments(sheetId, attachmentsId) {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://api.smartsheet.com/2.0/sheets/${sheetId}/attachments/${attachmentsId}`,
        headers: {
            'Authorization': `Bearer ${process.env.smartsheet_key}`
        }
    };

    return axios.request(config)
        .then((response) => {
            console.log(14145, JSON.stringify(response.data));
            let attachmentName = response.data.name
            if (attachmentName.startsWith('GhKSEe2BplcLFfGu')) {
                // Your logic here
                console.log('Attachment name starts with GhKSEe2BplcLFfGu');
                return null;
            }
            let ret = { id: response.data.id, rowId: response.data.parentId }
            console.log(1616, ret)
            return ret
        })
        .catch((error) => {
            console.log(error);
        });
}

module.exports = {
    attachments
};
