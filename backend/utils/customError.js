/**
 * @returns Error object, with property message and status.
 */
export default class CustomError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
