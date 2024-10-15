const moment = require('moment');
const axios = require('axios');
const { getTicketByRowId } = require("./hsdeal");
require('dotenv').config();


//getTicketByRowId

async function createNote(comment, hsTicketId) {
    //let hsId=await getTicketByRowId(rowId);
    const currentTimestampUTC = moment().utc().format();


    console.log(526665256, hsTicketId)
    console.log(52525612, comment)
    console.log(525256, comment)


    let data = JSON.stringify({
        "associations": [
            {
                "types": [
                    {
                        "associationCategory": "HUBSPOT_DEFINED",
                        "associationTypeId": 214
                    }
                ],
                "to": {
                    "id": `${hsTicketId}`
                }
            }
        ],
        "properties": {
            // "hs_timestamp": "2024-05-31T12:34:56Z",
            "hs_timestamp": `${currentTimestampUTC}`,
            "hs_note_body": `${comment}`
        }
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.hubapi.com/crm/v3/objects/notes',
        headers: {
            'authorization': `Bearer ${process.env.hs_key}`,
            'content-type': 'application/json'
        },
        data: data
    };

    return axios.request(config)
        .then((response) => {
            console.log(4004140, JSON.stringify(response.data));
            return response.data.id
        })
        .catch((error) => {
            console.log(error);
        });

}

async function updateNote(noteId) {
    console.log(62679, noteId)
    let data = JSON.stringify({
        "properties": {
            "last_platform": "SMARTSHEET"
        }
    });

    let config = {
        method: 'patch',
        maxBodyLength: Infinity,
        url: `https://api.hubapi.com/crm/v3/objects/notes/${noteId}`,
        headers: {
            'authorization': `Bearer ${process.env.hs_key}`,
            'content-type': 'application/json'
        },
        data: data
    };

    axios.request(config)
        .then((response) => {
            console.log(9777974, JSON.stringify(response.data));
        })
        .catch((error) => {
            console.log(error);
        });

}

module.exports = {
    createNote, updateNote
};