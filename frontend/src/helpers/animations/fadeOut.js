import { gsap } from 'gsap';

const fadeOut = (component, time, callback) => {
  const timeInSeconds = time / 1000;

  const tl = gsap.timeline({
    defaults: { duration: timeInSeconds },
  });

  tl.to(component, { opacity: 0 });
  tl.eventCallback('onComplete', callback);
};

export default fadeOut;
