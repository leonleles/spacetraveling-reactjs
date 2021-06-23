import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { ReactElement, useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Link from 'next/link';

import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';
import commonStyles from '../styles/common.module.scss';
import { dateToBr } from '../util/dateToBr';

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

export default function Home({ postsPagination }: HomeProps): ReactElement {
  const [posts, setPosts] = useState(postsPagination.results || []);
  const [nextPage, setNextPage] = useState(postsPagination.next_page || null);

  async function handlerNextPage(): Promise<void> {
    const response = await fetch(nextPage);

    response.json().then(function (json) {
      const results = json.results.map(post => {
        return {
          uid: post.uid,
          first_publication_date: dateToBr(
            new Date(post.last_publication_date)
          ),
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author,
          },
        };
      });

      const newResults = [...posts, ...results];

      setPosts(newResults);
      setNextPage(json.next_page);
    });
  }

  return (
    <>
      <Header />
      <div className={commonStyles.container}>
        <div className={styles.postsWrapper}>
          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <div className={styles.post}>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={styles.postDetails}>
                  <div className={styles.field}>
                    <FiCalendar color="#bbbbbb" size={20} />
                    <span>{post.first_publication_date}</span>
                  </div>
                  <div className={styles.field}>
                    <FiUser color="#bbbbbb" size={20} />
                    <span>{post.data.author}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {nextPage && (
          <button
            onClick={handlerNextPage}
            type="button"
            className={styles.button}
          >
            Carregar mais posts
          </button>
        )}
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 1,
    }
  );

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: dateToBr(new Date(post.last_publication_date)),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        results,
        next_page: postsResponse.next_page,
      },
    },
  };
};
