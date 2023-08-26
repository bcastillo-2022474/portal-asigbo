import { useState } from 'react';

function useCount(startValue) {
  const [count, setCount] = useState(startValue || null);

  const next = () => setCount((prev) => (Number.isNaN(parseInt(count, 10)) ? 0 : prev + 1));
  const previous = () => setCount((prev) => (Number.isNaN(parseInt(count, 10)) ? 0 : prev - 1));

  return { count, next, previous };
}

export default useCount;
