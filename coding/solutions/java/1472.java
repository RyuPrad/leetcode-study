class BrowserHistory {
    private static class Page {
        String url;
        Page prev, next;
        Page(String url, Page prev) { this.url = url; this.prev = prev; }
    }
    private Page curr;

    public BrowserHistory(String homepage) {
        curr = new Page(homepage, null);
    }

    public void visit(String url) {
        curr.next = new Page(url, curr);
        curr = curr.next;
    }

    public String back(int steps) {
        while (steps > 0 && curr.prev != null) {
            curr = curr.prev;
            steps--;
        }
        return curr.url;
    }

    public String forward(int steps) {
        while (steps > 0 && curr.next != null) {
            curr = curr.next;
            steps--;
        }
        return curr.url;
    }
}
