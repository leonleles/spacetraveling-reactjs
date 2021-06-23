import { ReactElement } from 'react';
import Link from 'next/link';

import styles from './header.module.scss';
import stylesCommon from '../../styles/common.module.scss';

export default function Header(): ReactElement {
  return (
    <div className={styles.headerWrapper}>
      <div className={stylesCommon.container}>
        <Link href="/">
          <a>
            <img src="/logo.png" alt="logo" />
          </a>
        </Link>
      </div>
    </div>
  );
}
