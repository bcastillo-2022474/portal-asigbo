import { useState } from 'react';

function useToogle(initValue = true) {
  const [value, setValue] = useState(initValue);

  const toogle = () => setValue((val) => !val);

  return [value, toogle, setValue];
}

export default useToogle;
