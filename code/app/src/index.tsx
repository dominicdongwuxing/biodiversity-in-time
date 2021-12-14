import React from "react";
import ReactDOM from "react-dom";
import App from "components/App";
import "index.css";

// import { BrowserRouter } from 'react-router-dom';
// import { setContext } from '@apollo/client/link/context';
import {
  ApolloProvider,
  ApolloClient,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client";
// import { AUTH_TOKEN } from './constants';

import { GlobalStateProvider } from "components/GlobalStateContext";

// const cache = new InMemoryCache({
//   typePolicies: {
//     Tree: {
//       fields: {
//         children: {
//           merge(existing, incoming) {
//             // Equivalent to what happens if there is no custom merge function.
//             return incoming;
//           },
//         },
//       },
//     },
//   },
// });

const httpLink = createHttpLink({
  uri: "http://localhost:4000",
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <GlobalStateProvider>
      <App />
    </GlobalStateProvider>
  </ApolloProvider>,
  document.getElementById("root")
);
