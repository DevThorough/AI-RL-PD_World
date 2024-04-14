

var canvas = document.getElementById('PDWorldCanvas');
var ctx = canvas.getContext('2d');

function drawSquare(x, y, size) {
    ctx.beginPath();
    ctx.rect(x, y, size, size);
    ctx.stroke();
}

//Refreshes grid after each step
function clearGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawDropoff(dropoff, squareSize) {
  ctx.font = "bold 30px Arial";
  ctx.fillStyle = "green";
  ctx.fillText("D:"+dropoff.blocks, dropoff.j * squareSize + squareSize / 3, dropoff.i * squareSize + squareSize / 1.5);
}

function drawPickup(dropoff, squareSize) {
  ctx.font = "bold 30px Arial";
  ctx.fillStyle = "red";
  ctx.fillText("P:"+dropoff.blocks, dropoff.j * squareSize + squareSize / 3, dropoff.i * squareSize + squareSize / 1.5);
}

function drawAgent(agent, squareSize) {
  switch(agent.id) {
    case '1':
      ctx.fillStyle = "red";
      break;
    case '2':
      ctx.fillStyle = "blue";
      break;
    case '3':
      ctx.fillStyle = "black";
      break;
  }
  
  ctx.fillText("!!" + (agent.x ? '*' : ''), agent.j * squareSize + squareSize / 3, agent.i * squareSize + squareSize / 1.5);
}

class Agent {
    constructor(i, j, id) {
        // Space0
        this.i = i; // vertical
        this.j = j; // horizontal
        this.x = false; // Carrying a block?
        this.id = id;

        // Space1
        // this.theta = 0; // Manhattan distance to the closest other agent

        // // Space2
        // this.a = true; // Is an applicable pickup and dropoff
        // this.b = true; // ...
        // this.c = true;
        // this.d = true;
        // this.e = true;
        // this.f = true;
    }

    // TODO: update space1 and space2
    north(pdw) {
        this.i -= 1;
    }
    south(pdw) {
      this.i += 1;
    }
    west(pdw) {
      this.j -= 1;
    }
    east(pdw) {
      this.j += 1;
    }
    pickup(pdw) {
        pdw.modifyCapacity(this.i, this.j);
      this.x = true;
    }
    dropoff(pdw) {
        pdw.modifyCapacity(this.i, this.j);
      this.x = false;
    }
}
class Pickup {
    constructor(i, j) {
        this.i = i;
        this.j = j;
        this.blocks = 5;
    }
    takeBlock(pdw) {
        this.blocks -= 1;
        if (this.blocks == 0) {
          pdw.updateAgents(this.i, this.j);
        }
    }
}
class Dropoff {
    constructor(i, j) {
        this.i = i;
        this.j = j;
        this.blocks = 0;
    }
    putBlock(pdw) {
        this.blocks += 1;
        if (this.blocks == 5) {
          pdw.updateAgents(this.i, this.j);
        }
    }
}

