import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';

import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { dateToBr } from '../../util/dateToBr';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const readingTime = post.data.content.reduce((time, obj) => {
    const { body } = obj;

    const numWords = body.reduce((val, obj2) => {
      return val + obj2.text.split(' ').length;
    }, 0);

    return time + numWords;
  }, 0);

  return (
    <>
      <Header />
      <div className={styles.singleContainer}>
        <img
          width="100%"
          height="25rem"
          className={styles.banner}
          src={post.data.banner.url}
          alt="Banner"
        />

        <div className={commonStyles.container}>
          <h1>{post.data.title}</h1>
          <div className={styles.postDetails}>
            <div className={styles.field}>
              <FiCalendar color="#bbbbbb" size={20} />
              <span>{dateToBr(new Date(post.first_publication_date))}</span>
            </div>
            <div className={styles.field}>
              <FiUser color="#bbbbbb" size={20} />
              <span>{post.data.author}</span>
            </div>
            <div className={styles.field}>
              <FiClock color="#bbbbbb" size={20} />
              <span>{Math.round(readingTime / 200)} min</span>
            </div>
          </div>

          <article>
            {post.data.content.map((content, index) => {
              return (
                <div key={String(index)} className={styles.group}>
                  <strong>{content.heading}</strong>
                  <p
                    className={styles.postContent}
                    dangerouslySetInnerHTML={{
                      __html: RichText.asHtml(content.body),
                    }}
                  />
                </div>
              );
            })}
          </article>
        </div>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 2,
    }
  );

  const paths = posts.results.map(post => {
    return { params: { slug: String(post.uid) } };
  });

  return {
    paths, // quais posts deve
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 30, // 30 minutos
  };
};
