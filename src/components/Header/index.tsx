import { ReactElement } from 'react';

import styles from './header.module.scss';
import stylesCommon from '../../styles/common.module.scss';

export default function Header(): ReactElement {
  return (
    <div className={styles.headerWrapper}>
      <div className={stylesCommon.container}>
        <img src="logo.png" alt="logo" />
      </div>
    </div>
  );
}
