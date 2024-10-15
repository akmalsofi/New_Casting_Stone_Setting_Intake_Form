const axios = require('axios');
require('dotenv').config();



//async function createHsDeal(ticket,hsContactId) {
async function createHsDeal(deal) {
    let data = JSON.stringify({
        "properties": deal
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.hubapi.com/crm/v3/objects/deals',
        headers: {
            'authorization': `Bearer ${process.env.hs_key}`,
            'content-type': 'application/json'
        },
        data: data
    };

    return axios.request(config)
        .then(response => {
            console.log(2552, response.data);
            //resolve(response.data);
            return (response.data);
        })
        .catch(error => {
            console.error("Error creating HS deal:", error);
            //reject(error);
            return (error);
        });
}

async function getDealByRowId(rowId) {

    let config = {
        method: 'get',
        maxBodyLength: Infinity,//https://api.hubapi.com/crm/v3/objects/deals/?archived=false
        url: `https://api.hubapi.com/crm/v3/objects/deals/${rowId}?archived=false&idProperty=smartsheet_row_id`,
        //url: `https://api.hubapi.com/crm/v3/objects/tickets/${rowId}?archived=false&idProperty=smartsheet_rowid`,
        headers: {
            'authorization': `Bearer ${process.env.hs_key}`
        }
    };

    return axios.request(config)
        .then((response) => {
            console.log(934, JSON.stringify(response.data));
            return response.data.properties.hs_object_id
        })
        .catch((error) => {
            console.log(464, error);
        });

}
async function deleteDeal(rowId) {

    console.log(5151, rowId)
    let config = {
        method: 'delete',
        maxBodyLength: Infinity,
        url: `https://api.hubapi.com/crm/v3/objects/deals/${rowId}`,
        headers: {
            'authorization': `Bearer ${process.env.hs_key}`
        }
    };

    return axios.request(config)
        .then((response) => {
            console.log(625, JSON.stringify(response.data));
            return response.data
        })
        .catch((error) => {
            console.log(68, error);
        });


}
async function updateDeal(updatedDeal, hsDealId) {
    console.log(96169, updatedDeal)
    console.log(96167, hsDealId)

    let data = JSON.stringify({
        "properties": updatedDeal
    });

    let config = {
        method: 'patch',
        maxBodyLength: Infinity,
        url: `https://api.hubapi.com/crm/v3/objects/deals/${hsDealId}`,
        headers: {
            'authorization': `Bearer ${process.env.hs_key}`,
            'content-type': 'application/json'
        },
        data: data
    };

    return axios.request(config)
        .then((response) => {
            console.log(JSON.stringify(response.data));
            return response.data
        })
        .catch((error) => {
            console.log(error);
        });

}

module.exports = {
    createHsDeal, getDealByRowId, deleteDeal, updateDeal
};