/*
i,j,i',j',i'',j'' = positions of the agent(s), red, blue, and black respectively
x,x',x'' = true if the agent carries a block, false otherwise
a,b,c,d,e,f = locations of the blocks. a,b,c are dropoffs, while d,e,f are pickups
    (1,1), (3,1), (4,5), (1,5), (2,4), (5,2)
*/
class PDWorld {
    constructor() {
        this.red = new Agent(2,2,'1');// 1 on map
        this.blue = new Agent(4,2,'2');// 2 on map
        this.black = new Agent(0,2,'3');// 3 on map
        this.a = new Dropoff(0,0);
        this.b = new Dropoff(2,0);
        this.c = new Dropoff(3,4);
        this.d = new Pickup(0,4);
        this.e = new Pickup(1,3);
        this.f = new Pickup(4,1);
    }
    str() {
        return JSON.stringify(this);
    }
    str(Agent) {
      let s = {
        // agent: Agent.id,
        i: Agent.i,
        j: Agent.j,
        x: Agent.x,
        a: this.a.blocks < 5,
        b: this.b.blocks < 5,
        c: this.c.blocks < 5,
        d: this.d.blocks > 0,
        e: this.e.blocks > 0,
        f: this.f.blocks > 0
      };
      return JSON.stringify(s);
    }
    //apply takes in string indicating action
    executePolicy(Qs, Agent, policy) {
      let action = 'x';
        switch(policy) {
          case 'prandom':
            action = this.prandom(Qs, Agent);
            break;
          case 'pexploit':
            action = this.pexploit(Qs, Agent);
            break;
          case 'pgreedy':
            action = this.pgreedy(Qs, Agent);
            break;
          default:
            break;
        }
        return action;
    }
    apply(Agent, action) {
      switch(action) {
        case 'n':
            Agent.north(this);
            break;
        case 's':
            Agent.south(this);
            break;
        case 'w':
            Agent.west(this);
            break;
        case 'e':
            Agent.east(this);
            break;
        case 'p':
            Agent.pickup(this);
            break;
        case 'd':
            Agent.dropoff(this);
            break;
        default:
            // alert('unknown action \''+action+'\'');
            break;
      }
      return action;
    }
    pdLocation(y,x){
      if(this.a.i == y && this.a.j == x) {
        return 'a';
      }
      else if(this.b.i == y && this.b.j == x) {
          return 'b';
        }
      else if(this.c.i == y && this.c.j == x) {
        return 'c';
      }
      else if(this.d.i == y && this.d.j == x) {
        return 'd';
      }
      else if(this.e.i == y && this.e.j == x) {
        return 'e';
      }
      else if(this.f.i == y && this.f.j == x) {
        return 'f';
      }
    }
    aLocation(y,x) {
      if(this.red.i == y && this.red.j == x) {
        return '1';
      }
      else if(this.blue.i == y && this.blue.j == x) {
        return '2';
      }
      else if(this.black.i == y && this.black.j == x) {
        return '3';
      }
    }
    modifyCapacity(y,x){
        let char = this.pdLocation(y,x);
        switch (char[0]){
            case 'a': this.a.putBlock(this); break;
            case 'b': this.b.putBlock(this); break;
            case 'c': this.c.putBlock(this); break;
            case 'd': this.d.takeBlock(this); break;
            case 'e': this.e.takeBlock(this); break;
            case 'f': this.f.takeBlock(this); break;
        }
    }
    manhattan() {
      let redtoblack = [Math.abs(this.red.i - this.black.i), Math.abs(this.red.j - this.black.j)];
      let blacktoblue = [Math.abs(this.black.i - this.blue.i), Math.abs(this.black.j - this.blue.j)];
      return redtoblack[0]+redtoblack[1]+blacktoblue[0]+blacktoblue[1];
    }
    updateAgents(y,x){
        let char = this.pdLocation(y,x);
        this.red[char] = false;
        this.blue[char] = false;
        this.black[char] = false;
    }
    notEmpty(char){
        return this[char].blocks > 0;
    }
    notFull(char){
        return this[char].blocks < 5;
    }
    canPickup(Agent){
        if (Agent.x == true) {return false;} // False if holding package
        let loc = this.pdLocation(Agent.i,Agent.j);
        if (loc == 'd'|| loc == 'e'|| loc == 'f') {
            if (this.notEmpty(loc)) {return true;}
        }
        return false;
    }
    canDropoff(Agent){
        if (Agent.x == false) {return false;} // False if not holding package
        let loc = this.pdLocation(Agent.i,Agent.j);
        if (loc == 'a'|| loc == 'b'|| loc == 'c') {
            if (this.notFull(loc)) {return true;}
        }
        return false;
    }
    outOfBounds(y,x){
        return (x < 0 || x > 4 || y < 0 || y > 4);
    }
    checkForAgent(y,x){
        let agentIDs = [1,2,3]; // List of agents IDs
        let char = this.aLocation(y,x);// Check last character in map[x,y]
        for (let agent of agentIDs) {
            if(char == agent) {return true;}
        }
        return false;
    }
    canDo(Agent, action){
        let pos = [Agent.i, Agent.j];// Copy current agent position
        switch (action) {// Based on action change position
            case 'p': return this.canPickup(Agent); break;
            case 'd': return this.canDropoff(Agent); break;
            case 'n': pos[0] -= 1; break;
            case 's': pos[0] += 1; break;
            case 'w': pos[1] -= 1; break;
            case 'e': pos[1] += 1; break;
            default: return false;// If action is not valid
        }
        if (this.outOfBounds(pos[0],pos[1]))
            return false;
        if (this.checkForAgent(pos[0],pos[1]) == true) 
            return false;
        return true;
    }
    aplop(Agent, qTable){// General function to see all actions available if needed
        // Operations array represents ['n', 's', 'w', 'e', 'p', 'd'] respectively;
        let Qs = {};//new Array(6).fill(false);// Boolean Array
        let s = this.str(Agent);
        const actions = ['n', 's', 'w', 'e', 'p', 'd'];
        for (let i = 0; i < 6; i++) {
            if(this.canDo(Agent, actions[i])) {
              if(!(s in qTable.qTable)) {
                qTable.qTable[s] = {};
              }

                Qs[actions[i]] = qTable.qTable[s][actions[i]] ?? 0;
            }
        }
        return Qs;
    }
    prandom(Qs, Agent) {
      
        if(Qs.length == 0) {
          return;
        }
        else if('p' in Qs && this.canDo(Agent, 'p')) {
            return 'p';
        }
        else if('d' in Qs && this.canDo(Agent, 'd')) {
            return 'd';
        }
        else {
            let applicable = [];
            for (let a in Qs){
                if(this.canDo(Agent, a)) {
                    applicable.push(a);
                }
            }
            const random = Math.floor(Math.random() * applicable.length);
            return applicable[random];
        }
    }
    pexploit(Qs, Agent) {
     
        if(Math.random() <= .8) { // 80% chance
          return this.pgreedy(Qs, Agent); 
        } else {
          return this.prandom(Qs, Agent);
        }
    }
    pgreedy(Qs, Agent) {
      
        if(Qs.length == 0) {
          return;
        }
        else if('p' in Qs && this.canDo(Agent, 'p')) {
            return 'p';
        }
        else if('d' in Qs && this.canDo(Agent, 'd')) {
            return 'd';
        }
        else {
          let maxQ = [];
          let maxA = [];
          for (var a in Qs){
              if(!(this.canDo(Agent, a))) {
                  continue;
              }

              if(Qs[a] > maxQ[0] || maxQ.length == 0) {
                  maxQ = [Qs[a]];
                  maxA = [a];
              }
              else if(Qs[a] <= maxQ[0]+0.001 && Qs[a] >= maxQ[0]-0.001) {
                  maxQ.push(Qs[a]);
                  maxA.push(a);
              }
          }

          const random = Math.floor(Math.random() * maxA.length);
          return maxA[random];
        }
    }
    isDone() {
      return this.a.blocks==5 && this.b.blocks==5 && this.c.blocks==5 && this.d.blocks==0 && this.e.blocks==0 && this.f.blocks==0;
    }
}

