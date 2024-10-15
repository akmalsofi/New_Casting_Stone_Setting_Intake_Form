function constructObject(cells, columns) {
    let result = {};

    // Iterate through the columns array
    for (let i = 0; i < columns.length; i++) {
        let column = columns[i];
        let cell = cells[i];

        // Use the title of the column as the key and the corresponding cell value as the value
        if (cell && cell.value !== undefined) {
            result[column.title] = cell.value;
        } else {
            result[column.title] = null; // or any default value you prefer
        }
    }
    let resultData = transformOptions(result)

    return resultData;
}

function transformOptions(data) {
    const keysToModify = [
        'Finishing*',
        'Add Hallmark (Quality Stamp)/Trademark',
        'Is a Physical Sample Needed by customer?*',
        'Sample or CAD drawing provided by Customer*',
        'Metal Type*',
        'Plating',
        'New item / Stone Setting Job*'
    ];

    keysToModify.forEach(key => {
        if (data[key]) {
            data[key] = data[key].replace(/, /g, ';');
        }
    });
    return data

}
function fromHubspot(s) {
    if (s?.startsWith("[HUBSPOT]:")) {
        return true
    } else {
        return false
    }
}
module.exports = {
    constructObject, fromHubspot
};
