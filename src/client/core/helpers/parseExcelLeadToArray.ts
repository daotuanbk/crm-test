import uuid from 'uuid';

export const parseExcelLeadToArray = (rows: any[]) => {
    const items = [];
    for (const i in rows) {
        const row = rows[i];
        const item = {
            currentStage : row.currentStage,
            currentStatus: row.currentStatus,
            tuition: {
                totalAfterDiscount: row['tuition.totalAfterDiscount'],
                remaining: row['tuition.remaining'],
            },
            productOrder: {
                courseCount: row.courseCount,
                comboId: row.comboId,
                comboName: row.comboName,
                courses: [],
            },
        };
        for (let j = 0; j < 10; j++) {
            if (row[`course${j}._id`]) {
                // @ts-ignore
                item.productOrder.courses.push({
                    _id: row[`course${j}._id`],
                    name: row[`course${j}.name`],
                    shortName: row[`course${j}.shortName`],
                    description: row[`course${j}.description`],
                    tuitionBeforeDiscount: row[`course${j}.tuitionBeforeDiscount`],
                    stage: row[`course${j}.stage`],
                    status: row[`course${j}.status`],
                    comment: row[`course${j}.comment`],
                    index: uuid.v4(),
                } as any);
            }
        }
        const contactInfo = {
            contactBasicInfo: {
                firstName: row.firstName,
                lastName: row.lastName,
                fullName: row.fullName,
                phone: row.phone,
                email: row.email,
                fb: row.fb,
                address: row.address,
            },
            schoolInfo: {
                schoolName: row.schoolName,
                majorGrade: row.majorGrade,
            },
            prospectingListId: row.prospectingListId,
            centre: row.centreId,
        };
        (item as any).contactInfo = contactInfo;
        items.push(item);
    }
    return items;
};
