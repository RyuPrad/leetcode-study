// Runs one Java job for LeetCode Study's desktop runner. Reads a JSON job on stdin,
// compiles the solution in memory, runs each case on its own thread with a deadline and
// writes one JSON line per event to stdout. Outputs mirror coding/harness.js so the
// renderer can compare them with the JavaScript reference using coding/compare.ts.
import javax.tools.*;
import java.io.*;
import java.lang.reflect.*;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.*;

public final class JudgeMain {
    private static final PrintStream OUT = new PrintStream(new FileOutputStream(FileDescriptor.out), true, StandardCharsets.UTF_8);
    private static final int LOG_LIMIT = 65536;
    // Imports are prepended on line 1 so compiler and stack-trace lines match the editor.
    private static final String IMPORTS = "import java.util.*;import java.util.function.*;import java.util.stream.*;import java.math.*;";
    private static final String LIST_NODE = "class ListNode { int val; ListNode next; ListNode() {} ListNode(int val) { this.val = val; } ListNode(int val, ListNode next) { this.val = val; this.next = next; } }";
    private static final String TREE_NODE = "class TreeNode { int val; TreeNode left; TreeNode right; TreeNode() {} TreeNode(int val) { this.val = val; } TreeNode(int val, TreeNode left, TreeNode right) { this.val = val; this.left = left; this.right = right; } }";
    private static final Map<Integer, String> NODES = Map.of(
        133, "import java.util.*; class Node { public int val; public List<Node> neighbors; public Node() { val = 0; neighbors = new ArrayList<Node>(); } public Node(int _val) { val = _val; neighbors = new ArrayList<Node>(); } public Node(int _val, ArrayList<Node> _neighbors) { val = _val; neighbors = _neighbors; } }",
        138, "class Node { int val; Node next; Node random; public Node(int val) { this.val = val; this.next = null; this.random = null; } }",
        427, "class Node { public boolean val; public boolean isLeaf; public Node topLeft; public Node topRight; public Node bottomLeft; public Node bottomRight; public Node() { this.val = false; this.isLeaf = false; } public Node(boolean val, boolean isLeaf) { this.val = val; this.isLeaf = isLeaf; } public Node(boolean val, boolean isLeaf, Node topLeft, Node topRight, Node bottomLeft, Node bottomRight) { this.val = val; this.isLeaf = isLeaf; this.topLeft = topLeft; this.topRight = topRight; this.bottomLeft = bottomLeft; this.bottomRight = bottomRight; } }");
    private static final String GUESS_GAME = "class GuessGame { static int pick; int guess(int num) { return num == pick ? 0 : num < pick ? 1 : -1; } }";
    private static final String MOUNTAIN = "interface MountainArray { int get(int index); int length(); }";

    private static int number, arity;
    private static ClassLoader loader;
    private static String userFile;

    public static void main(String[] args) throws Exception {
        Map<String, Object> job = asMap(Json.parse(new String(System.in.readAllBytes(), StandardCharsets.UTF_8)));
        number = ((Number) job.get("number")).intValue();
        String className = (String) job.get("className"), kind = (String) job.get("kind"), entry = (String) job.get("entry");
        arity = ((Number) job.get("arity")).intValue();
        long timeout = ((Number) job.get("caseTimeoutMs")).longValue();
        List<Object> cases = asList(job.get("cases"));
        userFile = className + ".java";
        Map<String, String> files = new LinkedHashMap<>();
        files.put(userFile, IMPORTS + job.get("source"));
        files.put("ListNode.java", LIST_NODE);
        files.put("TreeNode.java", TREE_NODE);
        if (NODES.containsKey(number)) files.put("Node.java", NODES.get(number));
        if (number == 374) files.put("GuessGame.java", GUESS_GAME);
        if (number == 1095) files.put("MountainArray.java", MOUNTAIN);
        String errors = compile(files);
        if (errors != null) { emit(Map.of("type", "compile-error", "message", errors)); return; }
        emit(Map.of("type", "compiled"));
        for (int i = 0; i < cases.size(); i++) {
            List<Object> input = asList(cases.get(i));
            Map<String, Object> result = runCase(() -> execute(kind, className, entry, input), timeout);
            result.put("type", "case"); result.put("index", i);
            emit(result);
            // A running solution thread cannot be stopped safely; the process ends instead.
            if ("Time limit exceeded".equals(result.get("verdict"))) { OUT.flush(); Runtime.getRuntime().halt(0); }
        }
        OUT.flush();
        Runtime.getRuntime().halt(0);
    }

