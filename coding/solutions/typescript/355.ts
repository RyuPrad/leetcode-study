class Twitter {
  private time = 0;
  private tweets = new Map<number, [number, number][]>(); // user -> [[time, tweetId]]
  private following = new Map<number, Set<number>>(); // user -> Set

  postTweet(userId: number, tweetId: number): void {
    if (!this.tweets.has(userId)) this.tweets.set(userId, []);
    this.tweets.get(userId)!.push([this.time++, tweetId]);
  }

  getNewsFeed(userId: number): number[] {
    const heap = new Heap<[number, number]>((a, b) => a[0] > b[0]); // newest first
    const users = new Set(this.following.get(userId) || []);
    users.add(userId);
    for (const u of users) {
      for (const entry of (this.tweets.get(u) || [])) {
        heap.push(entry);
      }
    }
    const res: number[] = [];
    while (heap.size() && res.length < 10) {
      res.push(heap.pop()[1]);
    }
    return res;
  }

  follow(followerId: number, followeeId: number): void {
    if (!this.following.has(followerId)) this.following.set(followerId, new Set());
    this.following.get(followerId)!.add(followeeId);
  }

  unfollow(followerId: number, followeeId: number): void {
    if (this.following.has(followerId)) this.following.get(followerId)!.delete(followeeId);
  }
}

class Heap<T> {
  private items: T[] = [];

  constructor(private before: (a: T, b: T) => boolean) {}

  size(): number {
    return this.items.length;
  }

  peek(): T {
    return this.items[0];
  }

  push(value: T): void {
    const items = this.items;
    items.push(value);
    for (let i = items.length - 1; i > 0;) {
      const parent = (i - 1) >> 1;
      if (!this.before(items[i], items[parent])) break;
      [items[parent], items[i]] = [items[i], items[parent]];
      i = parent;
    }
  }

  pop(): T {
    const items = this.items, top = items[0], last = items.pop()!;
    if (items.length) {
      items[0] = last;
      for (let i = 0; ;) {
        const left = 2 * i + 1, right = left + 1;
        let best = i;
        if (left < items.length && this.before(items[left], items[best])) best = left;
        if (right < items.length && this.before(items[right], items[best])) best = right;
        if (best === i) break;
        [items[best], items[i]] = [items[i], items[best]];
        i = best;
      }
    }
    return top;
  }
}
