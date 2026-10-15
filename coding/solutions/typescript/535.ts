class Codec {
  urls: string[];
  constructor() {
    this.urls = [];
  }
  encode(longUrl: string): string {
    this.urls.push(longUrl);
    return 'http://tinyurl.com/' + (this.urls.length - 1);
  }
  decode(shortUrl: string): string {
    const id = Number(shortUrl.slice(shortUrl.lastIndexOf('/') + 1));
    return this.urls[id];
  }
}
