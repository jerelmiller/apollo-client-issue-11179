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
    me @synthetics(timeout: 3000) {
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
  const [token, setToken] = useState<string | null>(null);

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          setToken(String(form.get('token')));
        }}
      >
        <input type="text" name="token" placeholder="Enter token" />
        <button type="submit">Submit</button>
      </form>
      {token && <Albums token={token} />}
    </>
  );
}

function Albums({ token }: { token: string }) {
  console.log('rerender with token', token);
  const [queryRef, { refetch }] = useBackgroundQuery(query, {
    context: {
      token,
    },
  });

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
        <AlbumsView queryRef={queryRef} />;
      </ErrorBoundary>
    </Suspense>
  );
}

function AlbumsView({ queryRef }: { queryRef: QueryReference<ArtistsQuery> }) {
  const { data } = useReadQuery(queryRef);

  return data.me.albums.edges.map(({ node: album }) => (
    <div key={album.id}>{album.name}</div>
  ));
}

export default App;
