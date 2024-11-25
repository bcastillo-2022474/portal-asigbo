import getFileFromBucket from '../../services/cloudStorage/getFileFromBucket.js';
import consts from '../../utils/consts.js';

const getUserImageController = async (req, res) => {
  const { id } = req.params;

  try {
    const fileResult = await getFileFromBucket(`${consts.bucketRoutes.user}/${id}`);
    res.write(fileResult, 'binary');
    res.end(null, 'binary');
  } catch (ex) {
    res.sendStatus(404);
  }
};
const getAreaImageController = async (req, res) => {
  const { id } = req.params;

  try {
    const fileResult = await getFileFromBucket(`${consts.bucketRoutes.area}/${id}`);
    res.write(fileResult, 'binary');
    res.end(null, 'binary');
  } catch (ex) {
    res.sendStatus(404);
  }
};
const getActivityImageController = async (req, res) => {
  const { id } = req.params;

  try {
    const fileResult = await getFileFromBucket(`${consts.bucketRoutes.activity}/${id}`);
    res.write(fileResult, 'binary');
    res.end(null, 'binary');
  } catch (ex) {
    res.sendStatus(404);
  }
};

const getPaymentVoucherImageController = async (req, res) => {
  const { id } = req.params;
  try {
    const fileResult = await getFileFromBucket(`${consts.bucketRoutes.paymentVoucher}/${id}`);
    res.write(fileResult, 'binary');
    res.end(null, 'binary');
  } catch (ex) {
    res.sendStatus(404);
  }
};

const getAssignmentImageController = async (req, res) => {
  const { id } = req.params;

  try {
    const fileResult = await getFileFromBucket(`${consts.bucketRoutes.assignment}/${id}`);
    res.write(fileResult, 'binary');
    res.end(null, 'binary');
  } catch (ex) {
    res.sendStatus(404);
  }
};

export {
  getUserImageController,
  getAreaImageController,
  getActivityImageController,
  getPaymentVoucherImageController,
  getAssignmentImageController,
};
