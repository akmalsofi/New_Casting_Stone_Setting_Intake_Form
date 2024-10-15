const axios = require('axios');
const { getRow } = require("./src/row");
const { createNote, updateNote } = require("./src/createnote");
const { getComment, handlingComment, updateSmrtSheetRow } = require("./src/smrtsheetcomment");
const { createContactHs } = require("./src/hscontact");
const { constructObject, fromHubspot } = require("./src/auxfunction");
const { createHsDeal, getDealByRowId, deleteDeal, updateDeal } = require("./src/hsdeal");
// const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { attachments } = require("./src/attachment")
require('dotenv').config();




module.exports = async function (context, req) {
    let latestCommentColumnidupdate = false;
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
    console.log('Received event:', context);
    console.log('Received context.req.body;:', context.req.body);
    //const apiUserId=314572331607940;

    let inObj = context.req.body;
    /*   try {
          inObj = JSON.parse(context.req.body);
      } catch (parseError) {
          console.error('Failed to parse event body:', parseError);
          return { statusCode: 400, body: 'Invalid JSON' };
      } */

    console.log('Parsed input object:', inObj);


    try {
        if (inObj.challenge) {
            /*  return {
                 statusCode: 200,
                 body: JSON.stringify({ smartsheetHookResponse: inObj.challenge })
             }; */
            context.res = {
                statusCode: 200,
                body: JSON.stringify({ smartsheetHookResponse: inObj.challenge })
            };
        }
        // if (inObj.events[0].userId===apiUserId){
        //   console.log('inorder to stop looping',apiUserId)
        //   process.exit()
        // }

        const sheetId = inObj.scopeObjectId;
        const filteredEvents = inObj.events || [];
        let latestRowId = null;
        console.log('Filtered events:', filteredEvents);
        const latestCommentColumnidupdate = filteredEvents.some(item => item.columnId === 2103835565969284);
        console.log("latestCommentColumnidupdate", latestCommentColumnidupdate)
        //attachments

        //   let attachmentRow = filteredEvents
        //   .filter(event => event.objectType === 'attachment')
        //   .reduce((latest, current) => {
        //     return (!latest || new Date(current.timestamp) > new Date(latest.timestamp)) ? current : latest;
        //   }, null);
        //   console.log(9191119,attachmentRow)
        //   let attachmentLink
        //   if(attachmentRow?.id){
        //      attachmentLink= attachments(sheetId,attachmentRow?.id)
        //      console.log(7557,attachmentLink)

        //   }

        let latestRowEvent = filteredEvents
            .filter(event => event.objectType === 'row' || event.objectType === 'comment' || event.objectType === 'attachment')
            .reduce((latest, current) => {
                return (!latest || new Date(current.timestamp) > new Date(latest.timestamp)) ? current : latest;
            }, null);

        if (!latestRowEvent) {
            console.log('No relevant row or comment events found.');
            //return { statusCode: 200, body: 'No relevant events to process' };
        }

        console.log("Latest row event:", latestRowEvent);
        const deletedRow = filteredEvents.filter(event =>
            event.objectType === 'row' && event.eventType === 'deleted'
        );
        console.log(4994, deletedRow)
        if (deletedRow && deletedRow.length > 0) {
            latestRowEvent = deletedRow.reduce((latest, current) => {
                return new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest;
            }, deletedRow[0]);;
        }




        // if (latestRowEvent.eventType === 'deleted' || deletedRow.eventType === 'deleted') {
        if (latestRowEvent.eventType === 'deleted') {

            //const rowIdToDelete = latestRowEvent.id;
            const rowIdToDelete = latestRowEvent.id;
            console.log('Delete event ID:', rowIdToDelete);

            if (rowIdToDelete) {
                try {
                    const hsDealId = await getDealByRowId(rowIdToDelete);
                    console.log('HubSpot Deal ID to delete:', hsDealId);
                    const deletedDeal = await deleteDeal(hsDealId);
                    console.log('Deleted Deal:', deletedDeal);
                } catch (dealError) {
                    console.error('Error handling delete event:', dealError);
                    //sns(dealError)
                }
            }
        } else if (latestRowEvent.eventType === 'created' || latestRowEvent.eventType === 'updated') {
            let fileId

            let createdCellEventId = latestRowEvent.id;
            if (latestRowEvent.objectType === 'attachment') {
                let res = await attachments(sheetId, createdCellEventId)
                if (res == null) {
                    console.log('avoiding cycle')
                    process.exit(1)
                }
                fileId = res?.id
                console.log(7557, res)
                createdCellEventId = res?.rowId

            }
            latestRowId = createdCellEventId
            console.log('Created or updated cell event ID:', createdCellEventId);

            try {
                //   let attachmentId;
                //   let attachmentLink;
                const response = await getRow(sheetId, createdCellEventId);
                console.log('Row data:', response);


                let objectConstructed = constructObject(response.cells, response.columns)
                //   if(response?.attachments){
                //     attachmentId=response?.attachments[0].id
                //   attachmentLink= attachments(sheetId,attachmentId)
                //   objectConstructed.attachmentLink=attachmentLink
                // }
                console.log(1033011, objectConstructed)

                let latest_comment = null
                if (latestCommentColumnidupdate) {
                    latest_comment = objectConstructed['Latest Comment']

                }

                //let latest_comment = objectConstructed['Latest Comment']
                console.log(11511, latest_comment)
                let comment
                if (latest_comment === null) { //bcause smartsheet fires 2 types of comment on with email(in this case we have to extract comment) other only comment
                    comment = null
                }
                const parts = latest_comment?.split(" - ");
                console.log(117117, parts)

                if (parts?.length === 1) {
                    comment = parts[0]
                } else if (parts?.length > 1) {
                    comment = parts[1]
                }

                //let comment = parts ? parts [1] : null

                console.log('latest_comment', comment)
                const email = objectConstructed['Email Address'];
                console.log('Email121:', email);
                let hsContact;
                //dropdown internal value mappings
                //let reasonForCall={"Repairs / Service Technician":"Repairs and Service Technicians","Nuetec / FSE's":"Neutec / FSE's","Internal Request":,"Evaluation"}

                const dealObj = {
                    "dealname": objectConstructed['Hs deal name'],
                    "sap_customer_no_": objectConstructed['SAP Customer Number'],
                    "new_item___stone_setting_job_": objectConstructed['New item / Stone Setting Job*'],
                    "if_file_is_too_large__please_upload_link_below": objectConstructed['If file is too large, please upload link below'],
                    "job_description": objectConstructed['Job Description*'],
                    "agent_sales": objectConstructed['Sales Agent*'],
                    "plating_": objectConstructed['Plating'],
                    "metal_type_": objectConstructed['Metal Type*'],//this is metal property but it internal is not is different
                    "card_order_quantity": objectConstructed['Card Order Quantity*'],
                    "projected_quantity__ex__annual_": objectConstructed['Projected Quantity (Ex: Annual)'],
                    "sample_or_cad_drawing_provided_by_customer_": objectConstructed['Sample or CAD drawing provided by Customer*'],
                    "is_a_physical_sample_needed_by_customer__": objectConstructed['Is a Physical Sample Needed by customer?*'],
                    "add_hallmark__quality_stamp__trademark": objectConstructed['Add Hallmark (Quality Stamp)/Trademark'],
                    "hallmark_process__laser_or_mold_": objectConstructed['Hallmark Process (Laser Or Mold)*'],
                    "finishing_": objectConstructed['Finishing*'],
                    "does_this_job_require_stone_setting": objectConstructed['Does this job require stone setting?*'],
                    "size__for_rings_only_": objectConstructed['Size (for rings only)'],
                    "oxidizing": objectConstructed['Oxidizing'],
                    "new_or_reorder_stones": objectConstructed['New or Reorder Stones*'],
                    "gemstones_info__qty___size__shape__color__lab_or_natural__grade__theo_new_agent_repeat_": objectConstructed['Gemstones Info: QTY - Size, Shape, Color, Lab or N'],
                    "gemstone_special_order_sku__theo_new_agent_repeat_": objectConstructed['Gemstone Special order SKU (Theo New/Agent Repeat)'],
                    "upload_file___cad_and_or_trademark": objectConstructed['Upload File - Cad and/or Trademark'],
                    "pipeline": "788111",
                    "dealstage": "2690563",
                    "smartsheet_row_id": response.id,
                    "smartsheet_sheet_id": sheetId,
                    // "smartsheet_file_link": objectConstructed['attachmentLink'],
                    "smartsheet_file_id": fileId
                }
                console.log(93139, dealObj);
                let hsDistinguish = objectConstructed['hsdealid'];
                console.log(106601, hsDistinguish)
                if (!hsDistinguish) {
                    let crtComment = comment
                    console.log("createdeal")
                    //createdeal
                    // await createContactHs(email).then(res => {
                    //     console.log(88478, res)
                    //     hsContact = res
                    // }).catch(err => {
                    //   //sns(err)
                    //     console.log(90197, err)
                    // })
                    //await createHsDeal(dealObj, hsContact)//create deal
                    await createHsDeal(dealObj)//create deal
                        .then(async res => {
                            console.log(95459, res);
                            let hsDealId = res.id;
                            try {
                                console.log(9545909, crtComment, 'after', res.id);
                                if (latest_comment) {
                                    await createNote(crtComment ?? '', res.id)
                                }

                                //smartsheetapiupdaterow for hs deal id we need sheet id row id column id
                                let columnId = 1093399076884356;
                                await updateSmrtSheetRow(sheetId, latestRowId, columnId, hsDealId);//deal id
                            } catch (commentError) {
                                console.error('Error handling comments:', commentError);
                                //sns(commentError)
                            }
                        })
                        .catch(dealError => {
                            console.error('Error creating HS deal:', dealError);
                            //sns(dealError)
                        });
                }
                else {
                    //update deal
                    console.log("update deal")
                    console.log('dealObj453', dealObj)
                    let res = await updateDeal(dealObj, hsDistinguish)
                    console.log('comment145', comment)
                    let fromHs = fromHubspot(comment);
                    console.log(203302, fromHs)
                    if (comment && !fromHs) {
                        console.log(19565909, hsDistinguish)
                        let noteId = await createNote(comment, hsDistinguish)
                        console.log(19909, noteId)
                        await updateNote(noteId)

                    }
                    // await createNote(comment ?? '',hsDistinguish)}

                }




            } catch (rowError) {
                console.error('Error handling created/updated cell event:', rowError);
                //sns(rowError)
            }
        }

    } catch (error) {
        //sns(error)
        console.error('General error:', error);
        return { statusCode: 500, body: 'Internal Server Error' };
    }

    return { statusCode: 200, body: 'Event processed successfully' };
};
