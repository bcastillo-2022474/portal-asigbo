const consts = {
  apiPath: '/api',
  roles: {
    admin: 'admin',
    scolarshipHolder: 'scolarshipHolder',
    promotionResponsible: 'promotionResponsible',
    asigboAreaResponsible: 'asigboAreaResponsible',
    activityResponsible: 'activityResponsible',
    treasurer: 'treasurer',
  },
  token: {
    refresh: 'REFRESH',
    access: 'ACCESS',
    register: 'REGISTER',
    recover: 'RECOVER',
  },
  tokenExpiration: {
    refresh_days_expiration: 7,
    access_hours_expiration: 1,
    register_months_expiration: 6,
    recover_hours_expiration: 1,
  },
  promotionsGroups: {
    chick: 'chick',
    student: 'student',
    graduate: 'graduate',
  },
  bucketRoutes: {
    user: 'user',
    area: 'area',
    activity: 'activity',
    paymentVoucher: 'payment-voucher',
    assignment: 'assignment',
  },
  resultsNumberPerPage: 7,
  imagePath: {
  },
  strings: {
    activityPaymentTargetUsers: 'Actividad',
  },
  activityFileHeaders: ['Actividad', 'Area', 'Fecha', 'Participante', 'Horas'],
  uploadFileSizeLimit: {
    default: 1000000, // 1MB
    banner: 5000000,
    files: 3000000, // 3MB
  },
};

consts.imagePath.user = `${consts.apiPath}/user`;
consts.imagePath.area = `${consts.apiPath}/area`;
consts.imagePath.activity = `${consts.apiPath}/activity`;
consts.imagePath.paymentVoucher = `${consts.apiPath}/image/paymentVoucher`;
consts.imagePath.assignment = `${consts.apiPath}/image/assignment`;

export default consts;
