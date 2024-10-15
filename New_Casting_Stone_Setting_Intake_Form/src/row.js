const axios = require('axios');
require('dotenv').config();


async function getRow(sheetId, rowId) {
    /*
    console.log('in the row function', inObj)
    let sheetId = inObj.scopeObjectId
    //        let rowId = inObj.events[0].rowId
    let rowId
    //const cellEvent = inObj.events.find(el => el.objectType === 'cell' && el.eventType === "created");
    const cellEvent = inObj.events.filter(el => el.objectType === 'row' && el.eventType === "updated");
    //console.log(cellEvent);
    const latestEvent = cellEvent.reduce((latest, current) => {
        return new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest;
    });*/
    console.log(1441441, rowId);
    console.log(14161, sheetId)
    // if (rowId) {
    //     //rowId = latestEvent.rowId;
    //     rowId = latestEvent.id;
    //     console.log(14161, rowId); // Output: 5416973116477316
    // }

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://api.smartsheet.com/2.0/sheets/${sheetId}/rows/${rowId}?include=discussions,attachments,columns,columnType`,
        headers: {
            'Authorization': `Bearer ${process.env.smartsheet_key}`
        }
    };

    return axios.request(config)
        .then(async (response) => {
            return response.data
        }).catch((error) => {
            console.log(error);
        });
}

module.exports = {
    getRow
};
