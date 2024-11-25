import fs from 'node:fs';
import { connection } from '../../db/connection.js';
import uploadFileToBucket from '../../services/cloudStorage/uploadFileToBucket.js';
import consts from '../../utils/consts.js';
import CustomError from '../../utils/customError.js';
import {
  createAsigboArea,
  updateAsigboArea,
  getAreas,
  deleteAsigboArea,
  getArea,
  updateAsigboAreaBlockedStatus,
  getAreasWhereUserIsResponsible,
  validateResponsible,
  // validateResponsible,
} from './asigboArea.model.js';
import Promotion from '../promotion/promotion.model.js';
import deleteFileInBucket from '../../services/cloudStorage/deleteFileInBucket.js';
import { addRoleToUser, removeRoleFromUser } from '../user/user.model.js';
import { forceSessionTokenToUpdate } from '../session/session.model.js';
import { getActivities } from '../activity/activity.model.js';
import errorSender from '../../utils/errorSender.js';

/* const validateResponsibleController = async ({ idUser, idArea }) => {
  const result = await validateResponsible({ idUser, idArea });
  if (!result) throw new CustomError('No cuenta con permisos de encargado sobre esta área.');
  return true;
}; */

const removeAsigboAreaResponsibleRole = async ({ idUser, session }) => {
  const areas = await getAreasWhereUserIsResponsible({ idUser, session });
  if (areas === null) {
    // El unico eje en el que es responsable es en el que se le eliminó, retirar permiso
    await removeRoleFromUser({ idUser, role: consts.roles.asigboAreaResponsible, session });

    // Forzar actualizar sesión del usuario
    await forceSessionTokenToUpdate({ idUser, session });
  }
};

const addAsigboAreaResponsibleRole = async ({ idUser, session }) => {
  const roleAdded = await addRoleToUser({ idUser, role: consts.roles.asigboAreaResponsible, session });
  if (roleAdded) await forceSessionTokenToUpdate({ idUser, session });
};

const updateAsigboAreaController = async (req, res) => {
  const { name, responsible, color } = req.body;
  const { idArea } = req.params;

  const session = await connection.startSession();

  const file = req.uploadedFiles?.[0];
  const filePath = file ? `${global.dirname}/files/${file.fileName}` : null;

  try {
    session.startTransaction();

    const { dataBeforeChange, dataAfterChange } = await updateAsigboArea({
      idArea, name, responsible, color, session,
    });

    const responsibleToAdd = responsible.filter(
      (userId) => !dataBeforeChange.responsible.some((user) => user.id === userId),
    );
    const responsibleToRemove = dataBeforeChange.responsible
      .filter((user) => !responsible.some((userId) => user.id === userId))
      .map((user) => user.id);

    // añadir privilegios para los encargados nuevos
    await Promise.all(
      responsibleToAdd.map(async (idUser) => addAsigboAreaResponsibleRole({ idUser, session })),
    );

    // retirar privilegios
    await Promise.all(
      responsibleToRemove.map(async (idUser) => removeAsigboAreaResponsibleRole({ idUser, session })),
    );

    // actualizar icono si se subió nueva imagen
    if (file) {
      const fileKey = `${consts.bucketRoutes.area}/${idArea}`;

      // eliminar imagen antigua
      try {
        await deleteFileInBucket(fileKey);
      } catch (err) {
        // No se encontró el archivo o no se pudo eliminar
      } finally {
        // intentar subir nueva imágen
        await uploadFileToBucket(fileKey, filePath, file.type);
      }
    }

    await session.commitTransaction();

    res.send(dataAfterChange);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al actualizar el area.', session,
    });
  } finally {
    session.endSession();
    // Eliminar archivo provisional
    if (filePath) fs.unlink(filePath, () => { });
  }
};

