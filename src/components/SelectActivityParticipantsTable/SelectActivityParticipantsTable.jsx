import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Pagination } from '@mui/material';
import {
  FaUserPlus as AddUserIcon,
  FaUserTimes as RemoveUserIcon,
  FaClipboardList as ListIcon,
} from 'react-icons/fa';
import { AiFillCheckCircle as CheckIcon, AiFillCloseCircle as RemoveIcon } from 'react-icons/ai';

import { useNavigate } from 'react-router-dom';
import styles from './SelectActivityParticipantsTable.module.css';
import ActivityParticipantsTableFilter from '../ActivityParticipantsTableFilter/ActivityParticipantsTableFilter';
import Table from '../Table/Table';
import useFetch from '../../hooks/useFetch';
import useToken from '../../hooks/useToken';
import { serverHost } from '../../config';
import TableRow from '../TableRow/TableRow';
import UserPicture from '../UserPicture/UserPicture';
import UserNameLink from '../UserNameLink/UserNameLink';
import OptionsButton from '../OptionsButton/OptionsButton';
import LoadingView from '../LoadingView/LoadingView';
import ConfirmationPopUp from '../ConfirmationPopUp/ConfirmationPopUp';
import SuccessNotificationPopUp from '../SuccessNotificationPopUp/SuccessNotificationPopUp';
import ErrorNotificationPopUp from '../ErrorNotificationPopUp/ErrorNotificationPopUp';
import usePopUp from '../../hooks/usePopUp';
import useCount from '../../hooks/useCount';

const actions = {
  assign: 'asignar',
  unassign: 'desasignar',
  complete: 'completar',
  uncomplete: 'no completar',
};

