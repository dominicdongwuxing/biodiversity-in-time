import React from "react";
import ReactDOM from "react-dom";
import App from "components/App";
import "index.css"

// import { BrowserRouter } from 'react-router-dom';
// import { setContext } from '@apollo/client/link/context';
import {
  ApolloProvider,
  ApolloClient,
  createHttpLink,
  InMemoryCache
} from '@apollo/client';
// import { AUTH_TOKEN } from './constants';

const httpLink = createHttpLink({
    uri: "http://localhost:4000"
});

const client = new ApolloClient ({
    link: httpLink,
    cache: new InMemoryCache()
});

ReactDOM.render(
    <ApolloProvider client = {client}>
        <App />
    </ApolloProvider>,
    document.getElementById("root")
);
