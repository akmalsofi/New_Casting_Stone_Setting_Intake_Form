const axios = require('axios');
//const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
require('dotenv').config();

function sns(errMsg) {
    console.log('in sns function');
    var snsParams = {
        Message: errMsg || "something went wrong", /* required */
        TopicArn: "arn:aws:sns:ap-south-1:527012876185:rio_sns_notification",
    };

    const client = new SNSClient({ region: "ap-south-1" });
    const command = new PublishCommand(snsParams);

    client.send(command)
        .then(data => {
            console.log("Message sent successfully:", data);
        })
        .catch(err => {
            console.error("Error sending message:", err);
        });
}

async function createContactHs(email) {
    try {
        console.log(456654, email);
        let data = JSON.stringify({
            "properties": {
                "email": email
            }
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.hubapi.com/crm/v3/objects/contacts',
            headers: {
                'authorization': `Bearer ${process.env.hs_key}`,
                'content-type': 'application/json'
            },
            data: data
        };

        return await axios.request(config).then(response => {
            if (response.data && response.data.id) {
                console.log("Contact created with ID:", response.data.id);
                return response.data.id;
            }
        }).catch(err => {
            // sns(err)
            console.log(2992, err)
            if (err.response && err.response.data && err.response.data.message) {
                console.error("Error response from API:", err.response.data.message);
                const message = err.response.data.message;

                const regex = /Existing ID: (\d+)/;
                const match = message.match(regex);

                if (match && match[1]) {
                    const existingId = match[1];
                    console.log('Extracted ID:', existingId);
                    return existingId;
                }
                // else {
                //   console.log('ID not found in the message.');
                //   throw new Error("ID not found in the message.");
                // }
            }
            //else {
            //     console.error("Error in createContactHs function:", err.message);
            //     throw err;
            //   }
        });
    } catch (error) {
        console.error("Error in createContactHs function:", error.message);
        throw error; // Re-throw the error to be handled by the caller
    }
}

module.exports = {
    createContactHs
};
