import React from 'react';
import { Popover } from 'antd';
import { translate } from '@client/i18n';
import moment from 'moment';
import _ from 'lodash';

const NamePopover = (props: any) => {
  const {
    record,
  } = props;
  const customerInfo = _.get(record, 'customer._id', {});
  const customerFamilyInfo = _.get(record, 'customer.family', {});
  let dob = 'N/A';
  let school = 'N/A';

  if (customerFamilyInfo && customerFamilyInfo[0]) {
    dob = customerFamilyInfo[0].dob ? moment(customerFamilyInfo[0].dob).utc().format('DD-MM-YYYY') : 'N/A';
    school = customerFamilyInfo[0].school ? customerFamilyInfo[0].school : 'N/A';
  } else {
    dob = customerInfo.dob ? moment(customerInfo.dob).utc().format('DD-MM-YYYY') : 'N/A';
    school = customerInfo.school ? customerInfo.school : 'N/A';
  }

  return (
    <div>
      <h5><span className='text-gray'>{translate('lang:dateOfBirth')}:</span> {dob} </h5>
      <h5><span className='text-gray'>{translate('lang:school')}:</span> {school} </h5>
    </div>
  );
};

interface Candidate {
  fullName: string;
  lastName: string;
  firstName: string;
}

const getCandidateName = (candidate: Candidate) => {
  let candidateName = '';

  if (candidate.fullName) {
    candidateName = candidate.fullName;
  } else {
    candidateName = `${candidate.lastName || ''} ${candidate.firstName || ''}`;
  }

  if (candidateName && candidateName.trim()) {
    return candidateName;
  } else {
    return '';
  }
};

export const CandidateCell = (props: any) => {
  if (!_.get(props, 'record.customer._id')) {
    return <div>N/A</div>;
  }
  const {
    record,
  } = props;
  const customerInfo = _.get(record, 'customer._id', {});
  const customerFamilyInfo = _.get(record, 'customer.family', {});
  let candidateName: any = 'N/A';

  if (customerFamilyInfo && customerFamilyInfo.length > 0) {
    candidateName = customerFamilyInfo.length > 1 ? (
      <ul style={{
        paddingLeft: 0,
        listStyle: 'none',
      }}>
        {customerFamilyInfo.map((candidate: Candidate) => {
          const candidateItemName = getCandidateName(candidate);

          if (candidateItemName) {
            return <li>{candidateItemName}</li>;
          } else {
            return '';
          }
        })}
      </ul>
    ) : (
      getCandidateName(customerFamilyInfo[0]) || 'N/A'
    );
  } else {
    candidateName = getCandidateName(customerInfo) || 'N/A';
  }

  return (
    <Popover title='' trigger='hover' content={<NamePopover {...props} />}>
      {candidateName}
    </Popover>
  );
};
