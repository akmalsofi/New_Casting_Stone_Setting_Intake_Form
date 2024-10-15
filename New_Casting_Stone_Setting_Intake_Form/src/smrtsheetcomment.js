const axios = require('axios');
const { createNote } = require("./createnote");
require('dotenv').config();




async function handlingComment(filteredEvents, sheetId, hsTicketId) {
    console.log(7747, filteredEvents, sheetId)
    const createdCommentEvent = filteredEvents.find(event =>
        event.objectType === 'comment' && event.eventType === 'created'
    );

    if (createdCommentEvent) {
        console.log('Created comment event:', createdCommentEvent);

        try {
            const comment = await getComment(sheetId, createdCommentEvent.id);
            console.log('Comment data:', comment);
            await createNote(comment.text, hsTicketId)

            // Here you can add logic to create a note on HubSpot using the comment data
        } catch (commentError) {
            console.error('Error handling created comment event:', commentError);
        }
    }

}
async function getComment(sheetId, commentId) {

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://api.smartsheet.com/2.0/sheets/${sheetId}/comments/${commentId}`,
        headers: {
            'Authorization': `Bearer ${process.env.smartsheet_key}`
        }
    };

    return axios.request(config)
        .then((response) => {
            console.log(1516, JSON.stringify(response.data));
            return (response.data)
        })
        .catch((error) => {
            console.log(error);
        });
}
async function updateSmrtSheetRow(sheetId, rowId, columnId, hsTicketId) {
    console.log(48848, 'sheetId', sheetId, "rowId", rowId, "columnId", columnId, "hsTicketId", hsTicketId)
    let data = JSON.stringify([
        {
            "id": `${rowId}`,
            "cells": [
                {
                    "columnId": `${columnId}`,
                    "value": `${hsTicketId}`
                }
            ]
        }
    ]);

    let config = {
        method: 'put',
        maxBodyLength: Infinity,
        url: `https://api.smartsheet.com/2.0/sheets/${sheetId}/rows`,
        headers: {
            'Authorization': `Bearer ${process.env.smartsheet_key}`,
            'Content-Type': 'application/json'
        },
        data: data
    };

    return axios.request(config)
        .then((response) => {
            console.log(JSON.stringify(73371, response.data));
            return response.data
        })
        .catch((error) => {
            console.log(error);
        });

}

module.exports = {
    getComment, handlingComment, updateSmrtSheetRow
};
