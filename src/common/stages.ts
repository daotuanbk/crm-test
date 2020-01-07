import _ from 'lodash';

export const STAGES = [
  {
    name: 'L1',
    description: '',
    shortName: 'L1',
    order: 1,
    value: {
      name: 'L1',
      description: '',
      shortName: 'L1',
      order: 1,
    },
    statuses: [
      {
        value: {
          name: 'L1A - Chưa xử lý',
          shortName: 'L1A',
          stageId: '', // Mainly for back-end
          order: 1,
        },
        name: 'L1A - Chưa xử lý',
        shortName: 'L1A',
        stageId: '', // Mainly for back-end
        order: 1,
      },
      {
        value: {
          name: 'L1B - Bận, gọi lại sau',
          shortName: 'L1B',
          stageId: '', // Mainly for back-end
          order: 2,
        },
        name: 'L1B - Bận, gọi lại sau',
        shortName: 'L1B',
        stageId: '', // Mainly for back-end
        order: 2,
      },
      {
        value: {
          name: 'L1C - Chưa nghe máy',
          shortName: 'L1C',
          stageId: '', // Mainly for back-end
          order: 3,
        },
        name: 'L1C - Chưa nghe máy',
        shortName: 'L1C',
        stageId: '', // Mainly for back-end
        order: 3,
      },
    ],
  },
  {
    name: 'L2',
    description: '',
    shortName: 'L2',
    order: 2,
    value: {
      name: 'L2',
      description: '',
      shortName: 'L2',
      order: 2,
    },
    statuses: [
      {
        value: {
          name: 'L2A - Không có nhu cầu',
          shortName: 'L2A',
          order: 1,
          stageId: '', // Mainly for back-end
        },
        name: 'L2A - Không có nhu cầu',
        shortName: 'L2A',
        order: 1,
        stageId: '', // Mainly for back-end
      },
      {
        value: {
          name: 'L2B - Sai đối tượng (ngoài khu vực)',
          shortName: 'L2B',
          order: 2,
          stageId: '', // Mainly for back-end
        },
        name: 'L2B - Sai đối tượng (ngoài khu vực)',
        shortName: 'L2B',
        order: 2,
        stageId: '', // Mainly for back-end
      },
      {
        value: {
          name: 'L2C - Sai đối tượng (độ tuổi, chưa có con...)',
          shortName: 'L2C',
          order: 3,
          stageId: '', // Mainly for back-end
        },
        name: 'L2C - Sai đối tượng (độ tuổi, chưa có con...)',
        shortName: 'L2C',
        order: 3,
        stageId: '', // Mainly for back-end
      },
      {
        value: {
          name: 'L2D - L3 hủy',
          shortName: 'L2D',
          order: 4,
          stageId: '', // Mainly for back-end
        },
        name: 'L2D - L3 hủy',
        shortName: 'L2D',
        order: 4,
        stageId: '', // Mainly for back-end
      },
      {
        value: {
          name: 'L2E - Hủy lịch trải nghiệm',
          shortName: 'L2E',
          order: 5,
          stageId: '', // Mainly for back-end
        },
        name: 'L2E - Hủy lịch trải nghiệm',
        shortName: 'L2E',
        order: 5,
        stageId: '', // Mainly for back-end
      },
      {
        value: {
          name: 'L2F - Fail trải nghiệm / Fail test',
          shortName: 'L2F',
          order: 6,
          stageId: '', // Mainly for back-end
        },
        name: 'L2F - Fail trải nghiệm / Fail test',
        shortName: 'L2F',
        order: 6,
        stageId: '', // Mainly for back-end
      },
      {
        value: {
          name: 'L2G - L5 hủy',
          shortName: 'L2G',
          order: 7,
          stageId: '', // Mainly for back-end
        },
        name: 'L2G - L5 hủy',
        shortName: 'L2G',
        order: 7,
        stageId: '', // Mainly for back-end
      },
      {
        value: {
          name: 'L2X - Sai đối tượng (chưa rõ nguyên nhân)',
          shortName: 'L2X',
          order: 8,
          stageId: '', // Mainly for back-end
        },
        name: 'L2X - Sai đối tượng (chưa rõ nguyên nhân)',
        shortName: 'L2X',
        order: 8,
        stageId: '', // Mainly for back-end
      },
    ],
  },
  {
    name: 'L3',
    description: '',
    shortName: 'L3',
    order: 3,
    value: {
      name: 'L3',
      description: '',
      shortName: 'L3',
      order: 3,
    },
    statuses: [
      {
        value: {
          name: 'L3A - Có quan tâm nhưng đang bận',
          shortName: 'L3',
          order: 1,
          stageId: '', // Mainly for back-end
        },
        name: 'L3A - Có quan tâm nhưng đang bận',
        shortName: 'L3A',
        order: 1,
        stageId: '', // Mainly for back-end
      },
      {
        value: {
          name: 'L3B - Đã tư vấn, KH quan tâm ít',
          shortName: 'L3B',
          order: 2,
          stageId: '', // Mainly for back-end
        },
        name: 'L3B - Đã tư vấn, KH quan tâm ít',
        shortName: 'L3B',
        order: 2,
        stageId: '', // Mainly for back-end
      },
      {
        value: {
          name: 'L3C - Đã tư vấn, cần gửi email',
          shortName: 'L3C',
          order: 3,
          stageId: '', // Mainly for back-end
        },
        name: 'L3C - Đã tư vấn, cần gửi email',
        shortName: 'L3C',
        order: 3,
        stageId: '', // Mainly for back-end
      },
      {
        value: {
          name: 'L3D - Đã tư vấn, KH có quan tâm nhiều',
          shortName: 'L3D',
          order: 4,
          stageId: '', // Mainly for back-end
        },
        name: 'L3D - Đã tư vấn, KH có quan tâm nhiều',
        shortName: 'L3D',
        order: 4,
        stageId: '', // Mainly for back-end
      },
    ],
  },
  {
    name: 'L4',
    description: '',
    shortName: 'L4',
    order: 4,
    value: {
      name: 'L4',
      description: '',
      shortName: 'L4',
      order: 4,
    },
    statuses: [
      {
        value: {
          name: 'L4A - Đồng ý học trải nghiệm / Test',
          shortName: 'L4A',
          order: 1,
          stageId: '', // Mainly for back-end
        },
        name: 'L4A - Đồng ý học trải nghiệm / Test',
        shortName: 'L4A',
        order: 1,
        stageId: '', // Mainly for back-end
      },
      {
        value: {
          name: 'L4B - Đã học trải nghiệm / Tested',
          shortName: 'L4B',
          order: 2,
          stageId: '', // Mainly for back-end
        },
        name: 'L4B - Đã học trải nghiệm / Tested',
        shortName: 'L4B',
        order: 2,
        stageId: '', // Mainly for back-end
      },
      {
        value: {
          name: 'L4X - Đang chấm test',
          shortName: 'L4X',
          order: 3,
          stageId: '', // Mainly for back-end
        },
        name: 'L4X - Đang chấm test',
        shortName: 'L4X',
        order: 3,
        stageId: '', // Mainly for back-end
      },
    ],
  },
  {
    name: 'L5',
    description: '',
    shortName: 'L5',
    order: 5,
    value: {
      name: 'L5',
      description: '',
      shortName: 'L5',
      order: 5,
    },
    statuses: [
      {
        value: {
          name: 'L5A - New order - Chờ thanh toán',
          shortName: 'L5A',
          order: 1,
          stageId: '', // Mainly for back-end
        },
        name: 'L5A - New order - Chờ thanh toán',
        shortName: 'L5A',
        order: 1,
        stageId: '', // Mainly for back-end
      },
      {
        value: {
          name: 'L5B - Order - Đã thanh toán một phần',
          shortName: 'L5B - Order - Đã thanh toán một phần',
          order: 2,
          stageId: '', // Mainly for back-end
        },
        name: 'L5B - Order - Đã thanh toán một phần',
        shortName: 'L5B',
        order: 2,
        stageId: '', // Mainly for back-end
      },
      {
        value: {
          name: 'L5C - Order - Đã thanh toán toàn phần',
          shortName: 'L5C - Order - Đã thanh toán toàn phần',
          order: 3,
          stageId: '', // Mainly for back-end
        },
        name: 'L5C - Order - Đã thanh toán toàn phần',
        shortName: 'L5C',
        order: 3,
        stageId: '', // Mainly for back-end
      },
    ],
  },
  {
    name: 'L0',
    description: '',
    shortName: 'L0',
    order: 6,
    value: {
      name: 'L0',
      description: '',
      shortName: 'L0',
      order: 6,
    },
    statuses: [
      {
        value: {
          name: 'L0A - Sai số điện thoại',
          shortName: 'L0A',
          order: 1,
          stageId: '', // Mainly for back-end
        },
        name: 'L0A - Sai số điện thoại',
        shortName: 'L0A',
        order: 1,
        stageId: '', // Mainly for back-end
      },
      {
        value: {
          name: 'L0B - Hủy do trùng leads',
          shortName: 'L0B',
          order: 2,
          stageId: '', // Mainly for back-end
        },
        name: 'L0B - Hủy do trùng leads',
        shortName: 'L0B',
        order: 2,
        stageId: '', // Mainly for back-end
      },
    ],
  },
];

