import React, { Component } from 'react';
import localForage from "localforage";
import logo from './logo.svg';
import blackPin from './icons/pin_black.svg';
import searchIcon from './icons/search.svg';
import searchIconC from './icons/search_c.svg';
import ng from './icons/nigeria.svg'
import us from './icons/usa.svg'
import uk from './icons/uk.svg'
// import global from './icons/global.svg'
import err from './images/err.svg'
import Headroom from 'react-headroom'

import './App.css';
import NewsCard from './components/NewsCard';
import { API_KEY } from './key';

const BASE_URL = 'https://newsapi.org/v2/';
const config = {
  headers: {
    'Authorization': API_KEY
  }
}

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      fetching: true,
      error: null,
      countries: [
        // { name: 'Global', flag: gb },
        { name: 'NG', flag: ng },
        { name: 'GB', flag: uk },
        { name: 'US', flag: us }
      ],
      activeCountry: { name: 'NG', flag: ng },
      categories: [
        { title: 'general', active: false },
        { title: 'business', active: false },
        { title: 'entertainment', active: false },
        { title: 'health', active: false },
        { title: 'science', active: false },
        { title: 'sports', active: false },
        { title: 'technology', active: false },
      ],

      //news from Nigeria
      ng: {
        default: [],
        business: [],
        entertainment: [],
        general: [],
        health: [],
        science: [],
        sports: [],
        technology: []
      },

      //news from the United Kingdom
      gb: {
        default: [],
        business: [],
        entertainment: [],
        general: [],
        health: [],
        science: [],
        sports: [],
        technology: []
      },

      //news from the United States
      us: {
        default: [],
        business: [],
        entertainment: [],
        general: [],
        health: [],
        science: [],
        sports: [],
        technology: []
      },
      filter: ['default'],
      query: '',
      search: false,
      searchResult: [],
      offline: false

    }

  }

  componentDidMount() {
    this.fetchNews();
  }

  getActiveCountry = () => {
    if (this.state.activeCountry.name === 'NG')
      return this.state.ng;
    else if (this.state.activeCountry.name === 'GB')
      return this.state.gb;
    else
      return this.state.us;
  }

  //filter rendered news card based on active country and category
  filter = () => {
    let list = [];

    this.state.filter.map(category => {
      let newList = this.getActiveCountry()[category];
      list = [...newList, ...list];
      return true;
    })

    return list;
  };

  setFilter = (e, filter) => {
    if (e.target.checked) {
      this.setState(prevState => {
        let list = (prevState.filter.includes('default')) ? // re-render cards based on filter
          [filter]
          :
          [...prevState.filter, filter];

        return {
          ...prevState,
          filter: [...list]
        }
      })
    } else {
      this.setState(prevState => {
        let list = [];
        prevState.filter.includes(filter) ?
          list = [...prevState.filter.filter(category => category !== filter && category !== 'default'), ...['default']] // ...['default'] : to render default category when all filters have been unchecked.
          :
          list = [...prevState.filter.filter(c => c !== 'default')];

        return {
          ...prevState,
          filter: list
        }
      })
    }
  }


  fetchNews() {
    this.setState({fetching: true});

    this.state.countries.map(region => {

      let country = region.name;

      Promise.all([
        fetch(`${BASE_URL}top-headlines?country=${country}`, config),
        fetch(`${BASE_URL}top-headlines?country=${country}&category=general`, config),
        fetch(`${BASE_URL}top-headlines?country=${country}&category=business`, config),
        fetch(`${BASE_URL}top-headlines?country=${country}&category=entertainment`, config),
        fetch(`${BASE_URL}top-headlines?country=${country}&category=health`, config),
        fetch(`${BASE_URL}top-headlines?country=${country}&category=science`, config),
        fetch(`${BASE_URL}top-headlines?country=${country}&category=sports`, config),
        fetch(`${BASE_URL}top-headlines?country=${country}&category=technology`, config),
      ])
        .then(
          ([def, gen, biz, ent, health, sci, sports, tech]) => Promise.all([
            def.json(),
            gen.json(),
            biz.json(),
            ent.json(),
            health.json(),
            sci.json(),
            sports.json(),
            tech.json()
          ])
        )
        .then(([def, gen, biz, ent, health, sci, sports, tech]) => {

          let data = {
            default: def.articles,
            general: gen.articles,
            business: biz.articles,
            entertainment: ent.articles,
            health: health.articles,
            science: sci.articles,
            sports: sports.articles,
            technology: tech.articles
          }
          this.setState((prevState) => {
            return {
              [country.toLowerCase()]: {
                ...prevState[`${country.toLowerCase()}`],
                ...data
              },
              fetching: false,
              offline: false
            }

          })

          localForage.setItem(country.toLowerCase(), data)
            .then(value => console.log(value))
            .catch(err => console.error("Something went wrong while storing data."))
        })
        .catch(e => {


          localForage.getItem(country.toLowerCase())
            .then(data => {
              if (data !== null)
                this.setState((prevState) => {
                  return {
                    [country.toLowerCase()]: {
                      ...prevState[`${country.toLowerCase()}`],
                      ...data
                    },
                    fetching: false,
                    offline: true
                  }

                })
              else
                this.setState({ error: true, fetching: false })
              console.log(e)
            })
        });

      return true;

    })
  }

  search() {
    if (this.state.offline) {
      alert("Can't perform a search while offline")
      return;
    }

    else if (this.state.query) {
      this.setState({ fetching: true });

      fetch(`${BASE_URL}everything?q=${this.state.query}&language=en&sortBy=relevancy`, config)
        .then(res => res.json())
        .then(data => {

          this.setState(prevState => {
            return {
              ...prevState,
              searchResult: data.articles,
              search: true,
              fetching: false
            }
          })
        })
        .catch(err => {
          this.setState({ error: true, fetching: false })
          console.log(err)
        })

    } else {
      alert('Search query empty')
    }
  }

  //css argument: to add style for either mobile or desktop
  _renderInput(css) {
    return (
      <div className={`inputContainer ${css}`}>
        <input value={this.state.query} type="text" className="" placeholder="Search..." id="searchText" onChange={(e) => this.setState({ query: e.target.value })}
          onKeyPress={(e) => {
            if (e.key === 'Enter')
              this.search();
          }}
        />
        <button onClick={() => this.search()}>
          <img src={searchIconC} alt="" />
        </button>
      </div>
    )
  }

  _renderCategories = () =>
    this.state.categories.map((category, index) =>

      <div key={index}>
        <label className="checkbox-container">
          <span className="category">{category.title}</span>
          <input type="checkbox" value={category.title} defaultChecked={category.active} onChange={event => {
            this.setFilter(event, `${category.title}`)
            this.setState(prevState => {
              return {
                ...prevState,
                categories: [
                  ...(prevState.categories.map(c => {
                    if (c === category) {
                      c.active = !category.active;
                      return c;
                    }
                    return c
                  }))
                ]
              }
            })
          }} disabled={this.state.fetching || this.state.search} />
          <span className="checkmark"></span>
        </label>
      </div>

    )


  setActiveCountry(country) {
    this.setState({ activeCountry: country })
  }

  card(news, index) {
    return <NewsCard
      urlToImage={news.urlToImage}
      url={news.url}
      title={news.title}
      source={news.source}
      description={news.description}
      publishedAt={news.publishedAt}
      key={index} />
  }
  renderCards = (type) =>
    this.state.error ? <NewsCard
      urlToImage={err}
      url={'#'}
      title={'Oops! Something went wrong.. 😥'}
      source={'Network'}
      description={'News just reaching us suggests that an error ocurred while connecting to the News.org API. Please try again'}
      publishedAt={new Date()} />
      :
      this.cardGroup(type)



  cardGroup = (type) =>
    type === 'search' ?
      this.state.searchResult.map((news, index) => this.card(news, index))
      :
      this.filter().map((news, index) => this.card(news, index))



  render() {
    return (
      <div style={{ boxSizing: 'border-box' }}>
        <Headroom>
          <header className="header">

            <img src={logo} className="logo" alt="News blitz logo" />

            {this._renderInput('d')}

            <div className="buttons">

              <div className="mobile-search">

                <button className="search-btn">
                  <img src={searchIcon} alt="search icon" className="icon" />
                </button>

                <div className="s-view">
                  {this._renderInput('m')}
                </div>
              </div>

              <button className="pin-btn">
                <img src={blackPin} alt="Pin icon" className="icon" />
              </button>

              <div className="dropdown">

                <button className="drop-btn">

                  <img src={this.state.activeCountry.flag} alt="" />
                  {this.state.activeCountry.name === 'GB' ? 'UK' : this.state.activeCountry.name}

                  <span className="caret"></span>
                </button>

                <div className="dropdown-content">
                  {this.state.countries.map((country, index) => {
                    if (country.name !== this.state.activeCountry.name)
                      return (<button className="country" key={index} onClick={() => this.setActiveCountry(country)}><img src={country.flag} alt="flag" />{country.name === 'GB' ? 'UK' : country.name}</button>)
                    else
                      return true
                  })
                  }

                </div>

              </div>
            </div>

            <div className="category-container">
              {this._renderCategories()}
            </div>

          </header>
        </Headroom>

        <div className="container">

          <main>
            {
              this.state.search ?
                <button onClick={() => this.setState({ search: false, query: '' })} className="exit-search">
                  <p>Exit search</p>
                </button>
                :
                true
            }
            {
              this.state.offline ?
                <button onClick={() => this.fetchNews()} className="offline">
                  <p>App offline, click to update when online</p>
                </button>
                :
                true
            }

            {this.state.fetching ?
              <div className="lds-ellipsis" style={{
                margin: 'auto', marginTop: 150
              }}>
                <div></div><div></div><div></div><div></div></div>
              :
              this.state.search ? this.renderCards('search') : this.renderCards('default')

            }


          </main>

          <footer>
            <div className="made-by">
              Made with ♥ by <a href="https://twitter.com/todywa" target="_blank" rel="noopener noreferrer">Tody</a>
            </div>
            <div className="news-api">
              Powered by <span><a href="https://newsapi.org/" target="_blank" rel="noopener noreferrer">News API</a></span>
            </div>
          </footer>

          <section className="sidebar">
            <div className="sidebar-content">
              {this._renderCategories()}
            </div>
            <div className="sidebar-footer">
              <div className="made-by">
                Made with ♥ by <a href="https://twitter.com/todywa" target="_blank" rel="noopener noreferrer">Tody</a>
              </div>
              <div className="news-api">
                Powered by <span><a href="https://newsapi.org/" target="_blank" rel="noopener noreferrer">News API</a></span>
              </div>
            </div>
          </section>


        </div>

      </div >
    );
  }
}

export default App;
