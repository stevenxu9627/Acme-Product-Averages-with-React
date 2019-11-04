/* eslint-disable react/react-in-jsx-scope */
const { Component } = React;
const { render } = ReactDOM;
const { HashRouter, Route, Switch, Link, Redirect } = ReactRouterDOM;
const root = document.getElementById('root');
const API = "https://acme-users-api-rev.herokuapp.com/api";


const Nav = (props) => {
    const path = props.location.pathname;
    console.log(props);
    return (
        <div>
            <h1></h1>
            <Link to='/home' className = {path === 'home' ? 'selected': ''}>
            Home
            </Link>
            <Link to='/products' className = {path === 'home' ? 'selected': ''}>
            Products
            </Link>
        </div>
    );
};

const Home = ({ products, offerings, companies }) => {
    const numProducts = products.length;
    const avgPrice = (
      offerings.reduce((total, offer) => {
        total += offer.price;
        return total;
      }, 0) / offerings.length
    ).toFixed(2);
    return (
      <div>
        <h2>Home</h2>
        <p>{`We have ${numProducts} products with an average price of ${avgPrice}`}</p>
      </div>
    );
  };
  const Products = ({ products, offerings, companies }) => {
    const processedOfferings = offerings.map(offer => {
      companies.forEach(company => {
        if (company.id === offer.companyId) {
          offer.company = company;
        }
      });
      return offer;
    });
    const processedProducts = products.map(product => {
      product.offers = [];
      processedOfferings.forEach(offer => {
        if (offer.productId === product.id) {
          product.offers.push(offer);
        }
      });
      product.avgPrice = (
        product.offers.reduce((total, offer) => {
          total += offer.price;
          return total;
        }, 0) / product.offers.length
      ).toFixed(2);
      product.lowestOffer = product.offers.reduce((accum, curr) => {
        if (accum.price > curr.price) {
          accum = curr;
        }
        return accum;
      });
      return product;
    });
    console.log("processed offers", processedProducts);
    return (
      <div>
        <h2>Products</h2>
        <div id="products">
          {processedProducts.map(product => {
            return (
              <div id={product.name} className="productCard">
                <ul>
                  <li>
                    <h3>Product:</h3> {product.name}
                  </li>
                  <li>
                    <h3>Suggested Price:</h3> {product.suggestedPrice}
                  </li>
                  <li>
                    <h3>Average Price:</h3> {product.avgPrice}
                  </li>
                  <li>
                    <h3>Lowest Price:</h3> {product.lowestOffer.price}{" "}
                    offered by {product.lowestOffer.company.name}
                  </li>
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  class App extends Component {
    constructor() {
      super();
      this.state = {
        products: [],
        offerings: [],
        companies: []
      };
    }
    componentDidMount() {
      Promise.all([
        axios.get("https://acme-users-api-rev.herokuapp.com/api/companies"),
        axios.get("https://acme-users-api-rev.herokuapp.com/api/products"),
        axios.get("https://acme-users-api-rev.herokuapp.com/api/offerings")
      ])
        .then(responses => responses.map(response => response.data))
        .then(([companies, products, offerings]) => {
          this.setState({ products, offerings, companies });
        });
    }
    render() {
      const { products, offerings, companies } = this.state;
      // console.log("products", products);
      // console.log("offerings", offerings);
      // console.log("companies", companies);
      return (
        <HashRouter>
          <Route
            render={({ location }) => <Nav path={location.pathname} />}
          />
          <Switch>
            <Route
              path="/home"
              render={() => (
                <Home
                  products={products}
                  offerings={offerings}
                  companies={companies}
                />
              )}
            />
            <Route
              path="/products"
              render={() => (
                <Products
                  products={products}
                  offerings={offerings}
                  companies={companies}
                />
              )}
            />
            <Redirect to="/home" />
          </Switch>
        </HashRouter>
      );
    }
  }
  const root = document.getElementById("root");
  render(<App />, root);