class Solution {
    public String pushDominoes(String dominoes) {
        int n = dominoes.length();
        int[] forces = new int[n];
        int force = 0;
        for (int i = 0; i < n; i++) {
            if (dominoes.charAt(i) == 'R') force = n;
            else if (dominoes.charAt(i) == 'L') force = 0;
            else force = Math.max(force - 1, 0);
            forces[i] += force;
        }
        force = 0;
        for (int i = n - 1; i >= 0; i--) {
            if (dominoes.charAt(i) == 'L') force = n;
            else if (dominoes.charAt(i) == 'R') force = 0;
            else force = Math.max(force - 1, 0);
            forces[i] -= force;
        }
        StringBuilder res = new StringBuilder();
        for (int f : forces) res.append(f > 0 ? 'R' : f < 0 ? 'L' : '.');
        return res.toString();
    }
}
