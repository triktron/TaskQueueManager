export class Task {

  ID: Number

  Name: string

  DependsOn: Number[] = []

  Running: boolean = false

  Group: string = "Master"

  async exec() {
    throw new Error('empty task!');
  }
}
