const gridContainer = document.getElementById('grid-container');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const restartBtn = document.getElementById('restart');

const SIZE = 4;
const TILE_SIZE = 115;
let grid = [];
let tiles = [];
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
highScoreEl.textContent = highScore;
let gameWon = false;

// Tile class
class Tile {
    constructor(value, row, col) {
        this.value = value;
        this.row = row;
        this.col = col;
        this.merged = false;
        this.el = document.createElement('div');
        this.el.classList.add('tile', `tile-${value}`, 'new');
        this.el.textContent = value;
        this.updatePosition();
        gridContainer.appendChild(this.el);
        tiles.push(this);
        setTimeout(() => this.el.classList.remove('new'), 150);
    }
    updatePosition() {
        this.el.style.top = `${this.row * TILE_SIZE}px`;
        this.el.style.left = `${this.col * TILE_SIZE}px`;
    }
    updateValue(newValue) {
        this.value = newValue;
        this.el.textContent = newValue;
        this.el.className = '';
        this.el.classList.add('tile', `tile-${newValue}`);
        this.el.classList.add('new');
        setTimeout(() => this.el.classList.remove('new'), 150);
        if(newValue===2048 && !gameWon){ 
            setTimeout(()=>alert('🎉 You Win!'),100);
            gameWon = true;
        }
    }
    remove() { 
        gridContainer.removeChild(this.el); 
        tiles.splice(tiles.indexOf(this), 1);
    }
}

// Initialize
function init() {
    grid = Array(SIZE).fill().map(() => Array(SIZE).fill(null));
    tiles.forEach(t => t.remove());
    tiles = [];
    score = 0;
    scoreEl.textContent = score;
    gameWon = false;
    addRandomTile();
    addRandomTile();
}

// Add a random tile
function addRandomTile() {
    let empty = [];
    for(let i=0;i<SIZE;i++){
        for(let j=0;j<SIZE;j++){
            if(!grid[i][j]) empty.push({i,j});
        }
    }
    if(empty.length===0) return;
    let {i,j} = empty[Math.floor(Math.random()*empty.length)];
    let value = Math.random() < 0.9 ? 2 : 4;
    let tile = new Tile(value,i,j);
    grid[i][j] = tile;
}

// Move logic
function move(direction){
    tiles.forEach(t => t.merged=false);

    function slideArray(arr){
        let filtered = arr.filter(t=>t);
        for(let i=0;i<filtered.length-1;i++){
            if(filtered[i].value === filtered[i+1].value && !filtered[i].merged && !filtered[i+1].merged){
                filtered[i].updateValue(filtered[i].value*2);
                filtered[i].merged=true;
                score+=filtered[i].value;
                scoreEl.textContent=score;
                filtered[i+1].remove();
                filtered.splice(i+1,1);
            }
        }
        while(filtered.length<SIZE) filtered.push(null);
        return filtered;
    }

    let oldGrid = JSON.stringify(grid.map(r=>r.map(t=>t?t.value:0)));

    if(direction==='left'){
        for(let i=0;i<SIZE;i++){
            let row = grid[i];
            let newRow = slideArray(row);
            grid[i] = newRow;
            newRow.forEach((t,j)=>{ if(t){t.col=j;t.updatePosition();} });
        }
    } else if(direction==='right'){
        for(let i=0;i<SIZE;i++){
            let row=[...grid[i]].reverse();
            let newRow=slideArray(row).reverse();
            grid[i]=newRow;
            newRow.forEach((t,j)=>{ if(t){t.col=j;t.updatePosition();} });
        }
    } else if(direction==='up'){
        for(let j=0;j<SIZE;j++){
            let col=[]; for(let i=0;i<SIZE;i++) col.push(grid[i][j]);
            let newCol=slideArray(col);
            for(let i=0;i<SIZE;i++){
                grid[i][j]=newCol[i];
                if(newCol[i]){newCol[i].row=i;newCol[i].updatePosition();}
            }
        }
    } else if(direction==='down'){
        for(let j=0;j<SIZE;j++){
            let col=[]; for(let i=0;i<SIZE;i++) col.push(grid[i][j]);
            let newCol=slideArray(col.reverse()).reverse();
            for(let i=0;i<SIZE;i++){
                grid[i][j]=newCol[i];
                if(newCol[i]){newCol[i].row=i;newCol[i].updatePosition();}
            }
        }
    }

    if(oldGrid !== JSON.stringify(grid.map(r=>r.map(t=>t?t.value:0)))) addRandomTile();
    if(score>highScore){highScore=score; localStorage.setItem('highScore',highScore); highScoreEl.textContent=highScore;}
    if(checkGameOver()) setTimeout(()=>alert('Game Over!'),100);
}

// Game over check
function checkGameOver(){
    for(let i=0;i<SIZE;i++){
        for(let j=0;j<SIZE;j++){
            if(!grid[i][j]) return false;
            if(j<SIZE-1 && grid[i][j].value===grid[i][j+1]?.value) return false;
            if(i<SIZE-1 && grid[i][j].value===grid[i+1][j]?.value) return false;
        }
    }
    return true;
}

// Controls
document.addEventListener('keydown',e=>{
    switch(e.key){
        case 'ArrowLeft': move('left'); break;
        case 'ArrowRight': move('right'); break;
        case 'ArrowUp': move('up'); break;
        case 'ArrowDown': move('down'); break;
    }
});

restartBtn.addEventListener('click',init);

// **Mobile Swipe Support**
let touchStartX = 0;
let touchStartY = 0;
const swipeThreshold = 50;

gridContainer.addEventListener('touchstart', e => {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
});

gridContainer.addEventListener('touchend', e => {
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;

    if(Math.abs(dx) > Math.abs(dy)){
        if(dx > swipeThreshold) move('right');
        else if(dx < -swipeThreshold) move('left');
    } else {
        if(dy > swipeThreshold) move('down');
        else if(dy < -swipeThreshold) move('up');
    }
});

init();
