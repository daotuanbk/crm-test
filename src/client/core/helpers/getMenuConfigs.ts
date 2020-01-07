import { authMenuConfigs } from '@client/modules/auth/menuConfigs';
import { leadMenuConfigs } from '@client/modules/lead/menuConfigs';
import { centreMenuConfigs } from '@client/modules/centre/menuConfigs';
import { defaultTaskMenuConfigs } from '@client/modules/default-task/menuConfigs';
import { campaignMenuConfigs } from '@client/modules/campaign/menuConfigs';
import { productComboMenuConfigs } from '@client/modules/product-combo/menuConfigs';
import { lmsCourseMenuConfigs } from '@client/modules/lms-courses/menuConfigs';
import { salesmanMenuConfigs } from '@client/modules/salesman/menuConfigs';
import { generalManagerMenuConfigs } from '@client/modules/general-manager/menuConfigs';
import { emailTemplateMenuConfigs } from '@client/modules/email-template/menuConfigs';
import { classMenuConfigs } from '@client/modules/class/menuConfigs';
import { interviewerCommentMenuConfigs } from '@client/modules/interviewer-comment/menuConfigs';
import { interviewerMenuConfigs } from '@client/modules/interviewers/menuConfigs';
import { receptionistMenuConfigs } from '@client/modules/collect-tuition/menuConfigs';
import { receptionistManagementMenuConfigs } from '@client/modules/collect-tuition/managementMenuConfigs';
import { courseMenuConfigs } from '@client/modules/courses/menuConfigs';
import { systemConfigMenuConfigs } from '@client/modules/stage/menuConfigs';
import { productsMenuConfigs } from '@client/modules/products/menuConfigs';

export const getMenuConfigs = () => {
  return [
    authMenuConfigs,
    leadMenuConfigs,
    productsMenuConfigs,
    interviewerCommentMenuConfigs,
    receptionistMenuConfigs,
    classMenuConfigs,
    lmsCourseMenuConfigs,
    {
      name: 'settingsManagement',
      icon: 'setting',
      permission: 'SETTING.VIEW',
      items: [
        centreMenuConfigs,
        courseMenuConfigs,
        defaultTaskMenuConfigs,
        productComboMenuConfigs,
        salesmanMenuConfigs,
        generalManagerMenuConfigs,
        receptionistManagementMenuConfigs,
        interviewerMenuConfigs,
        campaignMenuConfigs,
        emailTemplateMenuConfigs,
        systemConfigMenuConfigs,
      ],
    },
  ];
};
