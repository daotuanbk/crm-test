import createLeadDataTable from '../components/LeadDataTable/createLeadDataTable';
import {
  CustomerCell,
  PhoneCell,
  CandidateCell,
  StatusCell,
  TuitionPercentCell,
  TuitionAfterDiscountCell,
  ProductCell,
  OwnerCell,
} from '../components/LeadDataTable/TableCells';
import {
  L5Filter,
  l5Filters,
} from './LeadFilter';

const L5LeadColumns = [
  {
    field: 'customer',
    width: '16%',
    render: (props: any) => <CustomerCell {...props} />,
  },
  {
    field: 'phone',
    width: '14%',
    render: (props: any) => <PhoneCell {...props} />,
  },
  {
    field: 'status',
    width: '20%',
    sorter: true,
    render: (props: any) => <StatusCell {...props} />,
  },
  {
    field: 'candidate',
    width: '16%',
    render: (props: any) => <CandidateCell {...props} />,
  },
  {
    field: 'product',
    width: '15%',
    render: (props: any) => <ProductCell {...props} />,
    sorter: true,
  },
  {
    field: 'tuition',
    width: '12%',
    sorter: true,
    render: (props: any) => <TuitionAfterDiscountCell {...props} />,
  },
  {
    field: 'tuitionProgress',
    width: '14%',
    render: (props: any) => <TuitionPercentCell {...props} />,
    sorter: true,
  },
  {
    field: 'owner',
    width: '20%',
    sorter: true,
    render: (props: any) => <OwnerCell {...props} />,
  },
] as any;

export const L5DataTable = createLeadDataTable(
  {
    render: (props: any) => < L5Filter {...props} />,
    initial: l5Filters,
  },
  L5LeadColumns,
  {
    field: 'reminder',
    order: 'descend',
  },
  () => <div />,
  () => <div />,
) as any;
