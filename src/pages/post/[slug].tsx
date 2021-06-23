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
      };
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): ReactElement {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  const readingTime = post.data.content.reduce((time, obj) => {
    const { body } = obj;
    const bodyWords = body.text.split(' ');

    return time + bodyWords.length;
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
              <span>{post.first_publication_date}</span>
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
            {post.data.content.map(content => {
              return (
                <div key={content.heading} className={styles.group}>
                  <strong>{content.heading}</strong>
                  <p>{content.body.text}</p>
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
    paths, // quais posts devem gerar durante a build array({slug})
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});
  const { data } = response;

  const contents = data.content.map(item => {
    return {
      heading: item.heading,
      body: {
        text: RichText.asText(item.body),
      },
    };
  });

  const post = {
    first_publication_date: response.last_publication_date
      ? dateToBr(new Date(response.last_publication_date))
      : null,
    data: {
      title: data.title,
      banner: {
        url: data.banner?.url || '',
      },
      author: data.author,
      content: contents,
    },
  };

  return {
    props: {
      post,
    },
  };
};
