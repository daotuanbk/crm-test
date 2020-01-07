const splitName = (name: string) => {
  return {
    firstName: name ? name.trim().split(' ').slice(0, -1).join(' ') : '',
    lastName: name ? name.trim().split(' ').slice(-1).join(' ') : '',
  };
};

export const parseExcelContactToArray = (rows: any[]) => {
  const items = [];
  for (const i in rows) {
    const row = rows[i];
    const item = {};
    const name = splitName(row['Student name ']);
    const contactInfo = {
      contactBasicInfo: {
        firstName: name.firstName,
        lastName: name.lastName,
        fullName: row['Student name '],
        phone: row['Student phone '],
        email: '',
        fb: '',
        address: row['Address '],
      },
      contactRelations: [
        {
          fullName: row['Parent name '] || '',
          phone: row['Parent phone '] ? `${row['Parent phone ']}` : '',
          userType: 'parent',
        },
      ],
      schoolInfo: {
        schoolName: row['School name '] || '',
      },
      prospectingListId: row.prospectingListId,
      centre: row.centreId,
    };
    (item as any).contactInfo = contactInfo;
    items.push(item);
  }
  return items;
};
