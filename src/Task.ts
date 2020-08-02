export class Task {
  ID: number = -1;

  Name: string = 'Anonymous Tast';

  DependsOn: number[] = [];

  Running: boolean = false;

  Group: string = 'Master';

  async exec() {
    throw new Error('empty task!');
  }
}
