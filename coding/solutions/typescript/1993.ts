class LockingTree {
  parent: number[];
  locked: number[];
  children: number[][];

  constructor(parent: number[]) {
    this.parent = parent;
    this.locked = new Array(parent.length).fill(0);
    this.children = Array.from({ length: parent.length }, () => []);
    for (let i = 1; i < parent.length; i++) {
      this.children[parent[i]].push(i);
    }
  }

  lock(num: number, user: number): boolean {
    if (this.locked[num]) {
      return false;
    }
    this.locked[num] = user;
    return true;
  }

  unlock(num: number, user: number): boolean {
    if (this.locked[num] !== user) {
      return false;
    }
    this.locked[num] = 0;
    return true;
  }

  upgrade(num: number, user: number): boolean {
    for (let node = num; node !== -1; node = this.parent[node]) {
      if (this.locked[node]) {
        return false;
      }
    }
    let found = false;
    const stack = [...this.children[num]];
    while (stack.length) {
      const node = stack.pop()!;
      if (this.locked[node]) {
        this.locked[node] = 0;
        found = true;
      }
      stack.push(...this.children[node]);
    }
    if (found) {
      this.locked[num] = user;
    }
    return found;
  }
}
