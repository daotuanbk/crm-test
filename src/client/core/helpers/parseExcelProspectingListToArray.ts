export const parseExcelProspectingListToArray = (rows: any[]) => {
    const items = [];
    for (const i in rows) {
        const row = rows[i];
        const item = {
            name : row.name,
            sourceName: row.sourceName,
            source: row.source,
            centreId: row.centreId,
            assigneeId: row.assigneeId,
            comboId: row.comboId,
            comboName: row.comboName,
        };
        for (let j = 0; j < 10; j++) {
            if (row[`course${i}._id`]) {
                // @ts-ignore
                item.productOrder.courses.push({
                    _id: row[`course${i}._id`],
                    name: row[`course${i}.name`],
                    shortName: row[`course${i}.shortName`],
                    tuitionBeforeDiscount: row[`course${i}.tuitionBeforeDiscount`],
                } as any);
            }
        }
        items.push(item);
    }
    return items;
};