export const allowedUpdateStatuses = {
  L0A: ['L3A', 'L3B', 'L3C', 'L3D', 'L4A', 'L4B', 'L4X', 'L5A', 'L5B', 'L5C'],
  L0B: ['L3A', 'L3B', 'L3C', 'L3D', 'L4A', 'L4B', 'L4X', 'L5A', 'L5B', 'L5C'],
  L1A: ['L0A', 'L0B', 'L1A', 'L1B', 'L1C', 'L2A', 'L2B', 'L2C', 'L2D', 'L2E', 'L2F', 'L2G', 'L2X', 'L3A', 'L3B', 'L3C', 'L3D', 'L4A', 'L4B', 'L4X'],
  L1B: ['L0A', 'L0B', 'L1B', 'L1C', 'L2A', 'L2B', 'L2C', 'L2D', 'L2E', 'L2F', 'L2G', 'L2X', 'L3A', 'L3B', 'L3C', 'L3D', 'L4A', 'L4B', 'L4X'],
  L1C: ['L0A', 'L0B', 'L1B', 'L1C', 'L2A', 'L2B', 'L2C', 'L2D', 'L2E', 'L2F', 'L2G', 'L2X', 'L3A', 'L3B', 'L3C', 'L3D', 'L4A', 'L4B', 'L4X'],
  L2A: ['L0A', 'L0B', 'L2A', 'L2B', 'L2C', 'L2D', 'L2E', 'L2F', 'L2G', 'L2X', 'L3A', 'L3B', 'L3C', 'L3D', 'L4A', 'L4B', 'L4X'],
  L2B: ['L0A', 'L0B', 'L2A', 'L2B', 'L2C', 'L2D', 'L2E', 'L2F', 'L2G', 'L2X', 'L3A', 'L3B', 'L3C', 'L3D', 'L4A', 'L4B', 'L4X'],
  L2C: ['L0A', 'L0B', 'L2A', 'L2B', 'L2C', 'L2D', 'L2E', 'L2F', 'L2G', 'L2X', 'L3A', 'L3B', 'L3C', 'L3D', 'L4A', 'L4B', 'L4X'],
  L2D: ['L0A', 'L0B', 'L2A', 'L2B', 'L2C', 'L2D', 'L2E', 'L2F', 'L2G', 'L2X', 'L3A', 'L3B', 'L3C', 'L3D', 'L4A', 'L4B', 'L4X', 'L5A', 'L5B', 'L5C'],
  L2E: ['L0A', 'L0B', 'L2A', 'L2B', 'L2C', 'L2D', 'L2E', 'L2F', 'L2G', 'L2X', 'L3A', 'L3B', 'L3C', 'L3D', 'L4A', 'L4B', 'L4X', 'L5A', 'L5B', 'L5C'],
  L2F: ['L0A', 'L0B', 'L2A', 'L2B', 'L2C', 'L2D', 'L2E', 'L2F', 'L2G', 'L2X', 'L3A', 'L3B', 'L3C', 'L3D', 'L4A', 'L4B', 'L4X', 'L5A', 'L5B', 'L5C'],
  L2G: ['L0A', 'L0B', 'L2A', 'L2B', 'L2C', 'L2D', 'L2E', 'L2F', 'L2G', 'L2X', 'L3A', 'L3B', 'L3C', 'L3D', 'L4A', 'L4B', 'L4X', 'L5A', 'L5B', 'L5C'],
  L2X: ['L0A', 'L0B', 'L2A', 'L2B', 'L2C', 'L2D', 'L2E', 'L2F', 'L2G', 'L2X', 'L3A', 'L3B', 'L3C', 'L3D', 'L4A', 'L4B', 'L4X', 'L5A', 'L5B', 'L5C'],
  L3A: ['L2D', 'L3B', 'L3C', 'L3D', 'L4A', 'L4B', 'L4X', 'L5A', 'L5B', 'L5C'],
  L3B: ['L2D', 'L3B', 'L3C', 'L3D', 'L4A', 'L4B', 'L4X', 'L5A', 'L5B', 'L5C'],
  L3C: ['L2D', 'L3B', 'L3C', 'L3D', 'L4A', 'L4B', 'L4X', 'L5A', 'L5B', 'L5C'],
  L3D: ['L2D', 'L3B', 'L3C', 'L3D', 'L4A', 'L4B', 'L4X', 'L5A', 'L5B', 'L5C'],
  L4A: ['L2E', 'L4B', 'L4X', 'L5A', 'L5B', 'L5C'],
  L4B: ['L2F', 'L4X', 'L5A', 'L5B', 'L5C'],
  L4X: ['L2F', 'L5A', 'L5B', 'L5C'],
  L5A: ['L2G', 'L5B', 'L5C'],
  L5B: ['L5C'],
  L5C: [],
};

export const STATUSES = _(STAGES).map((stage) => {
  const stageStatuses = stage.statuses.map((stageStatus) => ({
    ...stageStatus,
    stage,
    stageName: stage.name,
    stageDescription: stage.description,
    stageShortName: stage.shortName,
  }));
  return stageStatuses;
}).flatMap().value();

export const PAYABLE_STATUSES = _(STAGES)
  .filter({ shortName: 'L5' })
  .flatMap('statuses')
  .filter((status) => status.shortName !== 'L5C')
  .value();

export const REFUNDABLE_STATUSES = _(STAGES)
  .filter({ shortName: 'L5' })
  .flatMap('statuses')
  .filter((status) => status.shortName !== 'L5A')
  .value();

export const COMPLETE_STATUS = 'L5C';
