import createLeadDataTable from '../components/LeadDataTable/createLeadDataTable';
import { LeadBulkActionPanel } from '../components/LeadDataTable/LeadBulkActionPanel';
import ListControlPanel from '../components/ListControlPanel';

import {
  CustomerCell,
  PhoneCell,
  CandidateCell,
  StatusCell,
  TuitionPercentCell,
  ChannelCell,
  ReminderCell,
  AppointmentCell,
  TuitionAfterDiscountCell,
  DistrictCell,
  SingleProductCell,
  EnrollmentCourseCell,
  EnrollmentClassCell,
  SingleCandidateCell,
  EnrollmentStatusCell,
  EditCell,
} from '../components/LeadDataTable/TableCells';
import {
  LAllFilter,
  L3Filter,
  L0Filter,
  L1Filter,
  L2Filter,
  L4Filter,
  L5Filter,
  lAllFilters,
  l3Filters,
  l0Filters,
  l1Filters,
  l2Filters,
  l4Filters,
  l5Filters,
} from './LeadFilter';
import { CreatedAtCell } from '@client/components';
import { shapeLeadByEnrollments } from '../components/LeadDataTable/helpers';

const renderBulkAction = (props: any): JSX.Element => {
  return <LeadBulkActionPanel {...props} noAssign />;
};

const renderControlPanel = (props: any): JSX.Element => {
  return <ListControlPanel {...props} hideImport />;
};

const LAllLeadColumns = [
  {
    field: 'customer',
    width: '100px',
    fixed: 'left',
    render: (props: any) => <CustomerCell {...props} />,
  },
  {
    field: 'phone',
    width: '100px',
    fixed: 'left',
    render: (props: any) => <PhoneCell {...props} />,
  },
  {
    field: 'candidate',
    width: '16%',
    render: (props: any) => <CandidateCell {...props} />,
  },
  {
    field: 'status',
    width: '20%',
    sorter: true,
    render: (props: any) => <StatusCell {...props} />,
  },
  {
    field: 'tuitionProgress',
    width: '14%',
    render: (props: any) => <TuitionPercentCell {...props} />,
    sorter: true,
  },
  {
    field: 'channel',
    width: '15%',
    render: (props: any) => <ChannelCell {...props} />,
    sorter: true,
  },
  {
    field: 'reminder',
    width: '12%',
    sorter: true,
    render: (props: any) => <ReminderCell {...props} />,
  },
  {
    field: 'createdAt',
    width: '12%',
    sorter: true,
    render: (props: any) => <CreatedAtCell {...props} />,
  },
];

const L0LeadColumns = [
  {
    field: 'customer',
    width: '100px',
    fixed: 'left',
    render: (props: any) => <CustomerCell {...props} />,
  },
  {
    field: 'phone',
    width: '100px',
    fixed: 'left',
    render: (props: any) => <PhoneCell {...props} />,
  },
  {
    field: 'candidate',
    width: '16%',
    render: (props: any) => <CandidateCell {...props} />,
  },
  {
    field: 'status',
    width: '20%',
    sorter: true,
    render: (props: any) => <StatusCell {...props} />,
  },
  {
    field: 'tuitionProgress',
    width: '14%',
    render: (props: any) => <TuitionPercentCell {...props} />,
    sorter: true,
  },
  {
    field: 'channel',
    width: '15%',
    render: (props: any) => <ChannelCell {...props} />,
    sorter: true,
  },
  {
    field: 'reminder',
    width: '12%',
    sorter: true,
    render: (props: any) => <ReminderCell {...props} />,
  },
];