/*Q Table class:
PDRows: grid row size, PDColumns: grid column size, PDActions: number of actions, alpha: learning rate, gamma: discount factor
*/
class QTable{
  constructor(PDRows, PDColumns, actions, alpha, gamma){
    this.PDRows = PDRows;
    this.PDColumns = PDColumns;
    this.actions = actions;
    this.alpha = alpha;
    this.gamma = gamma;
    this.qTable = {};
  }

  prepareForNextIteration(s, a, sprime) {
    if(!(sprime in this.qTable)) {
      this.qTable[sprime] = {};
    }
    if(!(s in this.qTable)) {
      this.qTable[s] = {};
    }
    if(!(a in this.qTable[s])) {
      this.qTable[s][a] = 0.0;
    }
  }

  qLearning(s, a, reward, sprime, Qsprime) {
    this.prepareForNextIteration(s, a, sprime);

    let max_aprime_value = -Infinity;

    for (let aprime in Qsprime) {
      if (Qsprime[aprime] > max_aprime_value) {
          max_aprime_value = Qsprime[aprime];
      }
    }

    this.qTable[s][a] = (1 - this.alpha) * this.qTable[s][a] + this.alpha * (reward + this.gamma * max_aprime_value);
  }

  sarsa(s, a, reward, sprime, aprime) {
    this.prepareForNextIteration(s, a, sprime);

    if(!(aprime in this.qTable[sprime])) {
      this.qTable[sprime][aprime] = 0.0;
    }

    this.qTable[s][a] = (1 - this.alpha) * this.qTable[s][a] + this.alpha * (reward + this.gamma * this.qTable[sprime][aprime]);
  }