    // ---- Compilation -------------------------------------------------------------
    private static String compile(Map<String, String> sources) {
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
        Map<String, ByteArrayOutputStream> classes = new HashMap<>();
        JavaFileManager files = new ForwardingJavaFileManager<>(compiler.getStandardFileManager(diagnostics, null, StandardCharsets.UTF_8)) {
            @Override public JavaFileObject getJavaFileForOutput(Location location, String name, JavaFileObject.Kind kind, FileObject sibling) {
                return new SimpleJavaFileObject(URI.create("mem:///" + name.replace('.', '/') + kind.extension), kind) {
                    @Override public OutputStream openOutputStream() { ByteArrayOutputStream bytes = new ByteArrayOutputStream(); classes.put(name, bytes); return bytes; }
                };
            }
        };
        List<JavaFileObject> units = new ArrayList<>();
        for (Map.Entry<String, String> file : sources.entrySet()) units.add(new SimpleJavaFileObject(URI.create("string:///" + file.getKey()), JavaFileObject.Kind.SOURCE) {
            @Override public CharSequence getCharContent(boolean ignore) { return file.getValue(); }
        });
        boolean ok = compiler.getTask(null, files, diagnostics, List.of("-proc:none", "-Xlint:none", "-nowarn", "-encoding", "UTF-8"), null, units).call();
        if (!ok) {
            StringBuilder text = new StringBuilder();
            for (Diagnostic<? extends JavaFileObject> d : diagnostics.getDiagnostics()) {
                if (d.getKind() != Diagnostic.Kind.ERROR) continue;
                String source = d.getSource() == null ? userFile : new File(d.getSource().toUri().getPath()).getName();
                text.append(source).append(':').append(d.getLineNumber()).append(": error: ").append(d.getMessage(Locale.ROOT)).append('\n');
                if (text.length() > 7000) break;
            }
            return text.length() == 0 ? "Compilation failed." : text.toString().trim();
        }
        loader = new ClassLoader(JudgeMain.class.getClassLoader()) {
            @Override protected Class<?> findClass(String name) throws ClassNotFoundException {
                ByteArrayOutputStream bytes = classes.get(name);
                if (bytes == null) throw new ClassNotFoundException(name);
                byte[] data = bytes.toByteArray();
                return defineClass(name, data, 0, data.length);
            }
        };
        return null;
    }

