import { GetStaticProps } from 'next';
import { ReactElement } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';

import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';
import commonStyles from '../styles/common.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home(): ReactElement {
  return (
    <>
      <Header />
      <div className={commonStyles.container}>
        <ul className={styles.postsWrapper}>
          <li className={styles.post}>
            <strong>Como utilizar Hooks</strong>
            <p>Pensando em sincronização em vez de ciclos de vida.</p>
            <div className={styles.postDetails}>
              <div className={styles.field}>
                <FiCalendar color="#bbbbbb" size={20} />
                <span>15 Mar 2021</span>
              </div>
              <div className={styles.field}>
                <FiUser color="#bbbbbb" size={20} />
                <span>Joseph Oliveira</span>
              </div>
            </div>
          </li>
        </ul>

        <button type="button" className={styles.button}>
          Carregar mais posts
        </button>
      </div>
    </>
  );
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
