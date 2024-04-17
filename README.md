## Team Sagittarius' PD World Experiment ReadMe

> Requirements: This simulation is ran in JavaScript & Html, so it can be ran by running index.html in any browser.

> Instructions: Experiments can be ran by selecting any of the 8 buttons that list a certain experiment on it. After an experiment has finished running, a different experiment can be selected to run.

| Experiment | Description |
| ----------- | ----------- |
| Experiment 1a | Q-Learning; 500 steps of PRANDOM, 8500 steps of PRANDOM (α = 0.3, γ = 0.5) |
| Experiment 1b | Q-Learning; 500 steps of PRANDOM, 8500 steps of PGREEDY (α = 0.3, γ = 0.5) |
| Experiment 1c | Q-Learning; 500 steps of PRANDOM, 8500 steps of PEXPLOIT (α = 0.3, γ = 0.5) |
| Experiment 2 | SARSA; 500 steps of PRANDOM, 8500 steps of PEXPLOIT (α = 0.3, γ = 0.5)
| Experiment 3a | SARSA or Q-Learning; 500 steps of PRANDOM, 8500 steps of PEXPLOIT (α = 0.15, γ = 0.5) |
| Experiment 3b | SARSA or Q-Learning; 500 steps of PRANDOM, 8500 steps of PEXPLOIT (α = 0.45, γ = 0.5) |
| Experiment 4a | SARSA or Q-Learning; 500 steps of PRANDOM, after which PEXPLOIT, terminate after 6 games (α = 0.3, γ = 0.5) |
| Experiment 4b | SARSA or Q-Learning; 500 steps of PRANDOM, after which PEXPLOIT, and after the first 3 games, change the location of the pickups, then run for 3 more games (α = 0.3, γ = 0.5) |

> Settings & Features: Alter the way the expirement is ran or viewed

| Setting/Feature | Description |
| ----------- | ----------- |
| Enable Q Visualization | Toggles live Q-Value display over the grid. This can be toggled mid-run |
| Delay per step | Change the duration between each step/frame in the experiment for convenience and ease of viewing. Cannot be changed mid-run |
| Move | Moves the experiment forward 3 steps at a time per press (1 step for each agent). Useful for analytical observation and for viewing policy differences |
| Policy | Change policies between PRANDOM, PEXPLOIT, and PGREEDY. This can be used with the Move button to view behaviorial differences in each step |
| Stop | Freeze the experiment on the current step/frame. Useful for close observation and setting changes. |

> Policy Description: Policies change the way that agents behave and can be chosen by the user.

| Policy | Instruction |
| ----------- | ----------- |
| PRANDOM | If pickup and dropoff is applicable, choose this operator; otherwise, choose an applicable operator randomly. |
| PEXPLOIT | If pickup and dropoff is applicable, choose this operator; otherwise, apply the applicable operator with the   highest q-value (break ties by rolling a dice for operators with the same q-value) with probability 0.8 and choose a different applicable operator randomly with probability 0.2. |
| PGREEDY | If pickup and dropoff is applicable, choose this operator; otherwise, apply the applicable operator with the highest q-value (break ties by rolling a dice for operators with the same q-value) |