    // ---- Case execution ----------------------------------------------------------
    interface Body { Object run() throws Throwable; }
    private static Map<String, Object> runCase(Body body, long timeout) throws Exception {
        ByteArrayOutputStream log = new ByteArrayOutputStream();
        PrintStream capture = new PrintStream(new OutputStream() {
            @Override public void write(int b) { if (log.size() < LOG_LIMIT) log.write(b); }
            @Override public void write(byte[] b, int off, int len) { int room = LOG_LIMIT - log.size(); if (room > 0) log.write(b, off, Math.min(len, room)); }
        }, true, StandardCharsets.UTF_8);
        PrintStream stdout = System.out, stderr = System.err;
        Object[] outcome = new Object[2];
        long[] elapsed = new long[1];
        // A large stack lets recursive solutions reach LeetCode-like depths.
        Thread worker = new Thread(null, () -> {
            long start = System.nanoTime();
            try { outcome[0] = body.run(); } catch (Throwable t) { outcome[1] = t; }
            elapsed[0] = System.nanoTime() - start;
        }, "solution", 512L << 20);
        System.setOut(capture); System.setErr(capture);
        long started = System.nanoTime();
        try { worker.start(); worker.join(timeout); } finally { System.setOut(stdout); System.setErr(stderr); }
        Map<String, Object> result = new LinkedHashMap<>();
        List<String> logs = new ArrayList<>();
        String printed = log.toString(StandardCharsets.UTF_8);
        if (!printed.isEmpty()) for (String line : printed.split("\r?\n")) logs.add(line.length() > 2000 ? line.substring(0, 2000) : line);
        if (log.size() >= LOG_LIMIT) logs.add("[Console output truncated]");
        result.put("logs", logs);
        if (worker.isAlive()) {
            result.put("verdict", "Time limit exceeded");
            result.put("error", "The case exceeded " + timeout + " ms.");
            result.put("durationMs", (System.nanoTime() - started) / 1e6);
            return result;
        }
        result.put("durationMs", Math.round(elapsed[0] / 1e4) / 100.0);
        Throwable error = (Throwable) outcome[1];
        if (error instanceof InvocationTargetException && error.getCause() != null) error = error.getCause();
        if (error == null) {
            result.put("verdict", "Accepted");
            result.put("actual", outcome[0]);
        } else {
            result.put("verdict", error instanceof OutOfMemoryError ? "Memory limit exceeded" : "Runtime error");
            result.put("error", describe(error));
        }
        return result;
    }
    private static String describe(Throwable error) {
        if (error instanceof HarnessException) return "Error: " + error.getMessage();
        StringBuilder text = new StringBuilder(error.getClass().getName());
        if (error.getMessage() != null) text.append(": ").append(error.getMessage());
        int frames = 0;
        for (StackTraceElement frame : error.getStackTrace()) {
            if (!userFile.equals(frame.getFileName())) continue;
            text.append("\n    at ").append(frame.getClassName()).append('.').append(frame.getMethodName()).append('(').append(frame.getFileName()).append(':').append(frame.getLineNumber()).append(')');
            if (++frames == 20) { text.append("\n    ..."); break; }
        }
        return text.length() > 8000 ? text.substring(0, 8000) : text.toString();
    }

    static final class HarnessException extends RuntimeException { HarnessException(String message) { super(message); } }

    private static Object execute(String kind, String className, String entry, List<Object> input) throws Throwable {
        Class<?> type = loader.loadClass(className);
        if (kind.equals("design")) return design(type, input);
        if (number == 271) {
            Object encoded = call(construct(type), "encode", List.of(input.get(0)));
            if (!(encoded instanceof String)) throw new HarnessException("encode must return a string.");
            return encode(call(construct(type), "decode", List.of(encoded)), null);
        }
        if (number == 297) {
            Object text = call(construct(type), "serialize", List.of(input.get(0)));
            if (!(text instanceof String)) throw new HarnessException("serialize must return a string.");
            return fromTree(call(construct(type), "deserialize", List.of(text)));
        }
        Object solution = construct(type);
        Method method = method(type, entry, arity);
        Type[] params = method.getGenericParameterTypes();
        switch (number) {
            case 133: return cloneGraph(solution, method, input);
            case 138: return copyRandomList(solution, method, input);
            case 141: {
                List<Object> nodes = listNodes(asList(input.get(0)));
                int pos = ((Number) input.get(1)).intValue();
                if (!nodes.isEmpty() && pos >= 0) field(nodes.get(nodes.size() - 1), "next", nodes.get(pos));
                return method.invoke(solution, nodes.isEmpty() ? null : nodes.get(0));
            }
            case 374: {
                Class<?> game = loader.loadClass("GuessGame");
                Field pick = game.getDeclaredField("pick"); pick.setAccessible(true); pick.setInt(null, ((Number) input.get(1)).intValue());
                return method.invoke(solution, ((Number) input.get(0)).intValue());
            }
            case 1095: return method.invoke(solution, ((Number) input.get(0)).intValue(), mountain(asList(input.get(1))));
            default: break;
        }
        Object[] args = new Object[params.length];
        if (args.length != input.size()) throw new HarnessException("Expected " + args.length + " arguments.");
        // 235 passes p and q as values of nodes in root.
        for (int i = 0; i < args.length; i++) args[i] = number == 235 && i > 0 ? findNode(args[0], toInt(input.get(i))) : decode(input.get(i), params[i]);
        Object result = method.invoke(solution, args);
        switch (number) {
            case 143: return fromList(args[0]);
            case 26: case 27: case 80: {
                int length = (Integer) result, total = ((int[]) args[0]).length;
                if (length < 0 || length > total) throw new HarnessException("Return the number of retained elements.");
                Map<String, Object> retained = new LinkedHashMap<>();
                retained.put("length", length); retained.put("values", encode(Arrays.copyOf((int[]) args[0], length), null));
                return retained;
            }
            case 48: case 73: case 75: case 88: case 130: case 189: case 286: case 344: return encode(args[0], null);
            case 235: {
                if (result == null || result != findNode(args[0], (Integer) field(result, "val"))) throw new HarnessException("Return an ancestor node from the input tree.");
                return field(result, "val");
            }
            case 427: return quadGrid(result, asList(input.get(0)).size());
            default: break;
        }
        // A void method changes its first argument in place, as the C harness reports it.
        if (method.getReturnType() == void.class) return encode(args[0], null);
        if (number == 190) return Integer.toUnsignedLong((Integer) result);
        return encode(result, method.getReturnType());
    }

