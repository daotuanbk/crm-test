import {
  nestBasic,
  combineNest,
} from '@client/helpers';
import {
  createInitialFilters,
  createLeadFilter,
  statusOptionsFilterByStage,
  statusValueFilterByStage,
  lmsClassClearedWhenLmsCourseChange,
  StageFilter,
  StatusFilter,
  ChannelFilter,
  TuitionFilter,
  ReminderFilter,
  CreatedAtFilter,
  AppointmentFilter,
  ProductFilter,
  LmsCourseFilter,
  LmsClassFilter,
  EnrollmentStatusFilter,
} from '../components/LeadDataTable/LeadFilter';

export const lAllFilters = createInitialFilters([] as any);

export const l0Filters = createInitialFilters(['L0']);

export const l1Filters = createInitialFilters(['L1']);

export const l2Filters = createInitialFilters(['L2']);

export const l3Filters = createInitialFilters(['L3']);

export const l4Filters = createInitialFilters(['L4']);

export const l5Filters = createInitialFilters(['L5']);

export const LAllFilter = createLeadFilter(
  [statusValueFilterByStage],
  [
    {
      render: (props: any) => <StageFilter {...props} />,
      nest: nestBasic('stage'),
    },
    {
      render: (props: any) => <StatusFilter {...props} />,
      nest: combineNest(nestBasic('status'), statusOptionsFilterByStage),
    },
    {
      render: (props: any) => <ChannelFilter {...props} />,
      nest: nestBasic('channel'),
    },
    {
      render: (props: any) => <TuitionFilter {...props} />,
      nest: nestBasic('tuitionProgress'),
    },
    {
      render: (props: any) => <ReminderFilter {...props} />,
      nest: nestBasic('reminder'),
    },
    {
      render: (props: any) => <CreatedAtFilter {...props} />,
      nest: nestBasic('createdAt'),
    },
  ],
  lAllFilters,
) as any;

export const L1Filter = createLeadFilter(
  [statusValueFilterByStage],
  [
    {
      render: (props: any) => <StatusFilter {...props} />,
      nest: combineNest(nestBasic('status'), statusOptionsFilterByStage),
    },
    {
      render: (props: any) => <ChannelFilter {...props} />,
      nest: nestBasic('channel'),
    },
  ],
  l1Filters,
) as any;

export const L2Filter = createLeadFilter(
  [statusValueFilterByStage],
  [
    {
      render: (props: any) => <StatusFilter {...props} />,
      nest: combineNest(nestBasic('status'), statusOptionsFilterByStage),
    },
    {
      render: (props: any) => <ChannelFilter {...props} />,
      nest: nestBasic('channel'),
    },
    {
      render: (props: any) => <ReminderFilter {...props} />,
      nest: nestBasic('reminder'),
    },
  ],
  l2Filters,
) as any;

export const L3Filter = createLeadFilter(
  [statusValueFilterByStage],
  [
    {
      render: (props: any) => <StatusFilter {...props} />,
      nest: combineNest(nestBasic('status'), statusOptionsFilterByStage),
    },
    {
      render: (props: any) => <ChannelFilter {...props} />,
      nest: nestBasic('channel'),
    },
    {
      render: (props: any) => <ReminderFilter {...props} />,
      nest: nestBasic('reminder'),
    },
  ],
  l3Filters,
) as any;

export const L4Filter = createLeadFilter(
  [statusValueFilterByStage],
  [
    {
      render: (props: any) => <StatusFilter {...props} />,
      nest: combineNest(nestBasic('status'), statusOptionsFilterByStage),
    },
    {
      render: (props: any) => <AppointmentFilter {...props} />,
      nest: nestBasic('appointment'),
    },
    {
      render: (props: any) => <ReminderFilter {...props} />,
      nest: nestBasic('reminder'),
    },
  ],
  l4Filters,
) as any;

export const L5Filter = createLeadFilter(
  [statusValueFilterByStage, lmsClassClearedWhenLmsCourseChange],
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
      render: (props: any) => <LmsCourseFilter {...props} />,
      nest: nestBasic('lmsCourse'),
    },
    {
      render: (props: any) => <LmsClassFilter {...props} />,
      nest: nestBasic('lmsClass'),
    },
    {
      render: (props: any) => <EnrollmentStatusFilter {...props} />,
      nest: nestBasic('lmsEnrollmentStatus'),
    },
  ],
  l5Filters,
) as any;

export const L0Filter = createLeadFilter(
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
  ],
  l0Filters,
) as any;
