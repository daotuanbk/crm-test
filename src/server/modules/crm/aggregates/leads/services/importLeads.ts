import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import { readFile, utils } from 'xlsx';
import _ from 'lodash';
import { removeEmpty } from '@app/core';
import uuid from 'uuid';
import moment from 'moment';
import { execCreateLead, validateLeadInfo } from './create';
import { execAddFamilyMember, validateFamilyMemberInfo } from './addFamilyMember';

const columnKeys = {
  customerName: 'A',
  customerPhoneNumber: 'B',
  customerEmail: 'C',
  customerGender: 'D',
  customerAddress: 'E',
  customerSchool: 'F',
  customerDOB: 'G',
  customerFacebook: 'H',
  customerZalo: 'I',

  candidateName: 'J',
  candidatePhoneNumber: 'K',
  candidateEmail: 'L',
  candidateGender: 'M',
  candidateAddress: 'N',
  candidateSchool: 'O',
  candidateDOB: 'P',
  candidateFacebook: 'Q',
  candidateZalo: 'R',
  candidateRelation: 'S',

  leadStatus: 'AA',
  leadChannel: 'T',
  leadSource: 'U',
  leadCampaign: 'V',
  leadMedium: 'W',
  leadContent: 'X',

  centre: 'Y',
  salesman: 'Z',

  orderCandidate: 'AB',
  orderProduct: 'AC',
};

const storage = multer.diskStorage({
  destination: async (_req: any, _file: any, cb: any) => {
    const fsAccessPromise = util.promisify(fs.access);
    const fileFolder = path.join(__dirname, `../../../../../../../temp/leads`);

    // Make sure folder exists
    try {
      await fsAccessPromise(fileFolder);
    } catch (error) {
      const fsMkdirPromise = util.promisify(fs.mkdir);
      await fsMkdirPromise(fileFolder);
    }

    cb(null, path.join(__dirname, `../../../../../../../temp/leads`));
  },
  filename: async (_req: any, file: any, cb: any) => {
    const lastDot = file.originalname.lastIndexOf('.');
    const fileType = file.originalname.slice(lastDot + 1).trim();
    const filename = `${uuid.v4()}.${fileType}`;

    cb(null, filename);
  },
});

const importLeadsMiddleware = multer({
  storage,
});

const importLeads = async (req: any, res: any) => {
  try {
    // 1. authorize

    // 2. validate
    const workBook = readFile(req.file.path, {cellDates: true});
    const workSheet = workBook.Sheets[workBook.SheetNames[0]];
    const sheetData = utils.sheet_to_json(workSheet, {header: 'A'});

    const importErrors: any = [];
    for (let i = 1; i < sheetData.length; i += 1) {
      const createLeadInfo = removeEmpty({
        contactInfo: {
          fullName: _.get(sheetData[i], columnKeys.customerName, ''),
          phoneNumber: _.get(sheetData[i], columnKeys.customerPhoneNumber, ''),
          gender: _.get(sheetData[i], columnKeys.customerGender, ''),
          email: _.get(sheetData[i], columnKeys.customerEmail, ''),
          address: _.get(sheetData[i], columnKeys.customerAddress, ''),
          dob: _.get(sheetData[i], columnKeys.customerDOB) ? moment(_.get(sheetData[i], columnKeys.customerDOB), 'MM/DD/YYYY').toISOString() : '',
          facebook: _.get(sheetData[i], columnKeys.customerFacebook, ''),
          zalo: _.get(sheetData[i], columnKeys.customerZalo, ''),
          school: _.get(sheetData[i], columnKeys.customerSchool, ''),
        },
        leadInfo: {
          status: _.get(sheetData[i], columnKeys.leadStatus, ''),
          channel: _.get(sheetData[i], columnKeys.leadChannel, ''),
          source: _.get(sheetData[i], columnKeys.leadSource, ''),
          campaign: _.get(sheetData[i], columnKeys.leadCampaign, ''),
          medium: _.get(sheetData[i], columnKeys.leadMedium, ''),
          content: _.get(sheetData[i], columnKeys.leadContent, ''),
          centre: _.get(sheetData[i], columnKeys.centre, ''),
          salesman: _.get(sheetData[i], columnKeys.salesman, ''),
        },
      });

      const addFamilyMemberInfo = removeEmpty({
        contactInfo: {
          fullName: _.get(sheetData[i], columnKeys.candidateName, ''),
          phoneNumber: _.get(sheetData[i], columnKeys.candidatePhoneNumber, ''),
          gender: _.get(sheetData[i], columnKeys.candidateGender, ''),
          email: _.get(sheetData[i], columnKeys.candidateEmail, ''),
          address: _.get(sheetData[i], columnKeys.candidateAddress, ''),
          dob: _.get(sheetData[i], columnKeys.candidateDOB) ? moment(_.get(sheetData[i], columnKeys.candidateDOB), 'MM/DD/YYYY').toISOString() : '',
          facebook: _.get(sheetData[i], columnKeys.candidateFacebook, ''),
          zalo: _.get(sheetData[i], columnKeys.candidateZalo, ''),
          school: _.get(sheetData[i], columnKeys.candidateSchool, ''),
        },
        relation: _.get(sheetData[i], columnKeys.candidateRelation, ''),
      });

      const creationInfo = {
        createdBy: _.get(req.authUser, '_id', ''),
        createdAt: new Date().getTime(),
      };

      // 3. business logic
      try {
        const validationPromises: any[] = [
          validateLeadInfo(createLeadInfo),
        ];
        if (_.get(sheetData[i], columnKeys.candidateName, '') || _.get(sheetData[i], columnKeys.candidateRelation, '')) {
          validationPromises.push(validateFamilyMemberInfo(addFamilyMemberInfo));
        }
        const [validateCreateLeadInfoResult, validateFamilyMemberInfoResult] = await Promise.all(validationPromises);

        const newLead: any = await execCreateLead(
          validateCreateLeadInfoResult.inputData,
          validateCreateLeadInfoResult.existedContact,
          req.authUser,
          creationInfo,
        );
        if (_.get(sheetData[i], columnKeys.candidateName, '') || _.get(sheetData[i], columnKeys.candidateRelation, '')) {
          await execAddFamilyMember(
            newLead,
            validateFamilyMemberInfoResult.existedContact,
            addFamilyMemberInfo,
            req.authUser,
          );
        }
      } catch (error) {
        const rowError = {
          row: i,
          message: error.message,
        };

        importErrors.push(rowError);
      }
    }

    res.status(200).json({
      totalRow: sheetData.length - 1,
      success: sheetData.length - 1 - importErrors.length,
      errors: importErrors,
    });
  } catch (error) {
    res.status(error.code || 500).json({message: error.message || req.t('internalServerError')});
  }
};

export {
  importLeadsMiddleware,
  importLeads,
};
