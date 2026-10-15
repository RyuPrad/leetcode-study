public class Codec {
    private List<String> urls = new ArrayList<>();

    public String encode(String longUrl) {
        urls.add(longUrl);
        return "http://tinyurl.com/" + (urls.size() - 1);
    }

    public String decode(String shortUrl) {
        int id = Integer.parseInt(shortUrl.substring(shortUrl.lastIndexOf('/') + 1));
        return urls.get(id);
    }
}
