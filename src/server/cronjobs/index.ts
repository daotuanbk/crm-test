import syncWithLms from './synchronize-with-lms';
import notifyTaskAppointment from './notify-task-appointment';

const startAll = (cb: any) => {
  syncWithLms.start(cb);
  notifyTaskAppointment.start(cb);
};

export default { startAll };