const createAsigboAreaController = async (req, res) => {
  const { name, responsible, color } = req.body;
  const session = await connection.startSession();

  const file = req.uploadedFiles?.[0];
  const filePath = file ? `${global.dirname}/files/${file.fileName}` : null;

  try {
    session.startTransaction();

    const area = await createAsigboArea({
      name,
      responsible,
      color,
      session,
    });

    // añadir privilegios para los encargados
    await Promise.all(
      responsible.map(async (idUser) => addAsigboAreaResponsibleRole({ idUser, session })),
    );

    // subir archivo del ícono del área
    if (!file) throw new CustomError("El ícono del área es obligatorio en el campo 'icon'.", 400);

    const fileKey = `${consts.bucketRoutes.area}/${area.id}`;

    await uploadFileToBucket(fileKey, filePath, file.type);

    await session.commitTransaction();

    res.send(area);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al crear nueva area.', session,
    });
  } finally {
    session.endSession();
    // Eliminar archivo provisional
    if (file) fs.unlink(filePath, () => { });
  }
};

const getAsigboAreaController = async (req, res) => {
  const { idArea } = req.params;
  try {
    // Si no es admin, validar que sea encargado de área
    if (!req.session.role.includes(consts.roles.admin)) {
      await validateResponsible({ idUser: req.session.id, idArea });
    }

    const areaData = await getArea({ idArea });
    if (!areaData) throw new CustomError('No se encontró la información del área proporcionada.', 404);

    // get user promotion group
    const promotionObj = new Promotion();

    areaData.responsible = await Promise.all(
      areaData.responsible.map(async (user) => ({
        ...user,
        promotionGroup: await promotionObj.getPromotionGroup(user.promotion),
      })),
    );

    res.send(areaData);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al obtener area de asigbo.',
    });
  }
};

const deleteAsigboAreaController = async (req, res) => {
  const { idArea } = req.params;
  const session = await connection.startSession();

  try {
    session.startTransaction();

    const activities = await getActivities({ idAsigboArea: idArea, throwNotFoundError: false });

    if (activities?.length > 0) { throw new CustomError('No se puede eliminar el eje, pues este contiene actividades.', 400); }

    const area = await deleteAsigboArea({ idArea, session });

    // remover permisos
    await Promise.all(
      area.responsible.map((user) => removeAsigboAreaResponsibleRole({ idUser: user.id, session })),
    );

    await session.commitTransaction();

    // eliminar icono
    try {
      const fileKey = `${consts.bucketRoutes.area}/${idArea}`;
      await deleteFileInBucket(fileKey);
    } catch (err) {
      // error al eliminar archivo (no critico)
    }

    res.sendStatus(204);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al eliminar el area.', session,
    });
  } finally {
    session.endSession();
  }
};

const getAreasController = async (req, res) => {
  try {
    let areas;
    if (req.session.role.includes(consts.roles.admin)) areas = await getAreas({ sort: true });
    else areas = await getAreasWhereUserIsResponsible({ idUser: req.session.id, sort: true });

    if (!areas) throw new CustomError('No se encontraron resultados.', 404);

    res.send(areas);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al obtener areas activas.',
    });
  }
};

const disableAsigboAreaController = async (req, res) => {
  const { idArea } = req.params;

  const session = await connection.startSession();
  try {
    session.startTransaction();

    await updateAsigboAreaBlockedStatus({ idArea, blocked: true, session });

    await session.commitTransaction();

    res.sendStatus(204);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al deshabilitar el eje de asigbo.', session,
    });
  } finally {
    session.endSession();
  }
};

const enableAsigboAreaController = async (req, res) => {
  const { idArea } = req.params;

  const session = await connection.startSession();
  try {
    session.startTransaction();

    await updateAsigboAreaBlockedStatus({ idArea, blocked: false, session });

    await session.commitTransaction();

    res.sendStatus(204);
  } catch (ex) {
    await errorSender({
      res, ex, defaultError: 'Ocurrio un error al habilitar el eje de asigbo.', session,
    });
  } finally {
    session.endSession();
  }
};

export {
  createAsigboAreaController,
  updateAsigboAreaController,
  getAreasController,
  deleteAsigboAreaController,
  getAsigboAreaController,
  disableAsigboAreaController,
  enableAsigboAreaController,
};
