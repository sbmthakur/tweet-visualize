import React, { Component } from 'react';
/*
 * Socket.io client: Used for incoming tweets over
 * the websocket connection
 */
import io from 'socket.io-client';
import logo from './logo.svg';
import './App.css';
/*
 * react-tweet: For rendering tweets
 */
import Tweet from 'react-tweet';
/*
 * react-d3-cloud: For rendering tag-cloud
 */
import WordCloud from 'react-d3-cloud';
/*
 * react-interval: For setting interval
 */
import ReactInterval from 'react-interval';
const linkProps = { target: '_blank' };


/*
 * App: Parent component
 */
class App extends Component {

 constructor(props) {
    super(props);
    console.log('wsss', process.env.REACT_APP_WEBSOCKET_PORT) 
    let socket = io.connect('http://morning-ridge-89471.herokuapp.com:8080')// + process.env.REACT_APP_WEBSOCKET_PORT);
    this.state = {
        socket: socket,
        termFrequencies: {},
        tweets: [],
        cloudData: [],
        count: 0,
        renderChild: false
    }
  }

  fetchRecents() {
    const MIN_WORD_LENGTH = 3;
    this.state.socket.on('tweet', (tweet) => {
      let st = this.state.tweets;
      st.unshift(tweet)
      let words = tweet.text
        .split(' ')
        .filter(word => {
          return word.length > MIN_WORD_LENGTH;
        });

      let newTermFrequencies = Object.assign({}, this.state.termFrequencies);
      words.forEach(word => {
        newTermFrequencies[word] = newTermFrequencies[word] || 0;
        newTermFrequencies[word]++;
      });

      if(st.length > 15) {
         st = st.slice(0,14); 
      }
      this.setState({
        tweets: st,
        termFrequencies: newTermFrequencies,
        renderChild: false
      })
    });
  }
 
  componentDidMount() {
    this.fetchRecents()
  }

  render() {

    return (
            <div className="App">
  <div className="tweet-section" style={{'width': '500px', 'margin': '0 0 0 0'}}>
{console.log('Lee:', this.state.tweets.length)}
    <div className="tweet-stream" style={{'width': '100%'}}>
      { this.state.tweets.map((t, i) => (
        <Tweet data={t} key={i} linkProps={linkProps} />
      ))}
    </div>
  </div>,
  <div className="tag-cloud" style={{'width': '30%'}}>

  <Cloud data={this.state.termFrequencies} renderChild={this.state.renderChild} />
  <ReactInterval timeout={5000} enabled={true}
    callback={() => {  this.setState({ renderChild: true })  }} />
  </div>
  </div>
    );
  }
}

class Cloud extends Component {
   
 constructor(props) {
   super(props);

   this.state = {
     data : [
       { text: 'hey', value: 1000 }
     ]
   }
  }

  shouldComponentUpdate(nextProps, nextState) {
     
    if(!nextProps.renderChild || Object.keys(nextProps.data).length === 0) {
      return false;
    }
    else {
      return true;  
    }
  } 

  componentWillReceiveProps(nextProps) {
     
    let data = [];
    for(let word in nextProps.data) {
      data.push({text: word, value: nextProps.data[word]}) 
    }
    this.setState({ data: data}, () => { console.log('Inside component')})
  } 

  getRandomAngle(){
     
    return Math.ceil(Math.random() * 360);
  }

  fontSizeMapper = word => Math.log2(word.value) * 30;
  rotate = word => this.getRandomAngle(); 
 
  cloud = () => {

 return <WordCloud 
    data={this.state.data}
    fontSizeMapper={this.fontSizeMapper}
    height={2000}
    padding={2}
    rotate={this.rotate}
  />

  }
  render() { 
    return (
      this.cloud()
    )
  }
}

export default App;
