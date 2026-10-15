type Page = { url: string; prev: Page | null; next: Page | null };

class BrowserHistory {
  curr: Page;

  constructor(homepage: string) {
    this.curr = { url: homepage, prev: null, next: null };
  }

  visit(url: string): void {
    this.curr.next = { url, prev: this.curr, next: null };
    this.curr = this.curr.next;
  }

  back(steps: number): string {
    while (steps > 0 && this.curr.prev) {
      this.curr = this.curr.prev;
      steps--;
    }
    return this.curr.url;
  }

  forward(steps: number): string {
    while (steps > 0 && this.curr.next) {
      this.curr = this.curr.next;
      steps--;
    }
    return this.curr.url;
  }
}
