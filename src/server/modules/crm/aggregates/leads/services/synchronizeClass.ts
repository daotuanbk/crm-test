import { classRepository, leadProductOrderRepository, leadRepository } from '@app/crm';
import { difference } from 'lodash';

export const synchronizeClass = async (req: any, res: any) => {
  try {
    const data = req.body;
    if (data.classId && data.newStudents && data.oldStudents) {
      await classRepository.synchronize();
      const selectedClass = await classRepository.findById(data.classId) as any;
      const newAddedStudents = difference(data.newStudents, data.oldStudents);
      const removedStudents = difference(data.oldStudents, data.newStudents);

      const leadsAddedPromises = newAddedStudents.map((val: any) => {
        return leadRepository.findByCriteria({ lmsStudentId: val }, []);
      });

      const leadsRemovedPromises = removedStudents.map((val: any) => {
        return leadRepository.findByCriteria({ lmsStudentId: val }, []);
      });

      const leadsAdded = await Promise.all(leadsAddedPromises);
      const leadsRemoved = await Promise.all(leadsRemovedPromises);
      const leadsAddedFlatten = [].concat.apply([], JSON.parse(JSON.stringify(leadsAdded)));
      const leadsRemovedFlatten = [].concat.apply([], JSON.parse(JSON.stringify(leadsRemoved)));
      const addPromises = leadsAddedFlatten.map((lead: any) => {
        if (lead && lead.productOrder && selectedClass) {
          return leadProductOrderRepository.updateCourses(lead.productOrder._id, {
            courseId: selectedClass.courseId,
            classId: selectedClass._id,
            class: selectedClass.name,
          });
        } else {
          return null;
        }
      });
      await Promise.all(addPromises);

      const removePromises = leadsRemovedFlatten.map((lead: any) => {
        if (lead && lead.productOrder && selectedClass) {
          return leadProductOrderRepository.updateCourses(lead.productOrder._id, {
            courseId: selectedClass.courseId,
            classId: null,
            class: null,
          });
        } else {
          return null;
        }
      });
      await Promise.all(removePromises);
    }

    res.status(200).end();
  } catch (error) {
    res.status(error.status || 500).end(error.message || req.t('internalServerError'));
  }
};
