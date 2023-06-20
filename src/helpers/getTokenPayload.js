const aToUTF8 = (encoded) => {
  const decodedToB = window.atob(encoded);
  const unicodeDecoder = new TextDecoder('utf-8');

  const uArray = new Uint8Array(decodedToB.length);
  for (let i = 0; i < decodedToB.length; i += 1) {
    uArray[i] = decodedToB.charCodeAt(i);
  }

  return unicodeDecoder.decode(uArray);
};

export default (token) => {
  if (typeof token !== 'string') throw new Error('Token Invalido.');

  const encodedPayload = token.split('.')[1];

  if (!encodedPayload) throw new Error('Token Invalido.');

  return JSON.parse(aToUTF8(encodedPayload));
};
