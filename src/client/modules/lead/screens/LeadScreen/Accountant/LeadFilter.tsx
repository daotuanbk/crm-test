import { nestBasic, combineNest } from '@client/helpers';
import {
  createInitialFilters,
  createLeadFilter,
  statusOptionsFilterByStage,
  statusValueFilterByStage,
  StatusFilter,
  TuitionFilter,
  ProductFilter,
  OwnerFilter,
} from '../components/LeadDataTable/LeadFilter';

export const l5Filters = createInitialFilters(['L5']);

export const L5Filter = createLeadFilter(
  [statusValueFilterByStage],
  [
    {
      render: (props: any) => <StatusFilter {...props} />,
      nest: combineNest(nestBasic('status'), statusOptionsFilterByStage),
    },
    {
      render: (props: any) => <TuitionFilter {...props} />,
      nest: nestBasic('tuitionProgress'),
    },
    {
      render: (props: any) => <ProductFilter {...props} />,
      nest: nestBasic('product'),
    },
    {
      render: (props: any) => <OwnerFilter {...props} />,
      nest: nestBasic('owner'),
    },
  ],
  l5Filters,
) as any;