  generateQTableMatrixHTML() {
      const actions = ['n', 's', 'w', 'e']; 
      let html = '<table border="1"><tr><th>State</th>';

      actions.forEach(action => {
          html += `<th>${action.toUpperCase()}</th>`;
      });
      html += '</tr>';

      // Convert the Q-table entries to an array and take the first 15
      const first15Entries = Object.entries(this.qTable).slice(0, 15);
      for (const [stateJson, actionValues] of first15Entries) {
        const state = JSON.parse(stateJson);
        let row = `<tr><td>(${state.i},${state.j})</td>`;

        actions.forEach(action => {
        const qValue = actionValues[action] !== undefined ? actionValues[action].toFixed(2) : 'NA';
        row += `<td>${qValue}</td>`;
      });

      row += '</tr>';
      html += row;
    }

    html += '</table>';
    document.body.innerHTML += html; // Consider appending to a specific element instead
  }


}

let expInterval = null;
let exp = null;

class Experiment {
  constructor(alpha, gamma, algorithm='qlearning', delay=10) {
    this.steps = 0;
    this.qTable = new QTable(5, 5, actions, alpha, gamma);
    this.pdw = new PDWorld();
    this.stepsThisGame = 0;
    this.gamesWon = 0;
    this.algorithm = algorithm;
    this.delay = document.getElementById('inputDelay').value;
    this.rewards = [];
    this.currentGameReward = 0;
    this.drawGrid();
    this.manhattans = [];
  }

  step(agent, policy) {
    this.steps++;
    this.stepsThisGame++;

    this.manhattans.push(this.pdw.manhattan());
    
    let Qs = this.pdw.aplop(agent, this.qTable);

    let beforeState = this.pdw.str(agent);
    let action = this.pdw.executePolicy(Qs, agent, policy);
    this.pdw.apply(agent, action);

    // update current game reward after each step
    let currentReward = get_reward(action);
    this.currentGameReward += currentReward;
    
    let Qsprime = this.pdw.aplop(agent, this.qTable);
    if(this.algorithm == 'qlearning') {
      this.qTable.qLearning(beforeState, action, get_reward(action), this.pdw.str(agent), Qsprime);
    } else if(this.algorithm == 'sarsa') {
      let aprime = this.pdw.executePolicy(Qsprime, agent, policy);
      this.qTable.sarsa(beforeState, action, get_reward(action), this.pdw.str(agent), aprime);
    }

    this.drawGrid();

    if(this.pdw.isDone()) {
      this.gamesWon++;
      this.rewards.push(this.currentGameReward); // push current game reward into reward array
      console.log(`Game ${this.gamesWon} took ${this.stepsThisGame} steps. The reward for the current game is ${this.currentGameReward}.`);
      // console.log(this.manhattans);
      this.manhattans = [];
      this.currentGameReward = 0;
      this.stepsThisGame = 0;
      this.resetPDW();
    }
  }