const L1LeadColumns = [
  {
    field: 'customer',
    width: '100px',
    fixed: 'left',
    render: (props: any) => <CustomerCell {...props} />,
  },
  {
    field: 'phone',
    width: '100px',
    fixed: 'left',
    render: (props: any) => <PhoneCell {...props} />,
  },
  {
    field: 'candidate',
    width: '16%',
    render: (props: any) => <CandidateCell {...props} />,
  },
  {
    field: 'channel',
    width: '15%',
    render: (props: any) => <ChannelCell {...props} />,
    sorter: true,
  },
  {
    field: 'district',
    width: '15%',
    render: (props: any) => <DistrictCell {...props} />,
    sorter: true,
  },
  {
    field: 'status',
    width: '20%',
    sorter: true,
    render: (props: any) => <StatusCell {...props} />,
  },
  {
    field: 'createdAt',
    width: '16%',
    sorter: true,
    render: (props: any) => <CreatedAtCell {...props} />,
  },
];

const L2LeadColumns = [
  {
    field: 'customer',
    width: '100px',
    fixed: 'left',
    render: (props: any) => <CustomerCell {...props} />,
  },
  {
    field: 'phone',
    width: '100px',
    fixed: 'left',
    render: (props: any) => <PhoneCell {...props} />,
  },
  {
    field: 'candidate',
    width: '20%',
    render: (props: any) => <CandidateCell {...props} />,
  },
  {
    field: 'channel',
    width: '15%',
    render: (props: any) => <ChannelCell {...props} />,
    sorter: true,
  },
  {
    field: 'district',
    width: '16%',
    render: (props: any) => <DistrictCell {...props} />,
    sorter: true,
  },
  {
    field: 'status',
    width: '16%',
    sorter: true,
    render: (props: any) => <StatusCell {...props} />,
  },
  {
    field: 'reminder',
    width: '15%',
    sorter: true,
    render: (props: any) => <ReminderCell {...props} />,
  },
];

const L3LeadColumns = [
  {
    field: 'customer',
    width: '100px',
    fixed: 'left',
    render: (props: any) => <CustomerCell {...props} />,
  },
  {
    field: 'phone',
    width: '100px',
    fixed: 'left',
    render: (props: any) => <PhoneCell {...props} />,
  },
  {
    field: 'candidate',
    width: '16%',
    render: (props: any) => <CandidateCell {...props} />,
  },
  {
    field: 'channel',
    width: '15%',
    render: (props: any) => <ChannelCell {...props} />,
    sorter: true,
  },
  {
    field: 'district',
    width: '15%',
    render: (props: any) => <DistrictCell {...props} />,
    sorter: true,
  },
  {
    field: 'status',
    width: '20%',
    sorter: true,
    render: (props: any) => <StatusCell {...props} />,
  },
  {
    field: 'reminder',
    width: '12%',
    sorter: true,
    render: (props: any) => <ReminderCell {...props} />,
  },
];

const L4LeadColumns = [
  {
    field: 'customer',
    width: '100px',
    fixed: 'left',
    render: (props: any) => <CustomerCell {...props} />,
  },
  {
    field: 'phone',
    width: '100px',
    fixed: 'left',
    render: (props: any) => <PhoneCell {...props} />,
  },
  {
    field: 'candidate',
    width: '16%',
    render: (props: any) => <CandidateCell {...props} />,
  },
  {
    field: 'status',
    width: '20%',
    sorter: true,
    render: (props: any) => <StatusCell {...props} />,
  },
  {
    field: 'appointment',
    width: '12%',
    sorter: true,
    render: (props: any) => <AppointmentCell {...props} />,
  },
  {
    field: 'reminder',
    width: '12%',
    sorter: true,
    render: (props: any) => <ReminderCell {...props} />,
  },
];

