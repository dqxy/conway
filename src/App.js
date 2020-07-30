import React, { Component } from 'react';
import './App.css';
import Conway from './Conway';

class App extends Component {

    render() {

        return (
            <div className="App">
                <h1>Conway's Game of Life</h1>
                <Conway />
            </div>
        );
    }
}

export default App;
