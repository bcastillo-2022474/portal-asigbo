import React, { useEffect, useState } from 'react';
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
 * @param {boolean} unassignButton: True: indica que el botón debe de funcionar para desasignar.
 * @param {string} Classname: Classname opcional css.
 * @param {func} successCallbackk: Función opcional que se ejecuta al cerrar pop up de éxito.
 * @returns
 */
function AssignToActivityButton({
  idActivity, unassignButton, className, successCallback,
}) {
  const [assignOption, setAssignOption] = useState(); // true: assign, false: unassign

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
    if (unassignButton === true || unassignButton === false) setAssignOption(!unassignButton);
  }, [unassignButton]);

  useEffect(() => {
    if (result) {
      // Abrir popup de exito
      openSuccess();
      // Cambiar propósito de botón a su opuesto
      setAssignOption(!assignOption);
    }
  }, [result]);

  useEffect(() => {
    // Abrir popup de error
    if (error) openError();
  }, [error]);

  const makePetition = () => {
    const uri = `${serverHost}/activity/${idActivity}/assignment`;
    const method = assignOption ? 'POST' : 'DELETE';

    callFetch({
      uri, method, parse: false, headers: { authorization: token },
    });
  };

  const handleConfirmation = (confirmed) => {
    if (confirmed) makePetition();
  };

  return (
    <>
      <Button
        green={assignOption}
        red={!assignOption}
        onClick={assignOption ? makePetition : openConfirmation}
        disabled={loading}
        className={className}
        text={assignOption ? 'Inscribirse' : 'Retirarse'}
      />
      {loading && <LoadingView />}

      <ConfirmationPopUp
        close={closeConfirmation}
        isOpen={isConfirmationOpen}
        callback={handleConfirmation}
        body="¿Estás seguro de eliminar tu inscripción a esta actividad? Toma en cuenta que tu lugar podría ser ocupado por otro becado."
      />

      <SuccessNotificationPopUp
        close={closeSuccess}
        isOpen={isSuccessOpen}
        // Operación contraria pues en este punto ya se cambió el tipo de operación a la opuesta
        text={`Te haz ${!assignOption ? 'inscrito a' : 'retirado de'} esta actividad con éxito.`}
        callback={successCallback}
      />

      <ErrorNotificationPopUp
        close={closeError}
        isOpen={isErrorOpen}
        text={error?.message ?? `Ocurrió un error al ${assignOption ? 'inscribirse' : 'retirarse'} de esta actividad.'`}
      />
    </>
  );
}

export default AssignToActivityButton;

AssignToActivityButton.propTypes = {
  idActivity: PropTypes.string.isRequired,
  unassignButton: PropTypes.bool,
  className: PropTypes.string,
  successCallback: PropTypes.func,
};

AssignToActivityButton.defaultProps = {
  unassignButton: false,
  className: '',
  successCallback: null,
};