    private static Object design(Class<?> type, List<Object> input) throws Throwable {
        List<Object> ops = asList(input.get(0)), args = asList(input.get(1));
        Constructor<?> constructor = null;
        for (Constructor<?> c : type.getDeclaredConstructors()) if (c.getParameterCount() == asList(args.get(0)).size()) constructor = c;
        if (constructor == null) throw new HarnessException(type.getSimpleName() + " needs a constructor with " + asList(args.get(0)).size() + " parameters.");
        constructor.setAccessible(true);
        Object instance = constructor.newInstance(decodeAll(asList(args.get(0)), constructor.getGenericParameterTypes()));
        List<Object> results = new ArrayList<>();
        results.add(null);
        for (int i = 1; i < ops.size(); i++) {
            List<Object> values = asList(args.get(i));
            Method method = method(type, (String) ops.get(i), values.size());
            Object value = method.invoke(instance, decodeAll(values, method.getGenericParameterTypes()));
            results.add(method.getReturnType() == void.class ? null : encode(value, method.getReturnType()));
        }
        return results;
    }
    private static Object call(Object target, String name, List<Object> values) throws Throwable {
        Method method = method(target.getClass(), name, values.size());
        return method.invoke(target, decodeAll(values, method.getGenericParameterTypes()));
    }
    private static Object construct(Class<?> type) throws Throwable {
        Constructor<?> constructor;
        try { constructor = type.getDeclaredConstructor(); } catch (NoSuchMethodException e) { throw new HarnessException(type.getSimpleName() + " needs a constructor without parameters."); }
        constructor.setAccessible(true);
        return constructor.newInstance();
    }
    private static Method method(Class<?> type, String name, Integer arity) {
        for (Class<?> c = type; c != null; c = c.getSuperclass())
            for (Method m : c.getDeclaredMethods())
                if (m.getName().equals(name) && (arity == null || m.getParameterCount() == arity) && !m.isSynthetic()) { m.setAccessible(true); return m; }
        throw new HarnessException("Method " + name + " was not found in " + type.getSimpleName() + ".");
    }

