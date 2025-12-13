const store =`#graphql
  query GetProducts {
    products(first: 10) {
      nodes {
        id
        title
      }
    }
  }`


const graphql = {
  store,
}

export default graphql
