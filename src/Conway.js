import React from 'react';
import './Conway.css';

const block_size = 15;const x_length = 900;const y_length = 500;

class Cell extends React.Component {
    render() {
        const { x, y } = this.props;
        return (
            <div className="Cell" style={{
                left: `${block_size * x + 1}px`,top: `${block_size * y + 1}px`,
                width: `${block_size - 1}px`,height: `${block_size - 1}px`,
            }} />
        );
    }
}

class Conway extends React.Component {

    constructor() {
        //Access and call functions on object's parent
        super();
        this.rows = y_length / block_size;this.cols = x_length / block_size;
        //Keep the board state with this.grid
        this.grid = this.makeEmptyGrid();
    }

    state = {
        //Keep position of cells
        //Intervals and running state
        cells: [],isRunning: false,
        interval: 100,iternum:0
    }

    makeEmptyGrid() {
        let grid = [];
        for (let y = 0; y < this.rows; y++) {
            grid[y] = [];
            for (let x = 0; x < this.cols; x++) {
                grid[y][x] = false;
            }
        }

        return grid;
    }
    
    //Calculate the position of the grid element
    //GetBoundingClientRect() method returns the size of an element and its position relative to the viewport
    getElementOffset() {
        const rect = this.gridRef.getBoundingClientRect();
        const doc = document.documentElement;
    //PageXOffset retrieves the number of pixels by which the contents of the document are scrolled to left
    //clientLeft returns the width of the left border of an element
        return {
            x: (rect.left + window.pageXOffset) - doc.clientLeft,
            y: (rect.top + window.pageYOffset) - doc.clientTop,
        };
    }