  drawGrid() {
      let gridSize = 5;
      let squareSize = canvas.width / gridSize;

      clearGrid();

      for (let i = 0; i < gridSize; i++) {
          for (let j = 0; j < gridSize; j++) {
              let x = i * squareSize;
              let y = j * squareSize;
              drawSquare(x, y, squareSize);
              drawSquare(x, y, squareSize, "transparent");

              ctx.strokeRect(x, y, squareSize, squareSize);
          }
      }

      ctx.font = "bold 30px Arial";
      ctx.fillStyle = "green";

      drawDropoff(this.pdw.a, squareSize);
      drawDropoff(this.pdw.b, squareSize);
      drawDropoff(this.pdw.c, squareSize);
      drawPickup(this.pdw.d, squareSize);
      drawPickup(this.pdw.e, squareSize);
      drawPickup(this.pdw.f, squareSize);
      drawAgent(this.pdw.red, squareSize);
      drawAgent(this.pdw.blue, squareSize);
      drawAgent(this.pdw.black, squareSize);

      ctx.font = "bold 16px Arial";
      ctx.fillStyle = "black";
      ctx.fillText(`Game: ${this.gamesWon}; Steps: ${this.steps} (${this.stepsThisGame}); Reward: ${this.currentGameReward}`, 0, 628);

      if(document.getElementById('showQvalues').checked) {
        this.drawQValues();
      }
  }

  drawQValues() {
    let squareSize = canvas.width / 5;

    for(let i = 0; i < 5; i++) {
      for(let j = 0; j < 5; j++) {
        let y = i * squareSize;
        let x = j * squareSize;

        let redCopy = JSON.parse(JSON.stringify(this.pdw.red));
        redCopy.i = i;
        redCopy.j = j;
        let blueCopy = JSON.parse(JSON.stringify(this.pdw.blue));
        blueCopy.i = i;
        blueCopy.j = j;
        let blackCopy = JSON.parse(JSON.stringify(this.pdw.black));
        blackCopy.i = i;
        blackCopy.j = j;
        
        let redStr = this.pdw.str(redCopy);
        let blueStr = this.pdw.str(blueCopy);
        let blackStr = this.pdw.str(blackCopy);

        let redQ = this.qTable.qTable[redStr] ?? {};
        let blueQ = this.qTable.qTable[blueStr] ?? {};
        let blackQ = this.qTable.qTable[blackStr] ?? {};

        let n = Math.max(redQ['n'],blueQ['n'],blackQ['n']);
        let s = Math.max(redQ['s'],blueQ['s'],blackQ['s']);
        let e = Math.max(redQ['e'],blueQ['e'],blackQ['e']);
        let w = Math.max(redQ['w'],blueQ['w'],blackQ['w']);
        
        ctx.font = "bold 20px Arial";
        ctx.fillStyle = 'black'; // text color

        // x === x tests if the value is not NaN
        if(n === n) {
          ctx.fillStyle = n > 0 ? 'green' : 'red';
          ctx.fillText(n.toFixed(2), x + squareSize / 4, y + squareSize / 8);
        }
        if(s === s) {
          ctx.fillStyle = s > 0 ? 'green' : 'red';
          ctx.fillText(s.toFixed(2), x + squareSize / 4, y + squareSize);
        }
        if(e === e) {
          ctx.fillStyle = e > 0 ? 'green' : 'red';
          ctx.fillText(e.toFixed(2), x + squareSize / 2 + 20, y + squareSize / 2 + 10);
        }
        if(w === w) {
          ctx.fillStyle = w > 0 ? 'green' : 'red';
          ctx.fillText(w.toFixed(2), x, y + squareSize / 2 + 10);
        }
      }
    }
  
    // Reset global alpha
    // ctx.globalAlpha = 1.0;
  }

