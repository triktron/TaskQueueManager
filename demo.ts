import {TaskManager, Task} from "./src/TaskManager"


function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class CustomTask extends Task {
  sleepTime: number = 0

  async exec() {
    await sleep(this.sleepTime);
  }
}


var manager = new TaskManager();
manager.Verbose = true;

var task1 = new CustomTask();
task1.sleepTime = 200;
task1.Name = "task 1";
manager.AddTask(task1);

var task2 = new CustomTask();
task2.sleepTime = 1500;
task2.Name = "task 2";
manager.AddTask(task2);

var task3 = new CustomTask();
task3.sleepTime = 800;
task3.Name = "task 3";
task3.DependsOn = [task1.ID, task2.ID]
manager.AddTask(task3);

var task4 = new CustomTask();
task4.sleepTime = 300;
task4.Name = "task 4";
task4.DependsOn = [task3.ID]
manager.AddTask(task4);
