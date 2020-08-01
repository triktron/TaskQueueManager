import { Task } from './src/Task';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class CustomTask extends Task {

  sleepTime: number

  async exec() {
    //console.log("sleep for", this.sleepTime);
    await sleep(this.sleepTime);
    //console.log("running ", this.name);
    //if (this.name.includes("trik")) throw new Error('i hate him');
  }

}
