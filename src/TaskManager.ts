import { Task } from './Task';
export { Task };

export interface TimeConstrain {
  Name: string;
  Time: number;
  LastCall: number;
  Running: number;
  MaxRunning: number;
}

export class TaskManager {
  TaskQueue: Task[] = [];
  NextId: number = 0;
  Running: number = 0;
  MaxRunning: number = 4;
  Verbose: boolean = false;

  TimeConstrains: TimeConstrain[] = [
    {
      Name: 'Master',
      Time: 0,
      LastCall: 0,
      Running: 0,
      MaxRunning: 4,
    },
  ];

  AddTask(task: Task) {
    task.ID = ++this.NextId;
    this.TaskQueue.push(task);

    this.StartNextTask();

    return task.ID;
  }

  TaskReturned(CompletedTask: Task, succeed: boolean, e?: Error) {
    if (this.Verbose) {
      if (succeed) console.log(CompletedTask.Name, 'ran succsesfuly');
      else console.error(CompletedTask.Name, 'failed!!\n', e);
    }

    const index = this.TaskQueue.findIndex((t) => t.ID === CompletedTask.ID);
    if (index > -1) {
      this.TaskQueue.splice(index, 1);
    }
    this.Running--;
    const group = this.TimeConstrains.find((g) => g.Name === CompletedTask.Group);
    if (group) {
      group.Running--;
      group.LastCall = Date.now();
    }

    this.StartNextTask();
  }

  findRunnebleTask(checkTime: boolean = true) {
    let group: TimeConstrain = this.TimeConstrains[0];
    const index = this.TaskQueue.findIndex((t) => {
      group = this.TimeConstrains.find((g) => g.Name === t.Group) || this.TimeConstrains[0];

      let isValid: boolean =
        !t.Running &&
        (t.DependsOn.length === 0 ||
          t.DependsOn.every((dependency) => this.TaskQueue.findIndex((t2) => t2.ID === dependency) === -1));

      if (group !== null) {
        isValid = isValid && group.Running < group.MaxRunning;

        if (checkTime) isValid = isValid && group.LastCall < Date.now() - group.Time;
      }

      return isValid;
    });

    return {
      index,
      group,
    };
  }

  StartNextTask() {
    if (this.Running >= this.MaxRunning) return;

    const { index, group } = this.findRunnebleTask();

    if (index > -1) {
      this.Running++;
      if (group !== null) (group as TimeConstrain).Running++;
      if (this.Verbose) console.log('starting task:', this.TaskQueue[index].Name);
      this.TaskQueue[index].Running = true;

      this.TaskQueue[index]
        .exec()
        .then(
          ((task: Task) => {
            this.TaskReturned(task, true);
          }).bind(undefined, this.TaskQueue[index]),
        )
        .catch(
          ((task: Task) => {
            this.TaskReturned(task, true);
          }).bind(undefined, this.TaskQueue[index]),
        );
    } else if (this.TaskQueue.length > 0 && this.TimeConstrains.length > 1) {
      const firstgroup = this.TimeConstrains.reduce((acc, loc) =>
        acc.Time - Date.now() + acc.LastCall < loc.Time - Date.now() + loc.LastCall ? acc : loc,
      );
      setTimeout(this.StartNextTask.bind(this), firstgroup.Time - Date.now() + firstgroup.LastCall);
    } else if (this.TaskQueue.length > 0 && this.TimeConstrains.length > 0) {
      setTimeout(
        this.StartNextTask.bind(this),
        this.TimeConstrains[0].Time - Date.now() + this.TimeConstrains[0].LastCall,
      );
    }
  }
}