const status = {
  completed: 'Completado',
  asigned: 'Asignado',
  unassigned: 'No asignado',
};
function ActivityParticipantsTable({ idActivity }) {
  const {
    callFetch: fetchAssignmets,
    result: assignmentsResult,
    error: assignmentsError,
  } = useFetch();

  const {
    callFetch: fetchUsers,
    result: users,
    error: usersError,
    loading: loadingUsers,
  } = useFetch();

  const {
    callFetch: fetchAssignmentAction,
    result: assignmentActionResult,
    loading: assignmentActionLoading,
    error: assignmentActionError,
  } = useFetch();

  const token = useToken();

  const [initialLoading, setInitialLoading] = useState(true);
  const [assignedUsers, setAssignedUsers] = useState(null);
  const [assignmentCompletedUsers, setAssignmentCompletedUsers] = useState(null);
  const [userFilters, setUserFilters] = useState({});
  const [paginationItems, setPaginationItems] = useState();
  const [currentPage, setCurrentPage] = useState(0);
  // Establece la acción para una asignación que se está realizando
  const [currentAction, setCurrentAction] = useState();
  // Usuario con el que se ejecuta la acción
  const [currentUser, setCurrentUser] = useState(null);

  const [isConfirmationOpen, openConfirmation, closeConfirmation] = usePopUp();
  const [isSuccessOpen, openSuccess, closeSuccess] = usePopUp();
  const [isErrorOpen, openError, closeError] = usePopUp();

  /* Contador (utilizado como trigger) para resetear altura de tabla cuando el
  último menú desaparece */
  const { count: resetTableHeightTrigger, next: fireTableHeightTrigger } = useCount();

  /* Indica si la tabla posee el estilo vertical */
  const [tableVerticalStyle, setTableVerticalStyle] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // obtener asignaciones al iniciar la tabla
    fetchAssignmets({
      uri: `${serverHost}/activity/${idActivity}/assignment`,
      headers: { authorization: token },
    });
  }, []);

  useEffect(() => {
    if (!assignmentsResult) return;
    // Clasificar usuarios dependiendo de estado de asignación
    const assignedUsersToAdd = [];
    const assignmentCompletedUsersToAdd = [];

    assignmentsResult?.forEach((assignment) => {
      // se guarda el user dto
      if (assignment.completed) assignmentCompletedUsersToAdd.push(assignment.user);
      else assignedUsersToAdd.push(assignment.user);
    });

    setAssignedUsers(assignedUsersToAdd);
    setAssignmentCompletedUsers(assignmentCompletedUsersToAdd);
  }, [assignmentsResult]);

  useEffect(() => {
    // Si ocurrió un error al obtener asignaciones, colocar arrays vacios
    if (!assignmentsError) return;
    setAssignedUsers([]);
    setAssignmentCompletedUsers([]);
  }, [assignmentsError]);

  useEffect(() => {
    if (!assignedUsers || !assignmentCompletedUsers) return;

    if (userFilters.status === '1' || userFilters.status === '2' || userFilters.status === '3') { return; } // Búsqueda local

    // Realizar búsqueda de usuarios
    const searchParams = new URLSearchParams({});

    // añadir prioridad a usuarios completados y asignados
    assignmentCompletedUsers.forEach((user) => searchParams.append('priority', user.id));
    assignedUsers.forEach((user) => searchParams.append('priority', user.id));

    // incluir usuarios boqueados
    searchParams.append('includeBlocked', true);

    // Filtros de búsqueda
    const { promotion, search } = userFilters;
    if (promotion) searchParams.append('promotion', promotion);
    if (search) searchParams.append('search', search);

    // Agregar paginación
    searchParams.append('page', currentPage);

    const uri = `${serverHost}/user?${searchParams.toString()}`;
    fetchUsers({ uri, headers: { authorization: token } });
  }, [assignedUsers, assignmentCompletedUsers, userFilters, currentPage]);

  useEffect(() => {
    // Desactiviar loading inicial al obtener listado completo de usuarios (o error)
    if (users || usersError) setInitialLoading(false);
  }, [users, usersError]);

  useEffect(() => {
    // cambiar número en la paginación
    // Esta acción tiene fines estéticos para el número de items a mostrar
    const media = matchMedia('(max-width:700px)');

    const handleMediaChange = (e) => {
      if (e.matches) setPaginationItems(0);
      else setPaginationItems(2);
    };

    media.onchange = handleMediaChange;
    handleMediaChange(media);
  }, []);

  useEffect(() => {
    // resetear num pagina
    setCurrentPage(0);
  }, [userFilters]);

  useEffect(() => {
    if (assignmentActionResult) openSuccess(); // Se culminó exitosamente una acción
  }, [assignmentActionResult]);

  useEffect(() => {
    if (assignmentActionError) openError(); // Ocurrió un error con una acción
  }, [assignmentActionError]);

  const getAssignmentStatus = (idUser) => {
    if (assignmentCompletedUsers.some((user) => user.id === idUser)) return status.completed;
    if (assignedUsers.some((user) => user.id === idUser)) return status.asigned;
    return status.unassigned;
  };

  const handleUserFilterChange = (val) => setUserFilters(val);

  const handlePageChange = (e, page) => {
    setCurrentPage(page - 1);
  };

  const filterUsersByState = () => {
    let selectedUsers;

    if (userFilters.status === '1') selectedUsers = [...assignmentCompletedUsers, ...assignedUsers];
    else if (userFilters.status === '2') selectedUsers = assignedUsers;
    else if (userFilters.status === '3') selectedUsers = assignmentCompletedUsers;
    else return null;
    return selectedUsers.filter((user) => {
      if (userFilters.search?.trim() !== '') {
        // filtrar por nombre
        const searchRegex = new RegExp(userFilters.search, 'gi');
        if (!`${user.name} ${user.lastname}`.match(searchRegex)) {
          return false;
        }
      }

      // filtrar por promocion
      if (
        userFilters.promotion?.trim()?.length > 0
        && user.promotion !== parseInt(userFilters.promotion, 10)
        && user.promotionGroup !== userFilters.promotion
      ) {
        return false;
      }

      return true;
    });
  };

  const assignClickController = (user) => {
    // Se presionó acción de asignar usuario
    setCurrentAction(actions.assign);
    setCurrentUser(user);
    fetchAssignmentAction({
      uri: `${serverHost}/activity/${idActivity}/assignment/${user.id}`,
      method: 'POST',
      headers: { authorization: token },
      parse: false,
    });
  };

  const completeClickController = (user) => {
    // Se presionó acción de completar asignación
    setCurrentAction(actions.complete);
    setCurrentUser(user);
    fetchAssignmentAction({
      uri: `${serverHost}/activity/${idActivity}/assignment/${user.id}`,
      method: 'PATCH',
      headers: { authorization: token },
      parse: false,
      body: JSON.stringify({ completed: true }),
    });
  };

  const unassignClickController = (user) => {
    // Se seleccionó la acción de desasignar usuario
    // Primero se debe pedir confirmación. El fetch de esta acción se realiza en el callback
    // del popUp de confirmación
    setCurrentAction(actions.unassign);
    openConfirmation();
    setCurrentUser(user);
  };
  const uncompleteClickController = (user) => {
    // Se seleccionó la acción de no completar asignación usuario
    // Primero se debe pedir confirmación. El fetch de esta acción se realiza en el callback
    // del popUp de confirmación
    setCurrentAction(actions.uncomplete);
    openConfirmation();
    setCurrentUser(user);
  };

  const handleConfirmationChange = (value) => {
    if (!value || !currentUser) return;

    const request = {
      headers: { authorization: token },
      parse: false,
    };

    // Ejecutar acción correspondiente
    if (currentAction === actions.unassign) {
      request.uri = `${serverHost}/activity/${idActivity}/assignment/${currentUser.id}`;
      request.method = 'DELETE';
    } else if (currentAction === actions.uncomplete) {
      request.uri = `${serverHost}/activity/${idActivity}/assignment/${currentUser.id}`;
      request.method = 'PATCH';
      request.body = JSON.stringify({ completed: false });
    } else return;

    fetchAssignmentAction(request);
  };

  const addUserToArrayOnce = (array) => {
    if (array.some((user) => user.id === currentUser.id)) return array;
    return [...array, currentUser];
  };

  const removeUserFromArray = (array) => array.filter((user) => user.id !== currentUser.id);

  const handleFinishAction = async () => {
    // Modificar arreglos de usuarios según su estado
    if (currentAction === actions.assign) {
      // agregar current user a usuarios asignados si no está aún
      setAssignedUsers(addUserToArrayOnce);
    } else if (currentAction === actions.unassign) {
      // retirar current user de usuarios asignados
      setAssignedUsers(removeUserFromArray);
    } else if (currentAction === actions.complete) {
      // agregar current user a usuarios completados si no está aún
      setAssignmentCompletedUsers(addUserToArrayOnce);
      setAssignedUsers(removeUserFromArray); // Retirarlo de usuarios asignados
    } else if (currentAction === actions.uncomplete) {
      setAssignmentCompletedUsers(removeUserFromArray); // Retirarlo de usuarios completados
      setAssignedUsers(addUserToArrayOnce); // Agregarlo a inscritos si no está aún
    }
  };

  /**
   * Callback para cuando el estado de visibilidad de los menus de acciones cambia.
   * Busca resetear el alto de la tabla.
   */
  const handleActionMenuVisibilityChange = (isVisible) => {
    if (!isVisible) fireTableHeightTrigger();
  };

  const handleTableStyleChange = (isVertical) => setTableVerticalStyle(isVertical);

  const usersToShow = !userFilters.status || userFilters.status === '' // Si posee filtro de estado, filtrar datos locales
    ? users?.result
    : filterUsersByState();

  return (
    <>
      <ActivityParticipantsTableFilter onChange={handleUserFilterChange} />

      <Table
        header={['No.', '', 'Nombre', 'Promoción', 'Estado', '']}
        loading={(initialLoading || loadingUsers)}
        showNoResults={usersError !== undefined && usersError !== null}
        resetTableHeight={resetTableHeightTrigger}
        breakPoint="1100px"
        onTableStyleChange={handleTableStyleChange}
        showCheckbox={false}
      >
        {usersToShow?.map((user, index) => {
          const currentStatus = getAssignmentStatus(user.id);
          return (
            <TableRow id={user.id} key={user.id}>
              <td>{(users ? users.resultsPerPage * currentPage : 0) + index + 1}</td>
              <td className={styles.pictureRow}>
                <UserPicture name={user.name} idUser={user.id} hasImage={user.hasImage ?? false} />
              </td>
              <td className={styles.nameRow}>
                <UserNameLink idUser={user.id} name={`${user.name} ${user.lastname}`} />
              </td>
              <td className={styles.promotionRow}>{user.promotion}</td>
              <td className={styles.statusRow}>{currentStatus}</td>
              <td className={styles.buttonRow}>
                <OptionsButton
                  onMenuVisibleChange={handleActionMenuVisibilityChange}
                  showMenuAtTop={
                    // En estilo vertical siempre se muestra arriba
                    // O las últimas 2 filas cuando hay al menos 3 en total
                    tableVerticalStyle || (index > usersToShow.length - 3 && index >= 2)
                  }
                  className={styles.optionsButton}
                  options={(() => {
                    if (currentStatus === status.completed) {
                      return [
                        {
                          icon: <ListIcon />,
                          text: 'Ver detalles',
                          onClick: () => navigate(`/actividad/${idActivity}/asignacion/${user.id}`),
                        },
                        {
                          icon: <RemoveIcon />,
                          text: 'No completar',
                          onClick: () => uncompleteClickController(user),
                        },
                      ];
                    }
                    if (currentStatus === status.asigned) {
                      return [
                        {
                          icon: <ListIcon />,
                          text: 'Ver detalles',
                          onClick: () => navigate(`/actividad/${idActivity}/asignacion/${user.id}`),
                        },
                        {
                          icon: <CheckIcon />,
                          text: 'Completar',
                          onClick: () => completeClickController(user),
                        },
                        {
                          icon: <RemoveUserIcon />,
                          text: 'Desasignar',
                          onClick: () => unassignClickController(user),
                        },
                      ];
                    }
                    return [
                      {
                        icon: <AddUserIcon />,
                        text: 'Asignar',
                        onClick: () => assignClickController(user),
                      },
                    ];
                  })()}
                />
              </td>
            </TableRow>
          );
        })}
      </Table>

      {(!userFilters.status || userFilters.status === '') && (
        <Pagination
          count={users?.pages ?? 0}
          siblingCount={paginationItems}
          className={styles.pagination}
          onChange={handlePageChange}
          page={currentPage + 1}
        />
      )}

      {assignmentActionLoading && <LoadingView />}

      <ConfirmationPopUp
        close={closeConfirmation}
        isOpen={isConfirmationOpen}
        callback={handleConfirmationChange}
        body={
          currentAction === actions.unassign
            ? '¿Estás seguro de desasignar a este usuario de la actividad?'
            : '¿Estás seguro de remover el estado de completado para la asignación de este usuario?'
        }
      />

      <SuccessNotificationPopUp
        isOpen={isSuccessOpen}
        close={closeSuccess}
        text={(() => {
          if (currentAction === actions.assign) {
            return 'El usuario ha sido asignado de forma exitosa.';
          }
          if (currentAction === actions.unassign) {
            return 'El usuario ha sido desasignado de forma exitosa.';
          }
          if (currentAction === actions.complete) {
            return 'La asignación del usuario a esta actividad ha sido marcada como completada.';
          }
          if (currentAction === actions.uncomplete) {
            return 'La asignación del usuario a esta actividad ha sido marcada como no completada.';
          }
          return 'Operación exitosa.';
        })()}
        callback={handleFinishAction}
      />
      <ErrorNotificationPopUp
        isOpen={isErrorOpen}
        close={closeError}
        text={assignmentActionError?.message}
      />
    </>
  );
}

export default ActivityParticipantsTable;

ActivityParticipantsTable.propTypes = {
  idActivity: PropTypes.string.isRequired,
};

ActivityParticipantsTable.defaultProps = {};
