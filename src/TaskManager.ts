import { Task } from './Task';
export {Task};

export interface TimeConstrain {
  Name: string
  Time: number
  LastCall: number
  Running: number
  MaxRunning: number
}


export class TaskManager {
  TaskQueue: Task[] = [];
  NextId: number = 0
  Running: number = 0
  MaxRunning: number = 4

  TimeConstrains: TimeConstrain[] = [];

  AddTask(task: Task) {
    task.ID = ++this.NextId;
    this.TaskQueue.push(task);

    this.StartNextTask();

    return task.ID;
  }

  TaskReturned(CompletedTask: Task, succeed: boolean, e: Error) {
    if (succeed) console.log(CompletedTask.Name, "ran succsesfuly");
    else         console.error(CompletedTask.Name, "failed!!\n", e);

    const index = this.TaskQueue.findIndex(t => t.ID == CompletedTask.ID);
    if (index > -1) {
      this.TaskQueue.splice(index, 1);
    }
    this.Running--;
    var group = this.TimeConstrains.find(g => g.Name == CompletedTask.Group);
    if (group) {
      group.Running--;
      group.LastCall = Date.now();
    }

    this.StartNextTask();
  }

  StartNextTask() {
    if (this.Running >= this.MaxRunning) return

    var group;
    var index = this.TaskQueue.findIndex(t => {
      group = this.TimeConstrains.find(g => g.Name == t.Group);

      return !t.Running &&
             (t.DependsOn.length == 0 ||
              t.DependsOn.every(dependency => this.TaskQueue.findIndex(t2 => t2.ID == dependency) == -1)) &&
              group &&
              group.Running < group.MaxRunning &&
              group.LastCall < Date.now() - group.Time
    });

    if (index > -1) {
      this.Running++;
      group.Running++;
      console.log("starting task:", this.TaskQueue[index].Name);
      this.TaskQueue[index].Running = true;
      this.TaskQueue[index].exec().then(this.TaskReturned.bind(this, this.TaskQueue[index], true)).catch(this.TaskReturned.bind(this, this.TaskQueue[index], false))
    } else if (this.TaskQueue.length > 0 && this.TimeConstrains.length > 1) {
      const firstgroup = this.TimeConstrains.reduce((acc, loc) => (acc.Time - Date.now() + acc.LastCall) < (loc.Time - Date.now() + loc.LastCall) ? acc : loc)
      setTimeout(this.StartNextTask.bind(this), (firstgroup.Time - Date.now() + firstgroup.LastCall));
    }  else if (this.TaskQueue.length > 0 && this.TimeConstrains.length > 0) {
      setTimeout(this.StartNextTask.bind(this), (this.TimeConstrains[0].Time - Date.now() + this.TimeConstrains[0].LastCall));
    }
  }
}
