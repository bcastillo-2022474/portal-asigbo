import { useState } from 'react';
import parseErrorObject from '../helpers/parseErrorObject';

function useForm(schema) {
  const [form, setForm] = useState({});
  const [error, setError] = useState();

  const setData = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const getFormErrors = async () => {
    try {
      await schema.validate(form, { abortEarly: false });
      return null;
    } catch (err) {
      return parseErrorObject(err);
    }
  };

  const validateForm = async () => {
    const errors = await getFormErrors();
    setError(errors);
    return errors;
  };

  const validateField = async (name) => {
    const errors = await getFormErrors();
    if (errors != null) {
      setError((lastErrors) => ({
        ...lastErrors,
        [name]: errors[name],
      }));
    }
    return errors;
  };

  const clearFieldError = (name) => {
    setError((lastErrors) => ({
      ...lastErrors,
      [name]: null,
    }));
  };

  const clearFormErrors = () => setError(null);

  return {
    form, error, setData, setForm, validateForm, validateField, clearFieldError, clearFormErrors,
  };
}

export default useForm;
