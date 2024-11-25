/* eslint-disable no-console */
import { useColor } from 'color-thief-react';

async function getMeanColor(uri) {
  const { data, error, loading } = useColor(uri, 'hex');

  while (loading || !data || !error) {
    if (data && !error) {
      return data;
    } if (error) {
      console.error('No se ha logrado obtener el color ', error);
      return '#FFFFFF';
    }
  }
  return '#FFFFFF';
}

export default getMeanColor;