    // ---- JSON <-> Java values ----------------------------------------------------
    private static Object[] decodeAll(List<Object> values, Type[] types) {
        if (values.size() != types.length) throw new HarnessException("Expected " + types.length + " arguments.");
        Object[] out = new Object[types.length];
        for (int i = 0; i < out.length; i++) out[i] = decode(values.get(i), types[i]);
        return out;
    }
    private static int toInt(Object value) {
        long n = ((Number) value).longValue();
        // reverseBits takes the 32 bits unsigned, as the JavaScript reference does.
        if (number == 190 && n > Integer.MAX_VALUE && n <= 0xFFFFFFFFL) return (int) n;
        return Math.toIntExact(n);
    }
    static Object decode(Object value, Type type) {
        if (type instanceof ParameterizedType p && p.getRawType() == List.class) {
            List<Object> out = new ArrayList<>();
            for (Object item : asList(value)) out.add(decode(item, p.getActualTypeArguments()[0]));
            return out;
        }
        Class<?> c = (Class<?>) type;
        if (c == int.class || c == Integer.class) return toInt(value);
        if (c == long.class || c == Long.class) return ((Number) value).longValue();
        if (c == double.class || c == Double.class) return ((Number) value).doubleValue();
        if (c == boolean.class || c == Boolean.class) return value;
        if (c == char.class || c == Character.class) return ((String) value).charAt(0);
        if (c == String.class) return value;
        if (c.getSimpleName().equals("ListNode")) return toList(asList(value));
        if (c.getSimpleName().equals("TreeNode")) return toTree(asList(value));
        if (c.isArray()) {
            List<Object> items = asList(value);
            Object array = Array.newInstance(c.getComponentType(), items.size());
            for (int i = 0; i < items.size(); i++) Array.set(array, i, decode(items.get(i), c.getComponentType()));
            return array;
        }
        throw new HarnessException("Unsupported parameter type " + c.getSimpleName() + ".");
    }
    static Object encode(Object value, Class<?> declared) {
        if (declared != null && declared.getSimpleName().equals("ListNode")) return fromList(value);
        if (declared != null && declared.getSimpleName().equals("TreeNode")) return fromTree(value);
        if (value == null || value instanceof String || value instanceof Boolean || value instanceof Number) return value;
        if (value instanceof Character ch) return String.valueOf(ch);
        if (value.getClass().isArray()) {
            List<Object> out = new ArrayList<>();
            for (int i = 0; i < Array.getLength(value); i++) out.add(encode(Array.get(value, i), null));
            return out;
        }
        if (value instanceof Collection<?> items) { List<Object> out = new ArrayList<>(); for (Object item : items) out.add(encode(item, null)); return out; }
        if (value.getClass().getSimpleName().equals("ListNode")) return fromList(value);
        if (value.getClass().getSimpleName().equals("TreeNode")) return fromTree(value);
        throw new HarnessException("Return a JSON-compatible value, not " + value.getClass().getSimpleName() + ".");
    }

