import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import useFetch from '../../hooks/useFetch';
import useToken from '../../hooks/useToken';
import { serverHost } from '../../config';
import LoadingView from '../LoadingView/LoadingView';
import SuccessNotificationPopUp from '../SuccessNotificationPopUp/SuccessNotificationPopUp';
import ErrorNotificationPopUp from '../ErrorNotificationPopUp/ErrorNotificationPopUp';
import usePopUp from '../../hooks/usePopUp';
import ConfirmationPopUp from '../ConfirmationPopUp/ConfirmationPopUp';

/**
 * Botón que incluye las peticiones para asignar/desasignar al usuario de una actividad
 * @param {string} idActivity: Id de la actividad a gestionar.
 * @param {string} Classname: Classname opcional css.
 * @param {func} successCallbackk: Función opcional que se ejecuta al cerrar pop up de éxito.
 * @returns
 */
function AssignToActivityButton({
  idActivity, className, successCallback,
}) {
  const {
    callFetch,
    result,
    loading,
    error,
  } = useFetch();

  const token = useToken();

  const [isSuccessOpen, openSuccess, closeSuccess] = usePopUp();
  const [isErrorOpen, openError, closeError] = usePopUp();
  const [isConfirmationOpen, openConfirmation, closeConfirmation] = usePopUp();

  useEffect(() => {
    if (result) {
      // Abrir popup de exito
      openSuccess();
    }
  }, [result]);

  useEffect(() => {
    // Abrir popup de error
    if (error) openError();
  }, [error]);

  const makePetition = () => {
    const uri = `${serverHost}/activity/${idActivity}/assignment`;

    callFetch({
      uri, method: 'POST', parse: false, headers: { authorization: token },
    });
  };

  const handleConfirmation = (confirmed) => {
    if (confirmed) makePetition();
  };

  return (
    <>
      {!result && (
      <Button
        green
        onClick={openConfirmation}
        disabled={loading}
        className={className}
        text="Inscribirse"
      />
      )}
      {loading && <LoadingView />}

      <ConfirmationPopUp
        close={closeConfirmation}
        isOpen={isConfirmationOpen}
        callback={handleConfirmation}
        body="¿Estás seguro de inscribirte en esta actividad? Ten en cuenta que, al presionar el botón de confirmación, estarás asegurando tu participación."
      />

      <SuccessNotificationPopUp
        close={closeSuccess}
        isOpen={isSuccessOpen}
        text="Te haz inscrito a esta actividad con éxito."
        callback={successCallback}
      />

      <ErrorNotificationPopUp
        close={closeError}
        isOpen={isErrorOpen}
        text={error?.message ?? 'Ocurrió un error al inscribirse en esta actividad.'}
      />
    </>
  );
}

export default AssignToActivityButton;

AssignToActivityButton.propTypes = {
  idActivity: PropTypes.string.isRequired,
  className: PropTypes.string,
  successCallback: PropTypes.func,
};

AssignToActivityButton.defaultProps = {
  className: '',
  successCallback: null,
};
