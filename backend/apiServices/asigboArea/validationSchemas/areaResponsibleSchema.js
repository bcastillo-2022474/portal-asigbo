import yup from 'yup';

export default yup.object().shape({
  idArea: yup.string().required('El id del área es obligatorio.'),
  idUser: yup.string().required('El id del responsable es obligatorio.'),
});