    // ---- Lists, trees and special structures --------------------------------------
    private static Object newNode(String name, Object... args) {
        try {
            for (Constructor<?> c : loader.loadClass(name).getDeclaredConstructors())
                if (c.getParameterCount() == args.length) { c.setAccessible(true); return c.newInstance(args); }
        } catch (ReflectiveOperationException e) { throw new HarnessException("Could not build " + name + ": " + e); }
        throw new HarnessException(name + " has no constructor for " + args.length + " arguments.");
    }
    static Object field(Object target, String name) {
        try { Field f = target.getClass().getDeclaredField(name); f.setAccessible(true); return f.get(target); }
        catch (ReflectiveOperationException e) { throw new HarnessException("Missing field " + name + "."); }
    }
    static void field(Object target, String name, Object value) {
        try { Field f = target.getClass().getDeclaredField(name); f.setAccessible(true); f.set(target, value); }
        catch (ReflectiveOperationException e) { throw new HarnessException("Missing field " + name + "."); }
    }
    private static List<Object> listNodes(List<Object> values) {
        List<Object> nodes = new ArrayList<>();
        for (Object v : values) nodes.add(newNode("ListNode", toInt(v)));
        for (int i = 0; i + 1 < nodes.size(); i++) field(nodes.get(i), "next", nodes.get(i + 1));
        return nodes;
    }
    private static Object toList(List<Object> values) { List<Object> nodes = listNodes(values); return nodes.isEmpty() ? null : nodes.get(0); }
    private static List<Object> fromList(Object head) {
        List<Object> values = new ArrayList<>();
        Set<Object> seen = Collections.newSetFromMap(new IdentityHashMap<>());
        while (head != null) {
            if (!seen.add(head) || values.size() > 10000) throw new HarnessException("Output list contains a cycle or is too large.");
            values.add(field(head, "val")); head = field(head, "next");
        }
        return values;
    }
    private static Object toTree(List<Object> values) {
        if (values.isEmpty() || values.get(0) == null) return null;
        Object root = newNode("TreeNode", toInt(values.get(0)));
        List<Object> queue = new ArrayList<>(List.of(root));
        int i = 1;
        for (int q = 0; q < queue.size() && i < values.size(); q++)
            for (String key : new String[] { "left", "right" }) {
                if (i < values.size() && values.get(i) != null) { Object child = newNode("TreeNode", toInt(values.get(i))); field(queue.get(q), key, child); queue.add(child); }
                i++;
            }
        return root;
    }
    private static List<Object> fromTree(Object root) {
        List<Object> out = new ArrayList<>(), queue = new ArrayList<>();
        Set<Object> seen = Collections.newSetFromMap(new IdentityHashMap<>());
        queue.add(root);
        for (int q = 0; q < queue.size(); q++) {
            Object node = queue.get(q);
            if (node == null) { out.add(null); continue; }
            if (!seen.add(node) || queue.size() > 20000) throw new HarnessException("Output tree contains a cycle, shared node, or is too large.");
            out.add(field(node, "val")); queue.add(field(node, "left")); queue.add(field(node, "right"));
        }
        while (!out.isEmpty() && out.get(out.size() - 1) == null) out.remove(out.size() - 1);
        return out;
    }
    private static Object findNode(Object node, int val) {
        if (node == null) return null;
        if ((Integer) field(node, "val") == val) return node;
        Object left = findNode(field(node, "left"), val);
        return left != null ? left : findNode(field(node, "right"), val);
    }
    @SuppressWarnings("unchecked")
    private static Object cloneGraph(Object solution, Method method, List<Object> input) throws Throwable {
        List<Object> adjacency = asList(input.get(0)), nodes = new ArrayList<>();
        for (int i = 0; i < adjacency.size(); i++) nodes.add(newNode("Node", i + 1));
        for (int i = 0; i < nodes.size(); i++) { List<Object> neighbors = (List<Object>) field(nodes.get(i), "neighbors"); for (Object v : asList(adjacency.get(i))) neighbors.add(nodes.get(toInt(v) - 1)); }
        Object output = method.invoke(solution, nodes.isEmpty() ? null : nodes.get(0));
        Set<Object> inputs = Collections.newSetFromMap(new IdentityHashMap<>()), seen = Collections.newSetFromMap(new IdentityHashMap<>());
        inputs.addAll(nodes);
        List<Object> queue = new ArrayList<>(), rows = new ArrayList<>(Collections.nCopies(adjacency.size(), null));
        if (output != null) queue.add(output);
        for (int i = 0; i < queue.size(); i++) {
            Object node = queue.get(i);
            if (seen.contains(node)) continue;
            if (inputs.contains(node)) throw new HarnessException("Return a deep copy, not an input node.");
            int val = (Integer) field(node, "val");
            if (seen.size() > 1000 || val < 1 || val > adjacency.size()) throw new HarnessException("Invalid graph node.");
            seen.add(node);
            if (rows.get(val - 1) != null) throw new HarnessException("Duplicate graph node value.");
            List<Object> neighbors = (List<Object>) field(node, "neighbors");
            List<Integer> values = new ArrayList<>();
            for (Object n : neighbors) values.add((Integer) field(n, "val"));
            Collections.sort(values);
            rows.set(val - 1, values);
            queue.addAll(neighbors);
        }
        for (int i = 0; i < nodes.size(); i++) {
            List<Integer> values = new ArrayList<>();
            for (Object n : (List<Object>) field(nodes.get(i), "neighbors")) values.add((Integer) field(n, "val"));
            List<Integer> original = new ArrayList<>();
            for (Object v : asList(adjacency.get(i))) original.add(toInt(v));
            if ((Integer) field(nodes.get(i), "val") != i + 1 || !values.equals(original)) throw new HarnessException("The input graph was modified.");
        }
        // Like the sparse JavaScript array: holes serialize as null, and it ends at the highest value seen.
        while (!rows.isEmpty() && rows.get(rows.size() - 1) == null) rows.remove(rows.size() - 1);
        return rows;
    }
    private static Object copyRandomList(Object solution, Method method, List<Object> input) throws Throwable {
        List<Object> pairs = asList(input.get(0)), nodes = new ArrayList<>();
        for (Object pair : pairs) nodes.add(newNode("Node", toInt(asList(pair).get(0))));
        for (int i = 0; i < nodes.size(); i++) {
            field(nodes.get(i), "next", i + 1 < nodes.size() ? nodes.get(i + 1) : null);
            Object random = asList(pairs.get(i)).get(1);
            field(nodes.get(i), "random", random == null ? null : nodes.get(toInt(random)));
        }
        Object head = method.invoke(solution, nodes.isEmpty() ? null : nodes.get(0));
        Set<Object> inputs = Collections.newSetFromMap(new IdentityHashMap<>()), seen = Collections.newSetFromMap(new IdentityHashMap<>());
        inputs.addAll(nodes);
        List<Object> out = new ArrayList<>();
        while (head != null) {
            if (seen.contains(head) || out.size() > 10000) throw new HarnessException("Invalid output list.");
            if (inputs.contains(head)) throw new HarnessException("Return a deep copy, not an input node.");
            seen.add(head); out.add(head); head = field(head, "next");
        }
        for (int i = 0; i < nodes.size(); i++) {
            Object random = asList(pairs.get(i)).get(1), node = nodes.get(i);
            if ((Integer) field(node, "val") != toInt(asList(pairs.get(i)).get(0)) || field(node, "next") != (i + 1 < nodes.size() ? nodes.get(i + 1) : null) || field(node, "random") != (random == null ? null : nodes.get(toInt(random)))) throw new HarnessException("The input list was modified.");
        }
        List<Object> rows = new ArrayList<>();
        for (Object node : out) {
            Object random = field(node, "random");
            if (random != null && !seen.contains(random)) throw new HarnessException("random must point into the copied list.");
            int index = -1;
            for (int i = 0; i < out.size(); i++) if (out.get(i) == random) index = i;
            rows.add(Arrays.asList(field(node, "val"), random == null ? null : index));
        }
        return rows;
    }
    private static Object mountain(List<Object> values) throws Exception {
        Class<?> type = loader.loadClass("MountainArray");
        int[] calls = { 0 };
        return Proxy.newProxyInstance(loader, new Class<?>[] { type }, (proxy, m, a) -> {
            if (m.getName().equals("length")) return values.size();
            if (m.getName().equals("get")) {
                if (++calls[0] > 100) throw new HarnessException("MountainArray.get exceeded 100 calls.");
                int i = (Integer) a[0];
                if (i < 0 || i >= values.size()) throw new HarnessException("MountainArray index out of range.");
                return toInt(values.get(i));
            }
            if (m.getName().equals("toString")) return "MountainArray";
            throw new HarnessException("MountainArray has no method " + m.getName() + ".");
        });
    }
    private static Object quadGrid(Object root, int size) {
        int[][] grid = new int[size][size];
        Set<Object> seen = Collections.newSetFromMap(new IdentityHashMap<>());
        fill(root, 0, 0, size, grid, seen);
        return encode(grid, null);
    }
    private static void fill(Object node, int r, int c, int n, int[][] grid, Set<Object> seen) {
        if (node == null || !seen.add(node) || n < 1) throw new HarnessException("Invalid quad tree.");
        if ((Boolean) field(node, "isLeaf")) {
            int value = (Boolean) field(node, "val") ? 1 : 0;
            for (int i = r; i < r + n; i++) for (int j = c; j < c + n; j++) grid[i][j] = value;
            return;
        }
        fill(field(node, "topLeft"), r, c, n / 2, grid, seen);
        fill(field(node, "topRight"), r, c + n / 2, n / 2, grid, seen);
        fill(field(node, "bottomLeft"), r + n / 2, c, n / 2, grid, seen);
        fill(field(node, "bottomRight"), r + n / 2, c + n / 2, n / 2, grid, seen);
    }