  resetQ() {
    this.qTable.qTable = {};
  }

  resetPDW() {
    this.pdw = new PDWorld();
  }

  move(policy) {
    this.step(this.pdw.red, policy);
    this.step(this.pdw.blue, policy);
    this.step(this.pdw.black, policy);
  }

  printAverageReward(){
    let sum = this.rewards.reduce((acc, r) => acc + r, 0);
    let average = sum / this.rewards.length;
    console.log(`Average Reward: ${average.toFixed(2)}`);
    console.log(this.rewards);
    this.rewards = [];
  }

  finished() {
    this.printAverageReward();
    clearInterval(expInterval); 
    // this.qTable.generateQTableMatrixHTML(); 
  }

  exp1(policy) {
    this.resetQ();

    clearInterval(expInterval);
    expInterval = setInterval(() => {
      if(this.steps < 500) {
        this.move('prandom');
      } else if(this.steps < 9000) {
        this.move(policy);
      } else {
        this.finished();
        return;
      }
    }, this.delay);
  }

  exp4(changePickup=true) {
    this.resetQ();
    let changedPickups = 0;

    clearInterval(expInterval);
    expInterval = setInterval(() => {
      this.steps++;
      this.stepsThisGame++;
      if(this.steps < 500) {
        this.move('prandom');
      } else if(this.gamesWon < 3) {
        this.move('pexploit');
      } else if(this.gamesWon < 6 && changedPickups != this.gamesWon) {
        // Reset the pickups every time the game is won, starting with game 4

        if(changePickup) {
          this.pdw.d = new Pickup(3,1);
          this.pdw.e = new Pickup(2,2);
          this.pdw.f = new Pickup(1,3);
        }

        this.move('pexploit');
        changedPickups = this.gamesWon;
      } else if(this.gamesWon <= 6 && changedPickups == this.gamesWon) {
        this.move('pexploit');
      } else {
        this.finished();
        return;
      }
    }, this.delay);
  }

  exp1a() {
    this.exp1('prandom');
  }
  exp1b() {
    this.exp1('pgreedy');
  }
  exp1c() {
    this.exp1('pexploit');
  }
}

// Return reward of current action
function get_reward(a){

  let reward = 0;
  if(a == "p" || a == "d"){
    return reward = reward + 13;
  }else {
    return reward = reward - 1;
  }
}

const actions = ['n', 's', 'w', 'e', 'p', 'd'];

function moveButton() {
  exp.move(document.getElementById('selectPolicy').value);
}

function main() {

}

function exp1a() {
  exp = new Experiment(.3, .5);
  exp.exp1a();
}
function exp1b() {
  exp = new Experiment(.3, .5);
  exp.exp1b();
}
function exp1c() {
  exp = new Experiment(.3, .5);
  exp.exp1c();
}

function exp2() {
  exp = new Experiment(.3, .5, 'sarsa');
  exp.exp1c(); // Not a mistake. exp2 is the same as exp1c except we use sarsa instead of qlearning
}

// This experiment is split up into two functions due to the use of asynchronous tasks to run the steps
function exp3a() {
  // We have a choice to run exp2 or exp1c, that is if 'sarsa' is passed instead of 'qlearning' as the algorithm

  exp = new Experiment(.15, .5);
  exp.exp1c();
}
function exp3b() {
  // We have a choice to run exp2 or exp1c, that is for exp2, 'sarsa' is passed instead of 'qlearning' as the algorithm
  
  exp = new Experiment(.45, .5);
  exp.exp1c();
}

function exp4a() {
  // We have a choice between sarsa and qlearning

  exp = new Experiment(.3, .5);
  exp.exp4(false);
}

function exp4b() {
  // We have a choice between sarsa and qlearning

  exp = new Experiment(.3, .5);
  exp.exp4(true);
}

function stopexp() {
  clearInterval(expInterval);
}

window.onload = function() {
    main();
};