const L5LeadColumns = [
  {
    field: 'customer',
    width: '100px',
    fixed: 'left',
    render: (props: any) => {
      return {
        props: {
          rowSpan: props.record.leadRowSpan,
        },
        children: <CustomerCell {...props} />,
      };
    },
  },
  {
    field: 'phone',
    width: '100px',
    fixed: 'left',
    render: (props: any) => {
      return {
        props: {
          rowSpan: props.record.leadRowSpan,
        },
        children: <PhoneCell {...props} />,
      };
    },
  },
  {
    field: 'status',
    width: '20%',
    sorter: true,
    render: (props: any) => {
      return {
        props: {
          rowSpan: props.record.leadRowSpan,
        },
        children: <StatusCell {...props} />,
      };
    },
  },
  {
    field: 'tuition',
    width: '12%',
    sorter: true,
    render: (props: any) => {
      return {
        props: {
          rowSpan: props.record.leadRowSpan,
        },
        children: <TuitionAfterDiscountCell {...props} />,
      };
    },
  },
  {
    field: 'tuitionProgress',
    width: '14%',
    sorter: true,
    render: (props: any) => {
      return {
        props: {
          rowSpan: props.record.leadRowSpan,
        },
        children: <TuitionPercentCell {...props} />,
      };
    },
  },
  {
    field: 'candidate',
    width: '16%',
    render: (props: any) => {
      return {
        props: {
          rowSpan: props.record.productItemRowSpan,
        },
        children: <SingleCandidateCell {...props} />,
      };
    },
  },
  {
    field: 'product',
    width: '15%',
    sorter: true,
    render: (props: any) => {
      return {
        props: {
          rowSpan: props.record.productItemRowSpan,
        },
        children: <SingleProductCell {...props} />,
      };
    },
  },
  {
    field: 'enrollmentCourse',
    width: '20%',
    sorter: false,
    render: (props: any) => {
      return {
        props: {
          rowSpan: 1,
        },
        children: <EnrollmentCourseCell {...props} />,
      };
    },
  },
  {
    field: 'enrollmentClass',
    width: '20%',
    sorter: false,
    render: (props: any) => {
      return {
        props: {
          rowSpan: 1,
        },
        children: <EnrollmentClassCell {...props} />,
      };
    },
  },
  {
    field: 'enrollmentStatus',
    width: '20%',
    sorter: false,
    render: (props: any) => {
      return {
        props: {
          rowSpan: 1,
        },
        children: <EnrollmentStatusCell {...props} />,
      };
    },
  },
];

export const LAllDataTable = createLeadDataTable(
  {
    render: (props: any) => <LAllFilter {...props} />,
    initial: lAllFilters,
  },
  LAllLeadColumns,
  undefined,
  renderBulkAction,
  renderControlPanel,
) as any;

export const L1DataTable = createLeadDataTable(
  {
    render: (props: any) => <L1Filter {...props} />,
    initial: l1Filters,
  },
  L1LeadColumns,
  undefined,
  renderBulkAction,
  renderControlPanel,
) as any;

export const L2DataTable = createLeadDataTable(
  {
    render: (props: any) => <L2Filter {...props} />,
    initial: l2Filters,
  },
  L2LeadColumns,
  undefined,
  renderBulkAction,
  renderControlPanel,
) as any;

export const L3DataTable = createLeadDataTable(
  {
    render: (props: any) => <L3Filter {...props} />,
    initial: l3Filters,
  },
  L3LeadColumns,
  undefined,
  renderBulkAction,
  renderControlPanel,
) as any;

export const L4DataTable = createLeadDataTable(
  {
    render: (props: any) => <L4Filter {...props} />,
    initial: l4Filters,
  },
  L4LeadColumns,
  undefined,
  renderBulkAction,
  renderControlPanel,
) as any;

export const L5DataTable = createLeadDataTable(
  {
    render: (props: any) => <L5Filter {...props} />,
    initial: l5Filters,
  },
  L5LeadColumns,
  undefined,
  renderBulkAction,
  renderControlPanel,
  (props: any) => {
    return {
      props: {
        rowSpan: props.record.leadRowSpan,
      },
      children: <EditCell {...props} />,
    };
  },
  {
    shape: shapeLeadByEnrollments,
    rowKeyField: 'uuid',
  },
) as any;

export const L0DataTable = createLeadDataTable(
  {
    render: (props: any) => <L0Filter {...props} />,
    initial: l0Filters,
  },
  L0LeadColumns,
  undefined,
  renderBulkAction,
  renderControlPanel,
) as any;
