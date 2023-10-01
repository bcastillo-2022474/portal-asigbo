/* eslint-disable no-restricted-syntax */
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import PropTypes from 'prop-types';
import logo from '@assets/logo/logo blanco.png';
import randomString from '../../helpers/randomString';
import styles from './Banner.module.css';

function Banner({ bannerImages }) {
  const refSlider = useRef();
  const refBannerScreens = useRef([]);

  useEffect(() => {
    const carrouselAnimation = gsap.timeline();

    for (let index = 1; index < bannerImages.length; index += 1) {
      carrouselAnimation.to(refSlider.current, { css: { marginLeft: `-${index}00%` }, duration: 2, delay: 15 });
    }

    // creando un bucle
    carrouselAnimation.eventCallback('onComplete', () => {
      // enviando la ultima pantalla al inicio
      const lastScreen = refBannerScreens.current.pop();
      refBannerScreens.current.unshift(lastScreen);

      // modificando el orden
      let order = 1;

      refBannerScreens.current.forEach((screen) => {
        if (screen !== null) {
          // eslint-disable-next-line no-param-reassign
          screen.style.order = order;
          order += 1;
        }
      });

      if (refSlider.current !== null)refSlider.current.style.marginLeft = 0;
      carrouselAnimation.restart();
    });
  }, []);

  return (
    <div className={styles.banner}>
      <div className={styles.logoContainer}>
        <img src={logo} alt="Logo de asigbo" />
      </div>

      <ul style={{ width: `${bannerImages.length}00%` }} ref={refSlider}>
        {bannerImages.map((url, i) => (
          <li
            style={{ backgroundImage: `url(${url})` }}
            key={randomString()}
            ref={(el) => { refBannerScreens.current[i] = el; }}
          />
        ))}
      </ul>
      <svg className={styles.wave} version="1.1" viewBox="0 0 890 60" xmlns="http://www.w3.org/2000/svg">
        <g>
          <title>Layer 1</title>
          <path d="m0 15 13.7-0.5c13.6-0.5 41-1.5 68.3 3.8 27.3 5.4 54.7 17 81.8 15.4 27.2-1.7 54.2-16.7 81.4-12.5 27.1 4.1 54.5 27.5 81.8 28.6 27.3 1.2 54.7-19.8 82-32.5 27.3-12.6 54.7-17 82-6.6 27.3 10.3 54.7 35.3 82 41.8s54.7-5.5 81.8-15c27.2-9.5 54.2-16.5 81.4-12.7 27.1 3.9 54.5 18.5 81.8 22.5s54.7-2.6 68.3-6l13.7-3.3v64h-13.7-68.3-81.8-81.4-81.8-82-82-82-81.8-81.4-81.8-68.3-13.7v-87z" fill="#fafafa" strokeLinecap="round" />
        </g>
      </svg>

      <svg className={`${styles.wave} ${styles.simpleWave}`} viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
        <path d="m0 96 48 5.3c48 5.7 144 15.7 240 37.4 96 21.3 192 53.3 288 58.6 96 5.7 192-16.3 288-42.6 96-26.7 192-58.7 288-69.4 96-10.3 192-0.3 240 5.4l48 5.3v224h-48-240-288-288-288-240-48z" fill="#fff" />
      </svg>

    </div>
  );
}

Banner.propTypes = {
  bannerImages: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Banner;