    //Create cell list from board state
    makeCells() {
        let cells = [];
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x]) {
                    cells.push({ x, y });
                }
            }
        }

        return cells;
    }

    //Allow user to click the board to place or remove a cell
    //Retrieve the click position, then convert it to relative position, and calculate the cols and rows of the cell being clicked
    handleClick = (event) => {

        if(this.state.isRunning === false){            //Disable click when running
        const elemOffset = this.getElementOffset();
        const offsetX = event.clientX - elemOffset.x;
        const offsetY = event.clientY - elemOffset.y;
        //Convert it to relative position, and calculate the cols and rows of the clicked cell
        const x = Math.floor(offsetX / block_size);
        const y = Math.floor(offsetY / block_size);

        if (x >= 0 && x <= this.cols && y >= 0 && y <= this.rows) {
            this.grid[y][x] = !this.grid[y][x];
        }

        this.setState({ cells: this.makeCells() });
    }}

    runLife = () => {
        this.setState({ isRunning: true });
        this.runIteration();
    }

    stopLife = () => {
        this.setState({ isRunning: false });
        if (this.timeoutHandler) {
            window.clearTimeout(this.timeoutHandler);
            this.timeoutHandler = null;
        }
    }
    //Evolving the grid from one state to the next. Return a new array based on the previous grid’s state instead of mutating the array in place. This is important because if I change the state of the grid while iterating over it we won’t get the results I am after. Since React state is immutable, a double buffer is built in. Read the application state, build a new state array based on it, and set my application state to the new array.
    runIteration() {
    //This.grid holds the data that the user currently sees on the canvas
    //This.newGrid is where the next frame to be shown is being actively constructed
        let newGrid = this.makeEmptyGrid();
        this.setState({ iternum: this.state.iternum + 1 });   //Increase iteration

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                let adjacents = this.calcAdjacent(this.grid, x, y);
                if (this.grid[y][x]) {
                    if (adjacents === 2 || adjacents === 3) {
                        newGrid[y][x] = true;
                    } else {
                        newGrid[y][x] = false;
                    }
                } else {
                    if (!this.grid[y][x] && adjacents === 3) {
                        newGrid[y][x] = true;
                    }
                }
            }
        }
        //When we're done doing work on the hidden buffer, page flip and show the hidden buffer to the user. Then the previously-displayed buffer becomes the new hidden buffer
        this.grid = newGrid;
        //After the new frame is constructed, the next from becomes the current frame, and the current frame becomes the next frame
        this.setState({ cells: this.makeCells() });

        this.timeoutHandler = window.setTimeout(() => {
            this.runIteration();
        }, this.state.interval);
    }

    //Calculate the number of adjacents at given coordinate
    calcAdjacent(grid, x, y) {
        let adjacents = 0;
        const dirs = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];
        for (let i = 0; i < dirs.length; i++) {
            const dir = dirs[i];
            let y1 = y + dir[0];
            let x1 = x + dir[1];

            if (x1 >= 0 && x1 < this.cols && y1 >= 0 && y1 < this.rows && grid[y1][x1]) {
                adjacents++;
            }
        }

        return adjacents;
    }

    faster = (event) => {
    
        this.setState({ interval: this.state.interval -20 });
    }
    slower = (event) => {
   
        this.setState({ interval: this.state.interval + 20 });
    }

    makeClear = () => {
        this.grid = this.makeEmptyGrid();
        this.setState({ cells: this.makeCells() });
    }

    makeRandom = () => {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                this.grid[y][x] = (Math.random() >= 0.5);
            }
        }
        this.setState({ cells: this.makeCells() });
    }

    handleSample1 = () => {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                this.grid[y][x] = false;    
            }
        }
        this.grid[1][2] = true;
        this.grid[1][3] = true;
        this.grid[2][4] = true;
        this.grid[3][4] = true;
        this.grid[4][4] = true;
        this.grid[5][4] = true;
        this.grid[6][4] = true;
        this.grid[7][4] = true;
        
        this.grid[1][32] = true;
        this.grid[1][33] = true;
        this.grid[2][34] = true;
        this.grid[3][34] = true;
        this.grid[4][34] = true;
        this.grid[5][34] = true;
        this.grid[6][34] = true;
        this.grid[7][34] = true;
        this.setState({ cells: this.makeCells() });
    }

    handleSample2 = () => {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                this.grid[y][x] = false;
            }
            this.grid[3][5] = true;
            this.grid[4][4] = true;
            this.grid[5][4] = true;
            this.grid[8][4] = true;
            this.grid[3][4] = true;
            this.grid[13][4] = true;
            this.grid[22][4] = true;
            this.grid[3][4] = true;
            this.grid[4][4] = true;
            this.grid[23][4] = true;
            this.grid[3][5] = true;
            this.grid[4][7] = true;
            this.grid[5][4] = true;
            this.grid[8][2] = true;
            this.grid[3][7] = true;
            this.grid[13][5] = true;
            this.grid[22][5] = true;
            this.grid[3][5] = true;
            this.grid[4][2] = true;
            this.grid[23][1] = true;
            this.grid[1][32] = true;
       
            this.grid[3][34] = true;
            this.grid[4][34] = true;
            this.grid[5][34] = true;
            this.grid[6][34] = true;
            this.grid[7][34] = true;
        }
        this.setState({ cells: this.makeCells() });
    }

    handleSample3 = () => {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                this.grid[y][x] = false;
            }
            this.grid[8][5] = true;
            this.grid[8][4] = true;
            this.grid[8][4] = true;
            this.grid[8][4] = true;
            this.grid[8][4] = true;
            this.grid[3][4] = true;
            this.grid[8][4] = true;
            this.grid[3][4] = true;
            this.grid[4][4] = true;
            this.grid[8][4] = true;
            this.grid[13][5] = true;
            this.grid[14][7] = true;
            this.grid[15][4] = true;
            this.grid[8][6] = true;
            this.grid[3][6] = true;
            this.grid[13][6] = true;
            this.grid[22][6] = true;
            this.grid[3][6] = true;
            this.grid[4][6] = true;
            this.grid[23][1] = true;

            this.grid[1][32] = true;
            this.grid[11][33] = true;
            this.grid[12][34] = true;
            this.grid[13][34] = true;
            this.grid[14][34] = true;
            this.grid[15][34] = true;
            this.grid[16][34] = true;
            this.grid[17][34] = true;

            this.grid[8][9] = true;
            this.grid[8][9] = true;
            this.grid[8][9] = true;
            this.grid[8][9] = true;
            this.grid[8][9] = true;
            this.grid[3][9] = true;
            this.grid[8][3] = true;
            this.grid[3][2] = true;
            this.grid[4][1] = true;
            this.grid[8][12] = true;
            this.grid[13][15] = true;
            this.grid[14][17] = true;
            this.grid[15][14] = true;
            this.grid[8][16] = true;
            this.grid[3][16] = true;
            this.grid[13][16] = true;
            this.grid[22][16] = true;
            this.grid[3][16] = true;
            this.grid[4][16] = true;
            this.grid[23][11] = true;

            this.grid[8][15] = true;
            this.grid[8][14] = true;
            this.grid[8][14] = true;
            this.grid[8][14] = true;
            this.grid[8][14] = true;
            this.grid[3][14] = true;
            this.grid[8][24] = true;
            this.grid[3][24] = true;
            this.grid[4][14] = true;
            this.grid[8][14] = true;
            this.grid[13][25] = true;
            this.grid[14][17] = true;
            this.grid[15][14] = true;
            this.grid[8][16] = true;
            this.grid[3][16] = true;
            this.grid[13][16] = true;
            this.grid[22][16] = true;
            this.grid[3][16] = true;
            this.grid[4][16] = true;
            this.grid[23][21] = true;
        }
        this.setState({ cells: this.makeCells() });
    }

    //Render the cells
    render() {
        const { cells, isRunning } = this.state;
        return (
            <div>
                <div className="userInterface">
                    {isRunning ?
                        <button className="animated-button1" onClick={this.stopLife}><span></span><span></span><span></span><span></span>Freeze</button> :
                        <button className="animated-button1" onClick={this.runLife}><span></span><span></span><span></span><span></span>Evolve</button>
                    }
                    <button className="animated-button1" onClick={this.faster}><span></span><span></span><span></span><span></span>Faster</button>
                    <button className="animated-button1" onClick={this.slower}><span></span><span></span><span></span><span></span>Slower</button>
                    <button className="animated-button1" onClick={this.makeRandom}><span></span><span></span><span></span><span></span>Chance</button>
                    <button className="animated-button1" onClick={this.handleSample1}><span></span><span></span><span></span><span></span>Simulation 1</button>
                    <button className="animated-button1" onClick={this.handleSample2}><span></span><span></span><span></span><span></span>Simulation 2</button>
                    <button className="animated-button1" onClick={this.handleSample3}><span></span><span></span><span></span><span></span>Simulation 3</button>
                    <button className="animated-button1" onClick={this.makeClear}><span></span><span></span><span></span><span></span>Erase</button>
                    <br></br>Iteration: {this.state.iternum}
                </div>
                <div className="Grid"
                    style={{ width: x_length, height: y_length, backgroundSize: `${block_size}px ${block_size}px`}}
                    onClick={this.handleClick}
                    //The coordinate is relative to the visible area of the browser, convert it to a coordinate that is relative to the board
                    //Save the reference of the board element to retrieve the board location 
                    ref={(n) => { this.gridRef = n; }}>

                    {cells.map(cell => (
                        <Cell x={cell.x} y={cell.y} key={`${cell.x},${cell.y}`}/>
                    ))}
                </div>
                <div className="descr">
                John Conway was an English mathematician who has produced many results in the theory of finite groups, knot theory, number theory, combinatorial game theory and coding theory. In computability theory, a system of data-manipulation rules (such as a computer's instruction set, a programming language, or a cellular automaton) is said to be Turing-complete or computationally universal if it can be used to simulate any Turing machine. This means that this system is able to recognize or decide other data-manipulation rule sets. If the cell is alive and has 2 or 3 neighbors, then it remains alive. Else it dies. If the cell is dead and has exactly 3 neighbors, then it comes to life. Else if remains dead.
                </div>
            </div>
        );
    }
}


export default Conway;