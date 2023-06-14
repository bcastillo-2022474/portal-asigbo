export default (token) => {
  if (typeof token !== 'string') throw new Error('Token Invalido.');

  const encodedPayload = token.split('.')[1];

  if (!encodedPayload) throw new Error('Token Invalido.');

  return JSON.parse(window.atob(encodedPayload));
};