    // ---- Minimal JSON ------------------------------------------------------------
    @SuppressWarnings("unchecked") static Map<String, Object> asMap(Object value) { return (Map<String, Object>) value; }
    @SuppressWarnings("unchecked") static List<Object> asList(Object value) {
        if (!(value instanceof List)) throw new HarnessException("Expected an array argument.");
        return (List<Object>) value;
    }
    private static void emit(Map<String, Object> event) { OUT.println(Json.write(event)); }

    static final class Json {
        private final String s; private int i;
        private Json(String s) { this.s = s; }
        static Object parse(String text) { Json json = new Json(text); Object value = json.value(); json.space(); if (json.i != text.length()) throw new IllegalArgumentException("Trailing JSON."); return value; }
        private void space() { while (i < s.length() && Character.isWhitespace(s.charAt(i))) i++; }
        private Object value() {
            space();
            char c = s.charAt(i);
            if (c == '{') { i++; Map<String, Object> map = new LinkedHashMap<>(); space(); if (s.charAt(i) == '}') { i++; return map; }
                while (true) { space(); String key = string(); space(); i++; map.put(key, value()); space(); if (s.charAt(i++) == '}') return map; } }
            if (c == '[') { i++; List<Object> list = new ArrayList<>(); space(); if (s.charAt(i) == ']') { i++; return list; }
                while (true) { list.add(value()); space(); if (s.charAt(i++) == ']') return list; } }
            if (c == '"') return string();
            if (s.startsWith("true", i)) { i += 4; return true; }
            if (s.startsWith("false", i)) { i += 5; return false; }
            if (s.startsWith("null", i)) { i += 4; return null; }
            int start = i;
            while (i < s.length() && "+-0123456789.eE".indexOf(s.charAt(i)) >= 0) i++;
            String n = s.substring(start, i);
            if (n.contains(".") || n.contains("e") || n.contains("E")) return Double.parseDouble(n);
            try { return Long.parseLong(n); } catch (NumberFormatException e) { return Double.parseDouble(n); }
        }
        private String string() {
            StringBuilder out = new StringBuilder(); i++;
            while (true) {
                char c = s.charAt(i++);
                if (c == '"') return out.toString();
                if (c != '\\') { out.append(c); continue; }
                char e = s.charAt(i++);
                switch (e) {
                    case 'n': out.append('\n'); break; case 't': out.append('\t'); break; case 'r': out.append('\r'); break;
                    case 'b': out.append('\b'); break; case 'f': out.append('\f'); break;
                    case 'u': out.append((char) Integer.parseInt(s.substring(i, i + 4), 16)); i += 4; break;
                    default: out.append(e);
                }
            }
        }
        static String write(Object value) { StringBuilder out = new StringBuilder(); write(value, out); return out.toString(); }
        private static void write(Object value, StringBuilder out) {
            if (value == null) out.append("null");
            else if (value instanceof String str) quote(str, out);
            else if (value instanceof Double d) out.append(d.isNaN() || d.isInfinite() ? "null" : d == Math.rint(d) && Math.abs(d) < 1e15 ? String.valueOf(d.longValue()) : String.valueOf(d));
            else if (value instanceof Float f) write(f.doubleValue(), out);
            else if (value instanceof Number || value instanceof Boolean) out.append(value);
            else if (value instanceof Map<?, ?> map) { out.append('{'); boolean first = true; for (Map.Entry<?, ?> e : map.entrySet()) { if (!first) out.append(','); first = false; quote(String.valueOf(e.getKey()), out); out.append(':'); write(e.getValue(), out); } out.append('}'); }
            else if (value instanceof List<?> list) { out.append('['); for (int k = 0; k < list.size(); k++) { if (k > 0) out.append(','); write(list.get(k), out); } out.append(']'); }
            else quote(String.valueOf(value), out);
        }
        private static void quote(String str, StringBuilder out) {
            out.append('"');
            for (int k = 0; k < str.length(); k++) {
                char c = str.charAt(k);
                if (c == '"' || c == '\\') out.append('\\').append(c);
                else if (c < 0x20) out.append(String.format("\\u%04x", (int) c));
                else out.append(c);
            }
            out.append('"');
        }
    }
}
