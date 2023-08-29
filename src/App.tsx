import { Suspense, useState } from 'react';
import {
  useBackgroundQuery,
  useReadQuery,
  gql,
  QueryReference,
  TypedDocumentNode,
} from '@apollo/client';
import './App.css';
import { ErrorBoundary } from 'react-error-boundary';

interface ArtistsQuery {
  me: {
    albums: {
      edges: ReadonlyArray<{ node: { id: string; name: string } }>;
    };
  };
}

const query: TypedDocumentNode<ArtistsQuery> = gql`
  query ArtistsQuery {
    me @synthetics(timeout: 1000, errorRate: 0.5) {
      albums {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  }
`;

function App() {
  const [queryRef, { refetch }] = useBackgroundQuery(query);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary
        onReset={() => refetch()}
        fallbackRender={({ error, resetErrorBoundary }) => {
          return (
            <>
              <button onClick={resetErrorBoundary}>Retry</button>
              <div>{error.message}</div>
            </>
          );
        }}
      >
        <Albums queryRef={queryRef} />
      </ErrorBoundary>
    </Suspense>
  );
}

function Albums({ queryRef }: { queryRef: QueryReference<ArtistsQuery> }) {
  const { data } = useReadQuery(queryRef);

  return data.me.albums.edges.map(({ node: album }) => (
    <div key={album.id}>{album.name}</div>
  ));
}

export default App;
