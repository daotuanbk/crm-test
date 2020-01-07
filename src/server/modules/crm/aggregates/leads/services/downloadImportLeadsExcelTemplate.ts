import * as path from 'path';

export const downloadImportLeadsExcelTemplate = async (_req: any, res: any) => {
  try {
    res.download(path.join(__dirname, `../../../../../../../excel-templates/import-leads-template.xlsx`));
  } catch (error) {
    res.status(error.status || 500).send(error.message || 'Internal Server Error');
  }
};
