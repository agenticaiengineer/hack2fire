// Content database — Python interview cheatsheet for C++/Rust/Java devs.
// Each tab.categories[*].items[*] needs: id, concept, code, complexity, note.
const db = {

    syntax: {
        id: 'syntax',
        title: "Syntax & Idioms",
        icon: "ph-brackets-curly",
        categories: [
            {
                title: "Truthiness, None & Comparisons", icon: "ph-question", color: "text-yellow-400", bg: "bg-yellow-400/10",
                items: [
                    { id: "truthiness", concept: "Truthy / Falsy values",
                        code: "# Falsy: None, False, 0, 0.0, '', [], {}, set(), range(0)\n# Everything else is truthy.\nif not arr:        # empty list check (Pythonic)\n    return None\nif x is None:      # NEVER use == None\n    ...\nif x is not None:  # explicit None test before falsy ops",
                        complexity: "O(1)",
                        note: "C++/Java devs: `if (arr)` works on a list but means 'non-empty', NOT 'not null'. Always use `is None` for null checks — `==` can be overridden by __eq__ and is slower." },
                    { id: "equality_identity", concept: "== vs is",
                        code: "a = [1,2]; b = [1,2]\na == b   # True  (value equality, calls __eq__)\na is b   # False (identity, like Java ==)\n\nx = 256; y = 256\nx is y   # True  (CPython caches small ints -5..256)\nx = 257; y = 257\nx is y   # False — do NOT rely on identity for ints",
                        complexity: "O(N) for ==, O(1) for is",
                        note: "`is` = Java `==` / C++ pointer compare. `==` = Java `.equals()`. The small-int cache is an implementation detail; never write code that depends on it." },
                    { id: "none_default", concept: "Optional<T> equivalent",
                        code: "from typing import Optional\n\ndef find(arr, x) -> Optional[int]:\n    for i, v in enumerate(arr):\n        if v == x:\n            return i\n    return None        # No Optional wrapper needed — None IS the absence\n\nidx = find(arr, 3)\nif idx is not None:    # required: 0 is falsy too!\n    use(idx)",
                        complexity: "O(1)",
                        note: "Rust `Option<T>` / Java `Optional<T>` ≈ Python `T | None`. Critical trap: `if idx:` skips index 0. Always `is not None`." },
                    { id: "chained_compare", concept: "Chained comparisons",
                        code: "if 0 <= i < len(arr):     # one expression, evaluated once\n    arr[i]\n\nif a < b < c < d:         # all four ordered\n    ...\n\n# Equivalent to: 0 <= i and i < len(arr)\n# Each subexpression evaluated only once (unlike C++)",
                        complexity: "O(1)",
                        note: "In C++, `0 <= i < n` parses as `(0 <= i) < n` — almost always wrong. Python does the math-natural thing. Use this for bounds checks." },
                    { id: "walrus", concept: "Walrus := (assignment expr)",
                        code: "# Read a line until empty\nwhile (line := input()):\n    process(line)\n\n# Avoid double computation\nif (n := len(arr)) > 10:\n    print(f'long: {n}')\n\n# In comprehensions\n[y for x in data if (y := f(x)) is not None]",
                        complexity: "O(1)",
                        note: "Python 3.8+. Like C/Java `if ((p = next()) != null)`. Great for caching a value used in both the condition and the body." }
                ]
            },
            {
                title: "Variables, Scoping & Closures", icon: "ph-stack-simple", color: "text-orange-400", bg: "bg-orange-400/10",
                items: [
                    { id: "scope_legb", concept: "LEGB scope resolution",
                        code: "x = 'global'\ndef outer():\n    x = 'enclosing'\n    def inner():\n        # x = 'local'   # would shadow\n        print(x)        # finds 'enclosing'\n    inner()\n# Lookup: Local -> Enclosing -> Global -> Built-in",
                        complexity: "O(1)",
                        note: "No block scope. `if/for/while` do NOT create scopes — variables defined inside leak outward. Only functions, classes, comprehensions (3.x) introduce scope." },
                    { id: "nonlocal_global", concept: "nonlocal vs global",
                        code: "count = 0\ndef inc():\n    global count       # rebind module-level\n    count += 1\n\ndef make_counter():\n    n = 0\n    def step():\n        nonlocal n     # rebind enclosing\n        n += 1\n        return n\n    return step",
                        complexity: "O(1)",
                        note: "Without `nonlocal`/`global`, `n += 1` creates a NEW local and shadows the outer. Mutating containers (`lst.append(x)`) doesn't need these — only rebinding does." },
                    { id: "late_binding_closure", concept: "Late-binding closure trap",
                        code: "# WRONG: all funcs print 4\nfuncs = [lambda: i for i in range(5)]\n[f() for f in funcs]   # [4,4,4,4,4]\n\n# FIX: bind at definition time via default arg\nfuncs = [lambda i=i: i for i in range(5)]\n[f() for f in funcs]   # [0,1,2,3,4]",
                        complexity: "N/A",
                        note: "Closures capture variables by reference, not by value (unlike C++ `[=]` lambdas). The default-arg trick is the canonical workaround." },
                    { id: "mutable_default", concept: "Mutable default arg trap",
                        code: "# BUG: shared across calls\ndef append_to(item, lst=[]):\n    lst.append(item)\n    return lst\nappend_to(1)   # [1]\nappend_to(2)   # [1, 2]  !!\n\n# FIX\ndef append_to(item, lst=None):\n    if lst is None:\n        lst = []\n    lst.append(item)\n    return lst",
                        complexity: "N/A",
                        note: "Default args are evaluated ONCE at def time and shared. Same issue with `dict`, `set`. Always use `None` sentinel for mutable defaults." }
                ]
            },
            {
                title: "Unpacking, Tuples & Multiple Returns", icon: "ph-arrows-out", color: "text-pink-400", bg: "bg-pink-400/10",
                items: [
                    { id: "tuple_unpack", concept: "Unpacking & swap",
                        code: "a, b = 1, 2\na, b = b, a              # swap, no temp\n\nx, *mid, y = [1,2,3,4,5]  # x=1, mid=[2,3,4], y=5\nfirst, *rest = arr        # head/tail split\n\nfor i, v in enumerate(arr):\n    ...\nfor k, v in d.items():\n    ...",
                        complexity: "O(1) / O(N)",
                        note: "C++17 `auto [a,b] = ...` ≈ Python tuple unpack. The `*rest` form mirrors Rust slice patterns `[x, rest @ ..]`." },
                    { id: "multi_return", concept: "Multiple return values",
                        code: "def divmod_(a, b):\n    return a // b, a % b    # actually a tuple\n\nq, r = divmod_(17, 5)\n\n# Named (more readable for >2)\nfrom typing import NamedTuple\nclass Point(NamedTuple):\n    x: int\n    y: int\np = Point(3, 4); p.x, p.y",
                        complexity: "O(1)",
                        note: "No `std::pair`/`Tuple<A,B>` ceremony — just `return a, b`. For >3 values, prefer NamedTuple or dataclass for self-documenting code." },
                    { id: "starargs", concept: "*args / **kwargs",
                        code: "def f(*args, **kwargs):\n    # args: tuple of positional\n    # kwargs: dict of keyword\n    ...\n\ndef g(a, b, c): ...\nargs = [1, 2, 3]\ng(*args)               # spread, like JS\n\nopts = {'a':1,'b':2,'c':3}\ng(**opts)              # spread dict as kwargs",
                        complexity: "O(N)",
                        note: "Java varargs `T...` ≈ `*args`. `**kwargs` has no direct C++/Java analog — closest is a `Map<String,Object>`." }
                ]
            },
            {
                title: "Comprehensions & Generators", icon: "ph-list-checks", color: "text-emerald-400", bg: "bg-emerald-400/10",
                items: [
                    { id: "list_comp", concept: "List / set / dict comp",
                        code: "squares = [x*x for x in range(10)]\nevens  = [x for x in arr if x % 2 == 0]\ngrid   = [[0]*cols for _ in range(rows)]   # SAFE 2D\n\nuniq   = {x % 7 for x in arr}              # set comp\nidx    = {v: i for i, v in enumerate(arr)} # dict comp\n\n# Nested (order = outer to inner)\nflat = [x for row in matrix for x in row]",
                        complexity: "O(N)",
                        note: "Faster than `for ... append`. Beats Java streams in readability for simple maps/filters. NEVER write `[[0]*c]*r` for 2D — same row reused." },
                    { id: "generator_expr", concept: "Generator expressions",
                        code: "# Parens, not brackets: lazy, O(1) memory\ntotal = sum(x*x for x in arr)\nany_neg = any(x < 0 for x in arr)\nall_pos = all(x > 0 for x in arr)\n\n# Generator function with yield\ndef fib():\n    a, b = 0, 1\n    while True:\n        yield a\n        a, b = b, a+b",
                        complexity: "O(N) time, O(1) mem",
                        note: "Rust iterators / Java streams are the closest analog. Use generators for streaming reductions — never materialize a huge list just to sum it." },
                    { id: "yield_from", concept: "yield from (delegation)",
                        code: "def flatten(nested):\n    for sub in nested:\n        if isinstance(sub, list):\n            yield from flatten(sub)   # delegate\n        else:\n            yield sub\n\nlist(flatten([1,[2,[3,4]],5]))  # [1,2,3,4,5]",
                        complexity: "O(N)",
                        note: "Saves the inner `for ... yield` boilerplate. Also forwards .send()/.throw()/.return for coroutines." }
                ]
            },
            {
                title: "Strings, F-strings & Bytes", icon: "ph-text-aa", color: "text-teal-400", bg: "bg-teal-400/10",
                items: [
                    { id: "string_immutable", concept: "Strings are immutable",
                        code: "# BAD: O(N^2) due to copying\ns = ''\nfor c in chars: s += c\n\n# GOOD: O(N)\ns = ''.join(chars)\n\n# StringBuilder analog\nparts = []\nfor c in chars: parts.append(c)\ns = ''.join(parts)",
                        complexity: "O(N) with join",
                        note: "Like Java `String`. Use `''.join(list)` instead of `+=` in loops. Some CPython versions optimize `s += c` but DON'T rely on it." },
                    { id: "fstring", concept: "f-strings (formatting)",
                        code: "name, n = 'ada', 3\nf'{name} x{n} = {name * n!r}'   # !r = repr()\nf'{value:>10.2f}'                # right-align, 2 decimals\nf'{value:0>4}'                   # zero-pad to 4\nf'{x=}'                          # debug: 'x=5'\nf'{x:,}'                         # 1,000,000\nf'{x:#x}'                        # 0xff hex",
                        complexity: "O(N)",
                        note: "Python 3.6+. Closest to C++20 `std::format` / Rust `format!`. `{x=}` is debug shorthand, super useful in interviews." },
                    { id: "string_ops", concept: "Common string ops",
                        code: "s.split(',')           # split on sep (or whitespace if none)\ns.split(',', 1)        # max 1 split\n'-'.join(parts)\ns.strip(); s.lstrip(); s.rstrip()\ns.startswith('ab'); s.endswith('z')\ns.replace('a','b')\ns.find('x')            # -1 if missing (no exception)\ns.index('x')           # raises ValueError if missing\ns.count('ab')          # non-overlapping count",
                        complexity: "O(N)",
                        note: "Use `find` for 'is it present', `index` only if absence is exceptional. `str.split()` with no arg splits on any whitespace AND drops empty strings — different from `split(' ')`." },
                    { id: "ascii_ord", concept: "ord / chr / char arithmetic",
                        code: "ord('a')          # 97\nchr(97)           # 'a'\nord(c) - ord('a') # 0..25 alpha index\n\n# Lowercase test\nc.isalpha(); c.isdigit(); c.isalnum(); c.islower()\ns.isnumeric()     # incl. unicode digits\n\n# Quick 26-bucket\ncnt = [0]*26\nfor c in s: cnt[ord(c)-ord('a')] += 1",
                        complexity: "O(1)",
                        note: "No `char` type — chars are length-1 strings. `ord(c)-ord('a')` is the canonical 26-array trick (Anagram, Word Pattern)." },
                    { id: "bytes_bytearray", concept: "bytes vs bytearray",
                        code: "b = b'hello'               # immutable bytes (str of bytes)\nba = bytearray(b'hello')   # MUTABLE, O(1) per-index write\nba[0] = ord('H')\n\nb.decode('utf-8')          # bytes -> str\n'hello'.encode('utf-8')    # str -> bytes\n\n# Useful for in-place char manipulation:\nbuf = bytearray(s, 'utf-8')\nbuf[i] = ord('X')\nresult = buf.decode()",
                        complexity: "O(1) index",
                        note: "Closest to C++ `std::string` / Java `byte[]`. Use `bytearray` when you need O(1) in-place character edits — `str` won't let you." }
                ]
            },
            {
                title: "Numbers & Math", icon: "ph-function", color: "text-indigo-400", bg: "bg-indigo-400/10",
                items: [
                    { id: "int_arbitrary", concept: "Arbitrary-precision int",
                        code: "x = 10**100               # fine, no overflow\nx = 1 << 60               # fine\n\n# Bit ops same as C/Java\nx & y; x | y; x ^ y; ~x; x << k; x >> k\n\n# Useful\nx.bit_count()             # popcount (3.10+)\nx.bit_length()            # ceil(log2(x+1))\nbin(13)                   # '0b1101'\nint('1101', 2)            # 13",
                        complexity: "O(1) for small, O(log) for huge",
                        note: "No `int`/`long` distinction. No overflow — unlike Java/C++ where `1<<31` overflows. Bit ops still work; use them freely in bitmask DP." },
                    { id: "div_mod", concept: "Division semantics",
                        code: "7 / 2     # 3.5     (true division — always float)\n7 // 2    # 3       (floor division)\n-7 // 2   # -4      (FLOOR, not trunc — differs from C/Java!)\n7 % 2     # 1\n-7 % 2    # 1       (sign follows divisor — differs from C/Java)\n\nimport math\nmath.trunc(-7/2)  # -3   (C/Java behavior)\ndivmod(17, 5)     # (3, 2)",
                        complexity: "O(1)",
                        note: "C/Java: `-7/2 == -3, -7%2 == -1` (trunc toward zero). Python: `-7//2 == -4, -7%2 == 1` (floor). Huge gotcha when porting C++/Java solutions." },
                    { id: "math_consts", concept: "math module essentials",
                        code: "import math\nmath.inf; math.nan\nmath.isnan(x); math.isinf(x)\nmath.gcd(12, 18)        # 6\nmath.lcm(4, 6)          # 12 (3.9+)\nmath.isqrt(10)          # 3  (integer sqrt, exact)\nmath.comb(5, 2); math.perm(5, 2)\nmath.log2(n); math.log(n, base)\nmath.floor(x); math.ceil(x)\n\nfloat('inf'); float('-inf')",
                        complexity: "O(1)",
                        note: "`math.isqrt` is the safe integer sqrt (no float error). `math.inf` works as sentinel; both `+/-` and comparisons behave correctly." },
                    { id: "rounding_decimal", concept: "Rounding & Decimal",
                        code: "round(2.5)   # 2  (banker's rounding!)\nround(3.5)   # 4\nround(2.675, 2) # 2.67 (float error)\n\nfrom decimal import Decimal, ROUND_HALF_UP\nDecimal('2.675').quantize(Decimal('0.01'),\n        rounding=ROUND_HALF_UP)  # 2.68",
                        complexity: "O(1)",
                        note: "`round` uses banker's rounding (toward even) — surprises Java devs. For financial/exact rounding, use `Decimal`." }
                ]
            },
            {
                title: "Control Flow Specials", icon: "ph-arrows-split", color: "text-rose-400", bg: "bg-rose-400/10",
                items: [
                    { id: "for_else", concept: "for/while ... else",
                        code: "# else runs ONLY if loop completes without break\nfor x in arr:\n    if x == target:\n        idx = x\n        break\nelse:\n    idx = -1     # not found",
                        complexity: "O(N)",
                        note: "Unique to Python. Reads as 'no-break clause'. Eliminates the `found = False` flag pattern from C++/Java." },
                    { id: "match_case", concept: "match / case (3.10+)",
                        code: "def handle(msg):\n    match msg:\n        case {'type': 'move', 'x': x, 'y': y}:\n            return move(x, y)\n        case [first, *rest]:\n            return first\n        case Point(x=0, y=0):\n            return 'origin'\n        case int() if msg > 0:\n            return 'pos'\n        case _:\n            return 'unknown'",
                        complexity: "O(1)",
                        note: "Structural pattern matching, closer to Rust `match` than C `switch`. Supports class patterns, guards, capture, OR patterns (`a | b`)." },
                    { id: "try_finally", concept: "try/except/else/finally",
                        code: "try:\n    val = d[key]\nexcept KeyError:\n    val = default\nexcept (TypeError, ValueError) as e:\n    log(e); raise\nelse:\n    # runs only if no exception\n    process(val)\nfinally:\n    cleanup()",
                        complexity: "O(1)",
                        note: "EAFP idiom (Easier to Ask Forgiveness than Permission) — using try/except is often more Pythonic than LBYL pre-checks. `else` runs only when try succeeded." },
                    { id: "context_with", concept: "with (context managers)",
                        code: "with open('f') as fh, open('g','w') as out:\n    out.write(fh.read())\n# RAII-ish: __exit__ called even on exception\n\n# Custom\nfrom contextlib import contextmanager\n@contextmanager\ndef timer():\n    t0 = time.perf_counter()\n    try: yield\n    finally: print(time.perf_counter()-t0)\n\nwith timer():\n    heavy()",
                        complexity: "O(1)",
                        note: "Closest analog to C++ RAII / Java try-with-resources. Multiple managers on one line. `@contextmanager` lets you write one as a generator." }
                ]
            }
        ]
    },

    datastructures: {
        id: 'datastructures',
        title: "Data Structures",
        icon: "ph-database",
        categories: [
            {
                title: "list (dynamic array, ArrayList/vector)", icon: "ph-stack", color: "text-blue-400", bg: "bg-blue-400/10",
                items: [
                    { id: "list_ops", concept: "Core list ops & complexity",
                        code: "arr = [1, 2, 3]\narr.append(4)        # O(1) amortized\narr.pop()            # O(1) — from end\narr.pop(0)           # O(N) — shifts everything! use deque\narr.insert(i, x)     # O(N)\narr.extend(other)    # O(K)\narr.remove(x)        # O(N) — first match by value, ValueError if absent\ndel arr[i]           # O(N)\narr.reverse()        # O(N) in-place\nx in arr             # O(N) linear scan\narr.index(x)         # O(N), raises if absent\narr.count(x)         # O(N)",
                        complexity: "see code",
                        note: "Exactly C++ `std::vector` / Java `ArrayList`. NEVER use as a queue — `pop(0)` is O(N). For LIFO it's perfect (use append/pop)." },
                    { id: "list_slice", concept: "Slicing semantics",
                        code: "arr[a:b]       # O(b-a) — NEW list\narr[a:b:s]     # step s\narr[::-1]      # reversed copy\narr[:]         # shallow copy\n\n# Assign to slice (in-place)\narr[1:3] = [10, 20, 30]   # replaces 2 with 3\narr[::2] = [9, 9, 9]      # must match length\n\n# Slice does NOT raise on out-of-range\narr[100:200]   # [] not IndexError",
                        complexity: "O(k)",
                        note: "Slices always copy. Use carefully in tight loops. For zero-copy view, use a `memoryview` on bytes/bytearray, or pass indices instead." },
                    { id: "list_sort", concept: "sort / sorted / key",
                        code: "arr.sort()                       # in-place, O(N log N), stable (TimSort)\nsorted(iterable)                 # new list\narr.sort(reverse=True)\narr.sort(key=lambda x: (x[1], -x[0]))  # multi-key, secondary descending\n\nfrom functools import cmp_to_key\narr.sort(key=cmp_to_key(lambda a,b: a-b))\n\n# Stable sort — equal elements keep relative order\n# Useful: sort by primary, then by secondary\narr.sort(key=lambda x: x.age)\narr.sort(key=lambda x: x.name)   # final order = name asc, age asc within",
                        complexity: "O(N log N)",
                        note: "TimSort is stable — exploit that. Python lost `cmp` arg in 3.x; use `key=` or wrap with `cmp_to_key`. Multi-key sort via tuples is cleaner than comparators." },
                    { id: "list_2d", concept: "2D arrays / matrices",
                        code: "rows, cols = 3, 4\ngrid = [[0]*cols for _ in range(rows)]   # CORRECT\n\n# WRONG — all rows alias the same list\nbad = [[0]*cols]*rows\nbad[0][0] = 1            # bad == [[1,...],[1,...],[1,...]]\n\nfor r in range(rows):\n    for c in range(cols):\n        grid[r][c] = ...\n\n# Transpose\nT = list(zip(*grid))     # tuples — wrap rows in list if needed",
                        complexity: "O(R*C)",
                        note: "The `[[0]*c]*r` trap catches everyone the first time. `zip(*matrix)` for transpose is the most Pythonic move." }
                ]
            },
            {
                title: "dict & set (hash map / hash set)", icon: "ph-hash", color: "text-violet-400", bg: "bg-violet-400/10",
                items: [
                    { id: "dict_basics", concept: "dict basics",
                        code: "d = {}\nd[k] = v\nv = d[k]              # KeyError if missing\nv = d.get(k)          # None if missing\nv = d.get(k, default)\nv = d.setdefault(k, [])   # get-or-set\nd.pop(k, default)\nfor k in d: ...\nfor k, v in d.items(): ...\nfor v in d.values(): ...\nk in d                # O(1) avg",
                        complexity: "O(1) avg",
                        note: "Java `HashMap` / C++ `unordered_map`. Insertion-ordered since 3.7 (NOT sorted). Key must be hashable (immutable). Tuples ok, lists are not." },
                    { id: "defaultdict", concept: "collections.defaultdict",
                        code: "from collections import defaultdict\nadj = defaultdict(list)\nadj[u].append(v)         # no KeyError, auto-creates []\n\ngroups = defaultdict(set)\nfreq   = defaultdict(int)\nfor c in s: freq[c] += 1\n\n# Gotcha: reading auto-inserts\nx = adj[999]   # creates adj[999] = []\n# Use `if 999 in adj` to test without insert",
                        complexity: "O(1)",
                        note: "Removes the `if k not in d: d[k] = []` boilerplate. Trap: accessing a missing key INSERTS the default. Use `in` to test." },
                    { id: "counter", concept: "collections.Counter",
                        code: "from collections import Counter\nc = Counter('mississippi')\n# Counter({'i':4,'s':4,'p':2,'m':1})\nc.most_common(2)         # [('i',4),('s',4)]\nc['z']                   # 0 (no KeyError)\n\nc1 + c2; c1 - c2         # multiset add/sub (drops <=0)\nc1 & c2; c1 | c2         # min / max per key\n\n# Anagram check\nCounter(a) == Counter(b)",
                        complexity: "O(N)",
                        note: "Multiset. `most_common(k)` uses a heap internally → O(N log k). One-liner anagram check beats any C++/Java equivalent." },
                    { id: "ordereddict", concept: "OrderedDict",
                        code: "from collections import OrderedDict\nod = OrderedDict()\nod['a'] = 1; od['b'] = 2\nod.move_to_end('a')              # to back\nod.move_to_end('a', last=False)  # to front\nk, v = od.popitem(last=False)    # FIFO pop\nk, v = od.popitem(last=True)     # LIFO pop",
                        complexity: "O(1)",
                        note: "Regular `dict` keeps insertion order, but `OrderedDict` adds `move_to_end` / `popitem(last=)` — the building blocks for LRU." },
                    { id: "set_ops", concept: "set / frozenset",
                        code: "s = set([1,2,3]); s = {1,2,3}\nempty = set()           # NOT {} — that's a dict!\ns.add(x); s.discard(x); s.remove(x)  # remove raises\nx in s                  # O(1)\n\na | b   # union     a.union(b)\na & b   # intersect a.intersection(b)\na - b   # difference\na ^ b   # symmetric diff\na <= b  # subset\nfrozenset([1,2])        # hashable -> can be dict key / set element",
                        complexity: "O(1) per op",
                        note: "C++ `unordered_set` / Java `HashSet`. `{}` is an empty dict — common typo. `frozenset` when you need a set as a dict key or set element." }
                ]
            },
            {
                title: "deque, heapq & PQ", icon: "ph-queue", color: "text-purple-400", bg: "bg-purple-400/10",
                items: [
                    { id: "deque", concept: "collections.deque (double-ended queue)",
                        code: "from collections import deque\nq = deque([1,2,3])\nq.append(4)        # right, O(1)\nq.appendleft(0)    # left,  O(1)\nq.pop()            # right, O(1)\nq.popleft()        # left,  O(1)\nq[0]; q[-1]        # peek O(1)\nq.rotate(2)        # right by 2\nq.extendleft([1,2,3])  # !!! reverses input\n\n# Bounded — auto-evicts from other end\nwindow = deque(maxlen=k)",
                        complexity: "O(1) ends",
                        note: "Java `ArrayDeque` / `LinkedList`. Use for BFS queue and sliding-window-of-indices. `maxlen` is a cheap fixed-size ring buffer." },
                    { id: "heapq", concept: "heapq (binary min-heap)",
                        code: "import heapq\nh = []\nheapq.heappush(h, 5)\nheapq.heappush(h, (priority, item))   # tuples ordered lex\nx = heapq.heappop(h)                  # min\nheapq.heappushpop(h, x)               # push then pop, single op\nheapq.heapreplace(h, x)               # pop then push\nh[0]                                  # peek min\nheapq.heapify(arr)                    # in-place O(N)\nheapq.nlargest(k, iterable)           # O(N log k)\nheapq.nsmallest(k, iterable)\nheapq.merge(*sorted_iters)            # k-way merge",
                        complexity: "O(log N) push/pop",
                        note: "Min-heap only. For max-heap: push `-x` or `(-priority, item)`. For tie-break add a counter `(priority, counter, item)` to avoid comparing items." },
                    { id: "max_heap", concept: "Max-heap pattern",
                        code: "import heapq\nimport itertools\ncounter = itertools.count()\nh = []\n\ndef push(pri, item):\n    # Negate priority, use counter for stable tie-break\n    heapq.heappush(h, (-pri, next(counter), item))\n\ndef pop():\n    pri, _, item = heapq.heappop(h)\n    return -pri, item\n\n# Top-K LARGEST with bounded min-heap (O(N log K))\ndef top_k(nums, k):\n    h = []\n    for x in nums:\n        heapq.heappush(h, x)\n        if len(h) > k:\n            heapq.heappop(h)\n    return h   # smallest of top-K at h[0]",
                        complexity: "O(N log K)",
                        note: "Java `PriorityQueue<>(Comparator.reverseOrder())` ≈ negate trick. Top-K largest with a bounded MIN-heap is the standard interview pattern." },
                    { id: "queue_module", concept: "queue module (thread-safe)",
                        code: "from queue import Queue, LifoQueue, PriorityQueue\nq = Queue(maxsize=0)\nq.put(x); q.get()      # BLOCKING\nq.put_nowait(x); q.get_nowait()\nq.task_done(); q.join()\n\n# Single-threaded code? Use deque / list / heapq.\n# queue.* is for producer-consumer across threads.",
                        complexity: "O(1)",
                        note: "Thread-safe wrappers around deque/heap. Slower than `deque` due to locks — don't use for plain algorithmic queues." }
                ]
            },
            {
                title: "bisect (sorted container ops)", icon: "ph-magnifying-glass-plus", color: "text-amber-400", bg: "bg-amber-400/10",
                items: [
                    { id: "bisect_basics", concept: "bisect — binary search & insertion",
                        code: "import bisect\narr = [1, 3, 4, 4, 4, 7, 9]\n\nbisect.bisect_left(arr, 4)    # 2  (lower_bound)\nbisect.bisect_right(arr, 4)   # 5  (upper_bound)\nbisect.bisect(arr, 4)         # alias for bisect_right\n\nbisect.insort(arr, 5)         # insert keeping sorted, O(N) (shift)\nbisect.insort_left(arr, 5)\n\n# Count occurrences of x in sorted arr\nlo = bisect.bisect_left(arr, x)\nhi = bisect.bisect_right(arr, x)\ncount = hi - lo\n\n# Find first >= target\nidx = bisect.bisect_left(arr, target)\nif idx < len(arr) and arr[idx] == target: ...",
                        complexity: "O(log N) search, O(N) insort",
                        note: "C++ `std::lower_bound` / `std::upper_bound`. `insort` is O(N) because it shifts — sorted ADD operations are not O(log N) like Java's `TreeMap`." },
                    { id: "no_treemap", concept: "Python has NO TreeMap/std::map",
                        code: "# Need ordered map / multiset?\n# 1) SortedList from third-party 'sortedcontainers' (often pre-installed on LC)\nfrom sortedcontainers import SortedList, SortedDict\nsl = SortedList()\nsl.add(x); sl.remove(x)        # O(log N)\nsl[0]; sl[-1]                  # O(log N)\nsl.bisect_left(x)\n\n# 2) Roll your own with heapq + lazy deletion\n# 3) Roll your own with bisect on a sorted list (O(N) insert)",
                        complexity: "O(log N) with SortedList",
                        note: "Major gap vs Java/C++. On LeetCode `sortedcontainers` is available. In interviews, mention it explicitly — many interviewers allow it." }
                ]
            },
            {
                title: "Custom: stack, linked list, graph", icon: "ph-graph", color: "text-cyan-400", bg: "bg-cyan-400/10",
                items: [
                    { id: "stack_as_list", concept: "Stack = list",
                        code: "stk = []\nstk.append(x)   # push, O(1) amortized\nstk.pop()       # pop,  O(1)\nstk[-1]         # peek, O(1)\nif not stk: ... # empty test",
                        complexity: "O(1)",
                        note: "No dedicated Stack class needed. C++ `std::stack` and Java `Deque<>().push()` are unnecessary ceremony here." },
                    { id: "linked_list", concept: "Linked list node",
                        code: "class ListNode:\n    def __init__(self, val=0, nxt=None):\n        self.val = val\n        self.next = nxt\n\n# Dummy-head pattern (essential for most LC linked-list problems)\ndummy = ListNode(0, head)\nprev = dummy\nwhile prev.next:\n    if cond: prev.next = prev.next.next\n    else:    prev = prev.next\nreturn dummy.next",
                        complexity: "O(N)",
                        note: "Dummy head eliminates 'is this the head?' branches. Same pattern as in C/Java but with no malloc/free thinking — GC handles it." },
                    { id: "graph_adj", concept: "Graph as adjacency",
                        code: "from collections import defaultdict\n\n# Unweighted\nadj = defaultdict(list)\nfor u, v in edges:\n    adj[u].append(v)\n    adj[v].append(u)   # undirected\n\n# Weighted\nadj_w = defaultdict(list)\nfor u, v, w in edges:\n    adj_w[u].append((v, w))\n\n# Grid as implicit graph — neighbor offsets\nDIRS = [(-1,0),(1,0),(0,-1),(0,1)]\nfor dr, dc in DIRS:\n    nr, nc = r+dr, c+dc\n    if 0 <= nr < R and 0 <= nc < C: ...",
                        complexity: "O(V+E) traversal",
                        note: "`defaultdict(list)` is the canonical graph builder. Always factor out the 4-direction tuple — both clearer and slightly faster." }
                ]
            },
            {
                title: "Hashing & immutability", icon: "ph-fingerprint", color: "text-fuchsia-400", bg: "bg-fuchsia-400/10",
                items: [
                    { id: "hashable", concept: "Hashable rules",
                        code: "# Hashable = immutable & implements __hash__\n# Built-in immutable: int, float, str, bytes, tuple (of hashables), frozenset, None\n# NOT hashable: list, dict, set, bytearray\n\nd = {}\nd[(1, 2)] = 'ok'          # tuple key — ok\nd[frozenset([1,2])] = 'ok'\n# d[[1,2]] = 'x'          # TypeError: unhashable\n\n# Custom class\nclass Point:\n    __slots__ = ('x','y')\n    def __init__(self, x, y): self.x, self.y = x, y\n    def __eq__(self, o): return (self.x, self.y) == (o.x, o.y)\n    def __hash__(self): return hash((self.x, self.y))",
                        complexity: "O(1) hash",
                        note: "Java: override BOTH `equals` and `hashCode`. Python: override BOTH `__eq__` and `__hash__`. Defining only `__eq__` makes the class unhashable (sets `__hash__=None`)." },
                    { id: "tuple_as_state", concept: "Tuple as memo key",
                        code: "from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef dp(i, j, mask):\n    # All args must be hashable\n    if base: return ...\n    return min(dp(i+1, j, mask | 1<<x), ...)\n\n# Manual memo\nmemo = {}\ndef solve(state):\n    if state in memo: return memo[state]\n    ...\n    memo[state] = ans\n    return ans",
                        complexity: "depends on states",
                        note: "Convert list state to tuple for hashing: `tuple(arr)`. Convert grid: `tuple(map(tuple, grid))`. Lists/dicts can't be memo keys." }
                ]
            }
        ]
    },

    stdlib: {
        id: 'stdlib',
        title: "Stdlib Power Tools",
        icon: "ph-toolbox",
        categories: [
            {
                title: "itertools — iterator algebra", icon: "ph-infinity", color: "text-emerald-400", bg: "bg-emerald-400/10",
                items: [
                    { id: "itertools_infinite", concept: "Infinite & combinators",
                        code: "from itertools import count, cycle, repeat\nfor i in count(10, 2):     # 10, 12, 14, ...\n    if i > 20: break\nfor x in cycle('ABC'): ...  # A,B,C,A,B,C,...\nlist(repeat('x', 3))        # ['x','x','x']\n\n# Counter for stable tie-break in heap\nimport itertools\nuid = itertools.count()\nheappush(h, (-pri, next(uid), item))",
                        complexity: "O(1) per next",
                        note: "Like Rust iterator adapters but more chained. `count()` is the canonical 'unique id source' for heap tie-breaking." },
                    { id: "itertools_combinator", concept: "combinations / permutations / product",
                        code: "from itertools import permutations, combinations, product, combinations_with_replacement\n\nlist(permutations([1,2,3]))           # 3! = 6 tuples\nlist(permutations([1,2,3], 2))         # P(3,2) = 6\nlist(combinations([1,2,3,4], 2))       # C(4,2) = 6\nlist(combinations_with_replacement([1,2,3], 2))\nlist(product([0,1], repeat=3))         # 2^3 = 8 bitstrings\nlist(product('AB','12'))               # cartesian product",
                        complexity: "O(output size)",
                        note: "Brute-force subsets/perms in one line — perfect for small-N interview problems. `product(..., repeat=k)` is the cartesian-power for bitmask enumeration." },
                    { id: "itertools_chain", concept: "chain / groupby / accumulate / pairwise",
                        code: "from itertools import chain, groupby, accumulate, pairwise, islice, takewhile, dropwhile\n\nlist(chain([1,2],[3,4],[5]))      # [1,2,3,4,5]\nlist(chain.from_iterable(matrix)) # flatten 1 level\n\n# groupby on CONSECUTIVE equals (sort first if you want all-equal)\nfor k, grp in groupby('aaabbc'):\n    print(k, list(grp))            # a [a,a,a], b [b,b], c [c]\n\nlist(accumulate([1,2,3,4]))         # [1,3,6,10] prefix sum\nlist(accumulate([1,2,3], max))      # running max\nlist(pairwise([1,2,3,4]))           # (1,2),(2,3),(3,4)  (3.10+)\n\nlist(islice(stream, 0, 10, 2))      # lazy slice on any iterable\nlist(takewhile(lambda x: x<5, [1,3,5,1]))  # [1,3]",
                        complexity: "O(N)",
                        note: "`accumulate(..., op)` does prefix-fold — great for prefix max/min/xor. `groupby` only groups CONSECUTIVE keys (classic interview trap)." }
                ]
            },
            {
                title: "functools — caching & functional", icon: "ph-arrows-clockwise", color: "text-rose-400", bg: "bg-rose-400/10",
                items: [
                    { id: "lru_cache", concept: "@lru_cache / @cache",
                        code: "from functools import lru_cache, cache\n\n@cache                       # 3.9+, unbounded\ndef fib(n):\n    return n if n < 2 else fib(n-1) + fib(n-2)\n\n@lru_cache(maxsize=10_000)\ndef dp(i, mask):\n    ...\n\ndp.cache_clear()             # reset between test cases\ndp.cache_info()              # hits/misses\n\n# Trap: args must be hashable. Convert lists -> tuples first.",
                        complexity: "O(states) total",
                        note: "Turn any recursion into top-down DP for free. Always `cache_clear()` between test cases on LeetCode — caches persist across runs." },
                    { id: "reduce_partial", concept: "reduce / partial / cmp_to_key",
                        code: "from functools import reduce, partial, cmp_to_key\n\n# fold left\nreduce(lambda a,b: a*b, [1,2,3,4], 1)   # 24\nreduce(operator.xor, nums, 0)            # XOR all\n\n# partial application — like std::bind / closure with bound args\nadd5 = partial(lambda x,y: x+y, 5)\nadd5(10)   # 15\n\n# Custom comparator (sort lost cmp= in 3.x)\narr.sort(key=cmp_to_key(lambda a,b: a-b))",
                        complexity: "O(N)",
                        note: "`reduce` ≈ Java `Stream.reduce`, Rust `fold`. Prefer `sum/min/max/any/all` when they apply — they're faster than `reduce`." }
                ]
            },
            {
                title: "collections (other)", icon: "ph-package", color: "text-yellow-400", bg: "bg-yellow-400/10",
                items: [
                    { id: "namedtuple", concept: "namedtuple / NamedTuple",
                        code: "from collections import namedtuple\nPoint = namedtuple('Point', ['x','y'])\np = Point(3, 4)\np.x, p.y\np[0], p[1]            # also indexable\np._replace(x=5)        # immutable, returns NEW\np._asdict()\n\n# Modern typed form\nfrom typing import NamedTuple\nclass Edge(NamedTuple):\n    u: int\n    v: int\n    w: float = 1.0",
                        complexity: "O(1)",
                        note: "Tiny immutable records. Use for structured tuples in heaps, graph edges, return values. Way lighter than a full class for hot paths." },
                    { id: "chainmap", concept: "ChainMap (scope-like lookup)",
                        code: "from collections import ChainMap\nlocal  = {'a': 1}\nglobal_ = {'a': 99, 'b': 2}\ncm = ChainMap(local, global_)\ncm['a']    # 1   (first match wins)\ncm['b']    # 2   (fallback)\ncm.new_child({'c': 3})   # push a scope",
                        complexity: "O(K) lookup, K = maps",
                        note: "Layered dict lookup, useful for config overrides or modeling lexical scopes during interpreters/compilers questions." }
                ]
            },
            {
                title: "Other indispensable modules", icon: "ph-circles-three-plus", color: "text-cyan-400", bg: "bg-cyan-400/10",
                items: [
                    { id: "string_module", concept: "string constants",
                        code: "import string\nstring.ascii_lowercase  # 'abc...xyz'\nstring.ascii_uppercase\nstring.ascii_letters\nstring.digits           # '0123456789'\nstring.hexdigits\nstring.punctuation\nstring.whitespace",
                        complexity: "O(1)",
                        note: "Avoid hand-typing alphabets. `string.ascii_lowercase` is what you want 95% of the time." },
                    { id: "re_module", concept: "re — regex",
                        code: "import re\nre.search(r'\\d+', s)        # first match or None\nre.match(r'^\\d+', s)        # anchored to start\nre.findall(r'\\w+', s)       # all non-overlapping as list\nre.finditer(r'\\w+', s)      # iterator of Match objs\nre.sub(r'\\s+', ' ', s)      # replace\nre.split(r'[ ,;]+', s)\n\npat = re.compile(r'(\\d+)-(\\d+)')\nm = pat.search('range 10-20')\nm.group(0); m.group(1); m.groups()",
                        complexity: "O(N) typical",
                        note: "Always use raw strings `r'...'`. `re.compile` once if reused. Catastrophic backtracking is real — keep patterns simple in interviews." },
                    { id: "operator_module", concept: "operator — as functions",
                        code: "import operator as op\nop.add(1,2); op.mul(2,3); op.xor(5,3)\nop.itemgetter(1)        # f(seq) = seq[1]\nop.itemgetter(0,2)      # f(seq) = (seq[0], seq[2])\nop.attrgetter('name')\n\nmax(students, key=op.attrgetter('grade'))\nsorted(pairs, key=op.itemgetter(1))",
                        complexity: "O(1)",
                        note: "Slightly faster than equivalent lambdas (no Python frame). Cleaner for sort/min/max keys when you just want a field." },
                    { id: "random_module", concept: "random",
                        code: "import random\nrandom.seed(42)\nrandom.random()             # [0,1)\nrandom.uniform(a, b)\nrandom.randint(a, b)        # INCLUSIVE both ends\nrandom.randrange(start,stop,step)\nrandom.choice(seq)\nrandom.choices(seq, k=10, weights=[...])  # with replacement\nrandom.sample(seq, k=10)     # without replacement\nrandom.shuffle(arr)           # in-place",
                        complexity: "O(1)/O(k)",
                        note: "Java `Random.nextInt(b)` is `[0,b)`, Python `randint(a,b)` is `[a,b]` — different! Use `randrange` for half-open." },
                    { id: "typing_module", concept: "typing — hints",
                        code: "from typing import List, Dict, Set, Tuple, Optional, Union, Callable, Iterable, Iterator\n\ndef solve(nums: List[int], k: int) -> List[List[int]]: ...\ndef parse(s: str) -> Optional[int]: ...\nf: Callable[[int, int], int] = lambda a,b: a+b\n\n# 3.9+: use built-ins directly\ndef solve(nums: list[int]) -> dict[str, int]: ...\n# 3.10+: X | Y instead of Union; T | None instead of Optional[T]",
                        complexity: "N/A (runtime no-op)",
                        note: "Hints are documentation + IDE help; NOT enforced at runtime. In interviews, type hints communicate intent — interviewers love them." },
                    { id: "dataclass", concept: "@dataclass",
                        code: "from dataclasses import dataclass, field\n\n@dataclass(slots=True, frozen=False, order=True)\nclass Item:\n    priority: int\n    name: str = 'unknown'\n    tags: list[str] = field(default_factory=list)  # no mutable default!\n\na = Item(1, 'x'); b = Item(2, 'y')\na < b           # order=True gives lex compare\n# slots=True saves memory + faster attr access (C++-struct-ish)",
                        complexity: "O(1)",
                        note: "Java `record` / Kotlin `data class` analog. `slots=True` is a free perf win and removes `__dict__`. `order=True` auto-derives `<`,`<=`, etc." }
                ]
            }
        ]
    },

    templates: {
        id: 'templates',
        title: "Algorithm Templates",
        icon: "ph-blueprint",
        categories: [
            {
                title: "Binary Search", icon: "ph-magnifying-glass", color: "text-amber-400", bg: "bg-amber-400/10",
                layout: "full",
                items: [
                    { id: "bs_classic", concept: "Classic binary search",
                        complexity: "O(log N)",
                        note: "Use `lo + (hi - lo) // 2` only matters in C/Java to avoid overflow — Python ints are arbitrary precision so `(lo+hi)//2` is fine.",
                        code: "def binary_search(arr, target):\n    lo, hi = 0, len(arr) - 1     # inclusive [lo, hi]\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1" },
                    { id: "bs_lower_bound", concept: "Lower bound / first true (template)",
                        complexity: "O(log N)",
                        note: "The 'find smallest x with f(x) True' template. Works for `bisect_left`-style searches AND parametric search (binary search on answer).",
                        code: "def lower_bound(arr, target):\n    lo, hi = 0, len(arr)        # half-open [lo, hi)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if arr[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid\n    return lo                    # first idx with arr[idx] >= target\n\n# Same skeleton, different predicate — 'binary search on answer'\ndef min_capacity(weights, days):\n    def feasible(cap):\n        d, cur = 1, 0\n        for w in weights:\n            if cur + w > cap:\n                d += 1; cur = 0\n            cur += w\n        return d <= days\n    lo, hi = max(weights), sum(weights)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if feasible(mid): hi = mid\n        else:             lo = mid + 1\n    return lo" }
                ]
            },
            {
                title: "Two Pointers / Sliding Window", icon: "ph-arrows-out-line-horizontal", color: "text-cyan-400", bg: "bg-cyan-400/10",
                layout: "full",
                items: [
                    { id: "two_ptr", concept: "Two pointers (sorted array)",
                        complexity: "O(N)",
                        note: "Use when array is sorted and you want a pair satisfying a condition. Classic: 2Sum sorted, container with most water.",
                        code: "def two_sum_sorted(arr, target):\n    l, r = 0, len(arr) - 1\n    while l < r:\n        s = arr[l] + arr[r]\n        if s == target:\n            return (l, r)\n        elif s < target:\n            l += 1\n        else:\n            r -= 1\n    return None" },
                    { id: "sliding_window_variable", concept: "Variable-size sliding window",
                        complexity: "O(N)",
                        note: "Expand right; while invariant breaks, shrink left. Tracks the longest/shortest window with some property. Requires monotone shrinking — careful with negatives.",
                        code: "def longest_no_repeat(s):\n    last = {}                   # char -> last index\n    left = 0\n    best = 0\n    for right, c in enumerate(s):\n        if c in last and last[c] >= left:\n            left = last[c] + 1\n        last[c] = right\n        best = max(best, right - left + 1)\n    return best" },
                    { id: "sliding_window_fixed", concept: "Fixed-size window",
                        complexity: "O(N)",
                        note: "Roll sum/freq map by adding the new right and subtracting the old left at each step.",
                        code: "def max_avg(nums, k):\n    s = sum(nums[:k])\n    best = s\n    for i in range(k, len(nums)):\n        s += nums[i] - nums[i-k]\n        best = max(best, s)\n    return best / k" }
                ]
            },
            {
                title: "Prefix Sum / Difference Array", icon: "ph-sigma", color: "text-indigo-400", bg: "bg-indigo-400/10",
                layout: "full",
                items: [
                    { id: "prefix_sum", concept: "Prefix sum (1D & 2D)",
                        complexity: "O(N) build, O(1) range query",
                        note: "Off-by-one is the only hard part. The `pref[i] = sum of arr[0..i-1]` convention makes `arr[l..r]` = `pref[r+1] - pref[l]` clean.",
                        code: "from itertools import accumulate\n\n# 1D\npref = [0] + list(accumulate(arr))\nrange_sum = pref[r+1] - pref[l]    # inclusive arr[l..r]\n\n# 2D\nR, C = len(grid), len(grid[0])\npref = [[0]*(C+1) for _ in range(R+1)]\nfor r in range(R):\n    for c in range(C):\n        pref[r+1][c+1] = (grid[r][c]\n            + pref[r][c+1] + pref[r+1][c] - pref[r][c])\n# sum of submatrix [r1..r2][c1..c2]\nrect = (pref[r2+1][c2+1] - pref[r1][c2+1]\n        - pref[r2+1][c1] + pref[r1][c1])" },
                    { id: "prefix_hash_subarray", concept: "Prefix-sum + hash (subarray sum = K)",
                        complexity: "O(N)",
                        note: "Counts subarrays with sum K. Same template solves 'divisible by K' (key by `prefix % K`) and 'longest with sum K' (store first index, not count).",
                        code: "def subarray_sum_eq_k(nums, k):\n    count = 0\n    cur = 0\n    seen = {0: 1}              # prefix sum -> freq\n    for x in nums:\n        cur += x\n        count += seen.get(cur - k, 0)\n        seen[cur] = seen.get(cur, 0) + 1\n    return count" }
                ]
            },
            {
                title: "BFS / DFS", icon: "ph-tree-structure", color: "text-purple-400", bg: "bg-purple-400/10",
                layout: "full",
                items: [
                    { id: "bfs_grid", concept: "BFS — shortest path on unweighted graph/grid",
                        complexity: "O(V+E)",
                        note: "Mark visited at ENQUEUE time, not dequeue, or you'll enqueue duplicates and blow memory.",
                        code: "from collections import deque\n\ndef bfs_grid(grid, src, dst):\n    R, C = len(grid), len(grid[0])\n    DIRS = [(-1,0),(1,0),(0,-1),(0,1)]\n    q = deque([(src, 0)])\n    seen = {src}\n    while q:\n        (r,c), d = q.popleft()\n        if (r,c) == dst:\n            return d\n        for dr, dc in DIRS:\n            nr, nc = r+dr, c+dc\n            if (0 <= nr < R and 0 <= nc < C\n                and grid[nr][nc] != '#'\n                and (nr,nc) not in seen):\n                seen.add((nr,nc))\n                q.append(((nr,nc), d+1))\n    return -1" },
                    { id: "dfs_iterative", concept: "DFS — iterative & recursive",
                        complexity: "O(V+E)",
                        note: "Python default recursion limit is 1000. For deep recursion, either `sys.setrecursionlimit(10**6)` or switch to iterative with an explicit stack.",
                        code: "import sys\nsys.setrecursionlimit(10**6)\n\ndef dfs(node, adj, seen):\n    seen.add(node)\n    for nxt in adj[node]:\n        if nxt not in seen:\n            dfs(nxt, adj, seen)\n\n# Iterative version — needed for very deep graphs\ndef dfs_iter(src, adj):\n    seen = set([src])\n    stk = [src]\n    while stk:\n        u = stk.pop()\n        for v in adj[u]:\n            if v not in seen:\n                seen.add(v)\n                stk.append(v)" },
                    { id: "backtrack", concept: "DFS backtracking template",
                        complexity: "depends on branching",
                        note: "Always undo the choice after recursing. Pass `path` mutably and pop, or pass `path + [x]` immutably (slower but harder to bug).",
                        code: "def permutations(nums):\n    res, path, used = [], [], [False]*len(nums)\n    def back():\n        if len(path) == len(nums):\n            res.append(path[:])\n            return\n        for i, v in enumerate(nums):\n            if used[i]: continue\n            used[i] = True\n            path.append(v)\n            back()\n            path.pop()         # UNDO\n            used[i] = False\n    back()\n    return res" }
                ]
            },
            {
                title: "Dijkstra / Topo / Union-Find", icon: "ph-graph", color: "text-yellow-400", bg: "bg-yellow-400/10",
                layout: "full",
                items: [
                    { id: "dijkstra", concept: "Dijkstra (non-negative weights)",
                        complexity: "O((V+E) log V)",
                        note: "Standard 'skip stale entries' trick: lazy decrease-key. Don't try to update entries in the heap — just push a new one and skip outdated ones.",
                        code: "import heapq\nfrom collections import defaultdict\n\ndef dijkstra(adj, src, n):\n    dist = [float('inf')] * n\n    dist[src] = 0\n    h = [(0, src)]\n    while h:\n        d, u = heapq.heappop(h)\n        if d > dist[u]:        # stale\n            continue\n        for v, w in adj[u]:\n            nd = d + w\n            if nd < dist[v]:\n                dist[v] = nd\n                heapq.heappush(h, (nd, v))\n    return dist" },
                    { id: "topo_sort", concept: "Topological sort (Kahn's)",
                        complexity: "O(V+E)",
                        note: "If `len(order) != n`, the graph has a cycle. Great for course-schedule / build-order questions.",
                        code: "from collections import deque, defaultdict\n\ndef topo_sort(n, edges):\n    adj = defaultdict(list)\n    indeg = [0] * n\n    for u, v in edges:\n        adj[u].append(v)\n        indeg[v] += 1\n    q = deque(i for i in range(n) if indeg[i] == 0)\n    order = []\n    while q:\n        u = q.popleft()\n        order.append(u)\n        for v in adj[u]:\n            indeg[v] -= 1\n            if indeg[v] == 0:\n                q.append(v)\n    return order if len(order) == n else []  # [] means cycle" },
                    { id: "union_find", concept: "Union-Find (DSU) with path compression",
                        complexity: "near O(1) per op (inverse Ackermann)",
                        note: "Union by RANK + path compression gives ~O(α(N)). Always test components count by counting unique `find(i)`.",
                        code: "class DSU:\n    def __init__(self, n):\n        self.parent = list(range(n))\n        self.rank   = [0] * n\n        self.count  = n   # connected components\n    def find(self, x):\n        while self.parent[x] != x:\n            self.parent[x] = self.parent[self.parent[x]]  # halving\n            x = self.parent[x]\n        return x\n    def union(self, a, b):\n        ra, rb = self.find(a), self.find(b)\n        if ra == rb: return False\n        if self.rank[ra] < self.rank[rb]: ra, rb = rb, ra\n        self.parent[rb] = ra\n        if self.rank[ra] == self.rank[rb]: self.rank[ra] += 1\n        self.count -= 1\n        return True" }
                ]
            },
            {
                title: "Dynamic Programming", icon: "ph-grid-four", color: "text-pink-400", bg: "bg-pink-400/10",
                layout: "full",
                items: [
                    { id: "dp_topdown", concept: "Top-down (memoized recursion)",
                        complexity: "O(states × transition)",
                        note: "Quickest to write under time pressure. Convert to bottom-up later if you need to shave the recursion overhead or roll a dimension.",
                        code: "from functools import cache\n\ndef coin_change(coins, amount):\n    @cache\n    def dp(rem):\n        if rem == 0: return 0\n        if rem < 0:  return float('inf')\n        return 1 + min(dp(rem - c) for c in coins)\n    ans = dp(amount)\n    dp.cache_clear()           # important on LC!\n    return ans if ans != float('inf') else -1" },
                    { id: "dp_knapsack", concept: "0/1 Knapsack (rolled 1D)",
                        complexity: "O(N × W)",
                        note: "Iterating W in REVERSE prevents reusing an item. For unbounded knapsack, iterate W FORWARD.",
                        code: "def knapsack(weights, values, W):\n    dp = [0] * (W + 1)\n    for w, v in zip(weights, values):\n        for cap in range(W, w - 1, -1):   # reverse!\n            dp[cap] = max(dp[cap], dp[cap - w] + v)\n    return dp[W]" },
                    { id: "dp_lis", concept: "LIS — patience sort (N log N)",
                        complexity: "O(N log N)",
                        note: "`tails[i]` is the smallest tail among all increasing subsequences of length i+1. `bisect_left` gives strict-increasing; `bisect_right` gives non-decreasing.",
                        code: "from bisect import bisect_left\n\ndef length_of_LIS(nums):\n    tails = []\n    for x in nums:\n        i = bisect_left(tails, x)\n        if i == len(tails):\n            tails.append(x)\n        else:\n            tails[i] = x\n    return len(tails)" },
                    { id: "dp_edit_distance", concept: "Edit distance (2D bottom-up)",
                        complexity: "O(M × N)",
                        note: "Classic 2D table. Can roll to two rows of O(min(M,N)) memory but interviewers rarely require it.",
                        code: "def edit_distance(a, b):\n    m, n = len(a), len(b)\n    dp = [[0]*(n+1) for _ in range(m+1)]\n    for i in range(m+1): dp[i][0] = i\n    for j in range(n+1): dp[0][j] = j\n    for i in range(1, m+1):\n        for j in range(1, n+1):\n            if a[i-1] == b[j-1]:\n                dp[i][j] = dp[i-1][j-1]\n            else:\n                dp[i][j] = 1 + min(dp[i-1][j],    # delete\n                                   dp[i][j-1],    # insert\n                                   dp[i-1][j-1])  # replace\n    return dp[m][n]" }
                ]
            },
            {
                title: "Stack / Monotonic / Intervals", icon: "ph-stack-overflow-logo", color: "text-orange-400", bg: "bg-orange-400/10",
                layout: "full",
                items: [
                    { id: "mono_stack", concept: "Monotonic stack (next greater/smaller)",
                        complexity: "O(N) amortized",
                        note: "Each element is pushed and popped at most once. Use indices, not values, so you can compute distances.",
                        code: "def next_greater(nums):\n    n = len(nums)\n    res = [-1] * n\n    stk = []                 # indices, decreasing nums values\n    for i, x in enumerate(nums):\n        while stk and nums[stk[-1]] < x:\n            res[stk.pop()] = x\n        stk.append(i)\n    return res" },
                    { id: "mono_deque", concept: "Monotonic deque (sliding window max)",
                        complexity: "O(N)",
                        note: "Deque holds indices; front is always the current window max. Pop expired indices from the front and smaller ones from the back.",
                        code: "from collections import deque\n\ndef max_sliding_window(nums, k):\n    dq = deque()             # indices, values decreasing\n    res = []\n    for i, x in enumerate(nums):\n        while dq and dq[0] <= i - k:\n            dq.popleft()      # drop expired\n        while dq and nums[dq[-1]] < x:\n            dq.pop()          # drop smaller\n        dq.append(i)\n        if i >= k - 1:\n            res.append(nums[dq[0]])\n    return res" },
                    { id: "merge_intervals", concept: "Merge / overlap intervals",
                        complexity: "O(N log N)",
                        note: "Sort by start. Compare current start with previous end. For 'min meeting rooms', use heap of end times.",
                        code: "def merge(intervals):\n    intervals.sort(key=lambda x: x[0])\n    out = []\n    for s, e in intervals:\n        if out and s <= out[-1][1]:\n            out[-1][1] = max(out[-1][1], e)\n        else:\n            out.append([s, e])\n    return out" }
                ]
            },
            {
                title: "Trie, LRU, Segment Tree", icon: "ph-tree", color: "text-emerald-400", bg: "bg-emerald-400/10",
                layout: "full",
                items: [
                    { id: "trie", concept: "Trie (prefix tree)",
                        complexity: "O(L) per op",
                        note: "Dict of children is fastest for general charsets; fixed-size arrays of 26 are faster for lowercase-only. Mark `is_word` to distinguish 'word' vs 'prefix'.",
                        code: "class Trie:\n    def __init__(self):\n        self.root = {}\n    def insert(self, word):\n        node = self.root\n        for c in word:\n            node = node.setdefault(c, {})\n        node['$'] = True            # end-of-word marker\n    def search(self, word):\n        node = self.root\n        for c in word:\n            if c not in node: return False\n            node = node[c]\n        return '$' in node\n    def startsWith(self, pre):\n        node = self.root\n        for c in pre:\n            if c not in node: return False\n            node = node[c]\n        return True" },
                    { id: "lru", concept: "LRU Cache (OrderedDict)",
                        complexity: "O(1) get/put",
                        note: "Equivalent to a hashmap + doubly-linked list. `OrderedDict.move_to_end` and `popitem(last=False)` give you both for free.",
                        code: "from collections import OrderedDict\n\nclass LRUCache:\n    def __init__(self, cap):\n        self.cap = cap\n        self.d = OrderedDict()\n    def get(self, k):\n        if k not in self.d: return -1\n        self.d.move_to_end(k)\n        return self.d[k]\n    def put(self, k, v):\n        if k in self.d:\n            self.d.move_to_end(k)\n        self.d[k] = v\n        if len(self.d) > self.cap:\n            self.d.popitem(last=False)" },
                    { id: "segment_tree", concept: "Segment tree (range-sum, point-update)",
                        complexity: "O(log N) per op, O(N) build",
                        note: "1-indexed array of size 2N is the iterative form. For range update + range query, switch to lazy propagation.",
                        code: "class SegTree:\n    def __init__(self, arr):\n        n = self.n = len(arr)\n        self.t = [0] * (2*n)\n        for i, x in enumerate(arr):\n            self.t[n + i] = x\n        for i in range(n - 1, 0, -1):\n            self.t[i] = self.t[2*i] + self.t[2*i+1]\n    def update(self, i, x):\n        i += self.n\n        self.t[i] = x\n        i //= 2\n        while i:\n            self.t[i] = self.t[2*i] + self.t[2*i+1]\n            i //= 2\n    def query(self, l, r):       # [l, r)\n        l += self.n; r += self.n\n        s = 0\n        while l < r:\n            if l & 1: s += self.t[l]; l += 1\n            if r & 1: r -= 1; s += self.t[r]\n            l //= 2; r //= 2\n        return s" }
                ]
            },
            {
                title: "Bit Manipulation", icon: "ph-binary", color: "text-fuchsia-400", bg: "bg-fuchsia-400/10",
                layout: "full",
                items: [
                    { id: "bit_tricks", concept: "Essential bit tricks",
                        complexity: "O(1) each",
                        note: "Same as C/Java/Rust except no overflow. `x.bit_count()` (3.10+) is the popcount built-in.",
                        code: "x & 1                # parity (low bit)\nx & (x-1)            # clears lowest set bit\nx & -x               # isolates lowest set bit\nx | (1 << i)         # set bit i\nx & ~(1 << i)        # clear bit i\nx ^ (1 << i)         # toggle bit i\n(x >> i) & 1         # read bit i\nbin(x).count('1')    # popcount\nx.bit_count()        # 3.10+ popcount\nx.bit_length()       # ceil(log2(x+1))\n\n# Iterate subsets of mask (super useful in bitmask DP)\nsub = mask\nwhile sub:\n    use(sub)\n    sub = (sub - 1) & mask\n# (sub == 0 case handled separately)" }
                ]
            }
        ]
    },

    crosslang: {
        id: 'crosslang',
        title: "C++ / Rust / Java ↔ Python",
        icon: "ph-swap",
        categories: [
            {
                title: "Containers", icon: "ph-package", color: "text-blue-400", bg: "bg-blue-400/10",
                items: [
                    { id: "xl_vec", concept: "vector / ArrayList / Vec",
                        code: "# C++:  std::vector<int> v; v.push_back(x); v.pop_back(); v[i];\n# Java: ArrayList<Integer> v = new ArrayList<>(); v.add(x); v.remove(v.size()-1); v.get(i);\n# Rust: let mut v = Vec::new(); v.push(x); v.pop(); v[i];\n\nv = []\nv.append(x)\nv.pop()\nv[i]",
                        complexity: "O(1) amortized",
                        note: "Same growth strategy. No `reserve()` in Python — list overallocates but you can't tune it." },
                    { id: "xl_hashmap", concept: "unordered_map / HashMap",
                        code: "# C++:  std::unordered_map<string,int> m; m[k]=v; auto it=m.find(k); if(it!=m.end()){...}\n# Java: HashMap<String,Integer> m = new HashMap<>(); m.put(k,v); m.getOrDefault(k,0);\n# Rust: let mut m: HashMap<&str,i32> = HashMap::new(); m.insert(k,v); m.get(k);\n\nm = {}\nm[k] = v\nm.get(k, 0)        # like getOrDefault\nm.setdefault(k, []).append(x)",
                        complexity: "O(1) avg",
                        note: "Python dicts keep insertion order; C++/Java unordered maps don't. For ordered, see TreeMap row." },
                    { id: "xl_treemap", concept: "map / TreeMap / BTreeMap",
                        code: "# C++:  std::map<int,int> m;  m.lower_bound(k); ++m[k];\n# Java: TreeMap<K,V> m = new TreeMap<>(); m.floorKey(k); m.ceilingKey(k);\n# Rust: let mut m: BTreeMap<i32,i32> = BTreeMap::new(); m.range(..k);\n\n# Python stdlib has NO ordered map.\n# Use third-party sortedcontainers (allowed on LeetCode):\nfrom sortedcontainers import SortedDict\nsd = SortedDict()\nsd[k] = v\nsd.bisect_left(k); sd.bisect_right(k)\nsd.peekitem(0); sd.peekitem(-1)",
                        complexity: "O(log N)",
                        note: "Largest gap from C++/Java. If you can't use `sortedcontainers`, simulate with `bisect` over a sorted list (O(N) inserts) or two heaps." },
                    { id: "xl_pq", concept: "priority_queue / PriorityQueue / BinaryHeap",
                        code: "# C++:  std::priority_queue<int> pq;  // MAX-heap by default\n# Java: PriorityQueue<Integer> pq = new PriorityQueue<>(); // MIN-heap by default\n# Rust: let mut pq = BinaryHeap::new();  // MAX-heap by default\n\nimport heapq\nh = []\nheapq.heappush(h, x)      # MIN-heap\nheapq.heappop(h)\n\n# Max-heap: push -x or use heapq._heapify_max (private)",
                        complexity: "O(log N)",
                        note: "C++ defaults max, Java defaults min, Python is min. Confused engineers leak production bugs on this monthly." },
                    { id: "xl_deque", concept: "deque / ArrayDeque / VecDeque",
                        code: "# C++:  std::deque<int> dq; dq.push_back/back/pop_front/front\n# Java: ArrayDeque<Integer> dq; dq.offerLast/peekFirst/pollFirst\n# Rust: let mut dq: VecDeque<i32> = VecDeque::new();\n\nfrom collections import deque\ndq = deque()\ndq.append(x); dq.appendleft(x)\ndq.pop();     dq.popleft()\ndq[0];        dq[-1]",
                        complexity: "O(1) both ends",
                        note: "All three are ring-buffer / doubly-linked-block deques. Same semantics, different verbs." }
                ]
            },
            {
                title: "Strings", icon: "ph-text-aa", color: "text-teal-400", bg: "bg-teal-400/10",
                items: [
                    { id: "xl_str", concept: "string concatenation",
                        code: "# C++:  std::string r; for (auto& s : v) r += s;  // O(N) using SBO+amortized growth\n# Java: StringBuilder sb = new StringBuilder(); for (String s : v) sb.append(s); sb.toString();\n# Rust: let r: String = v.concat();  // or v.join(\"\")\n\n''.join(v)            # O(N), only sane way for many parts\n\n# F-string for templating\nf'{name} = {value}'",
                        complexity: "O(N total)",
                        note: "Never `+=` strings in a Python loop. Java devs already know this from `StringBuilder`; C++ devs need to relearn." },
                    { id: "xl_chararr", concept: "mutable char array",
                        code: "# C++:  std::string is mutable;  s[0] = 'x';\n# Java: char[] cs = s.toCharArray(); cs[0]='x'; new String(cs);\n# Rust: let mut bytes = s.into_bytes(); bytes[0]=b'x';\n\nlst = list(s)\nlst[0] = 'X'\nresult = ''.join(lst)\n\n# Or for byte-level:\nba = bytearray(s, 'utf-8')\nba[0] = ord('X')\nresult = ba.decode()",
                        complexity: "O(N)",
                        note: "`list(s)` is the universal trick for in-place edits to a Python string." },
                    { id: "xl_format", concept: "formatted printing",
                        code: "# C++20: std::format(\"{} = {:.2f}\", name, value);\n# Java:  String.format(\"%s = %.2f\", name, value);\n# Rust:  format!(\"{} = {:.2}\", name, value);\n\nf'{name} = {value:.2f}'\n'{} = {:.2f}'.format(name, value)\n\n# Debug print of variable name + value (Python 3.8+)\nf'{value=}'   # 'value=3'",
                        complexity: "O(N)",
                        note: "F-string format spec mirrors C++20/Rust nearly exactly. `{x=}` debug form is unique to Python." }
                ]
            },
            {
                title: "Iteration & functional", icon: "ph-list-magnifying-glass", color: "text-violet-400", bg: "bg-violet-400/10",
                items: [
                    { id: "xl_streams", concept: "streams / iterators",
                        code: "# Java: arr.stream().filter(x->x>0).map(x->x*x).sum();\n# C++:  std::accumulate, ranges::views::filter | views::transform\n# Rust: arr.iter().filter(|&&x| x>0).map(|x| x*x).sum::<i32>();\n\nsum(x*x for x in arr if x > 0)\n\n# Or with functools\nfrom functools import reduce\nreduce(lambda a,b: a+b, (x*x for x in arr if x>0), 0)",
                        complexity: "O(N)",
                        note: "Generator expressions are Python's stream API: lazy, composable, zero intermediate lists." },
                    { id: "xl_lambda", concept: "lambdas",
                        code: "# C++:  auto add = [](int a, int b){ return a+b; };\n# Java: BiFunction<Integer,Integer,Integer> add = (a,b)->a+b;\n# Rust: let add = |a, b| a + b;\n\nadd = lambda a, b: a + b\nsorted(arr, key=lambda x: (x.age, -x.name))\n\n# Multi-statement: use a def (lambdas are expressions only)\ndef key(x):\n    return (x.age, -x.score)",
                        complexity: "O(1)",
                        note: "Python lambdas are single expressions ONLY — no statements/return. Use a named `def` for anything bigger; it's still idiomatic." },
                    { id: "xl_filter_map", concept: "map() / filter()",
                        code: "# Available but list/gen comps are more Pythonic\nlist(map(str, arr))            # vs [str(x) for x in arr]\nlist(filter(lambda x:x>0, arr)) # vs [x for x in arr if x>0]\n\n# map() returns an ITERATOR (lazy) — wrap in list() to materialize",
                        complexity: "O(N)",
                        note: "Existing C++/Java muscle memory says `map/filter`; comprehensions are usually clearer in Python. Both compile to roughly the same bytecode." }
                ]
            },
            {
                title: "Types, classes, generics", icon: "ph-blueprint", color: "text-rose-400", bg: "bg-rose-400/10",
                items: [
                    { id: "xl_class", concept: "class definition",
                        code: "# Java/C++/Rust have access modifiers; Python uses conventions:\n#   _name      -> 'protected' (just a hint)\n#   __name     -> name-mangled (rarely used)\n#   no marker  -> public\n\nclass Account:\n    bank = 'ACME'                # class var (like Java static)\n    def __init__(self, balance): # constructor\n        self.balance = balance   # instance var (no declaration)\n    def deposit(self, x):\n        self.balance += x\n    @classmethod\n    def from_dict(cls, d):       # alt constructor, like Java static factory\n        return cls(d['balance'])\n    @staticmethod\n    def fee():                   # no self / no cls\n        return 1.0",
                        complexity: "N/A",
                        note: "`self` is explicit (unlike Java `this`). Attributes are added on first assignment; no field declarations. Use `__slots__` to lock down + save memory." },
                    { id: "xl_inheritance", concept: "inheritance / interface",
                        code: "from abc import ABC, abstractmethod\nclass Animal(ABC):              # like Java abstract class\n    @abstractmethod\n    def sound(self): ...\n\nclass Dog(Animal):\n    def sound(self):\n        return 'woof'\n\n# Multiple inheritance is allowed (C3 linearization)\nclass A: ...\nclass B: ...\nclass C(A, B): ...\nC.__mro__   # method resolution order",
                        complexity: "N/A",
                        note: "No `interface` keyword — use ABC. Multiple inheritance works; in Java you'd use interfaces, in Rust traits, in C++ also multiple inheritance." },
                    { id: "xl_generics", concept: "generics",
                        code: "# Java: class Stack<T> { void push(T t) {...} }\n# C++:  template<typename T> class Stack { void push(T t){...} };\n# Rust: struct Stack<T> { ... } impl<T> Stack<T> { ... }\n\nfrom typing import TypeVar, Generic\nT = TypeVar('T')\n\nclass Stack(Generic[T]):\n    def __init__(self) -> None:\n        self._data: list[T] = []\n    def push(self, x: T) -> None:\n        self._data.append(x)\n    def pop(self) -> T:\n        return self._data.pop()",
                        complexity: "N/A",
                        note: "Hints only — Python has no runtime generic enforcement (closer to Java erasure than C++ templates). `TypeVar` + `Generic[T]` is for type checkers." }
                ]
            },
            {
                title: "Memory & errors", icon: "ph-memory", color: "text-amber-400", bg: "bg-amber-400/10",
                items: [
                    { id: "xl_refs", concept: "References / ownership",
                        code: "# Python: every name binds to an OBJECT REFERENCE (like Java).\n# No move semantics (Rust), no ownership, GC handles lifetime.\n\ndef modify(lst, x):\n    lst.append(x)      # mutates caller's list (it's the same object)\n    lst = [1, 2]       # rebinds LOCAL name; caller unaffected\n    x = 99             # ints immutable; only rebinds local\n\n# Need to mutate an int param? Wrap it.\nbox = [0]\ndef inc(box): box[0] += 1",
                        complexity: "N/A",
                        note: "Pass-by-object-reference. Mutable objects can be modified in place; immutables (int, str, tuple) can't. Same model as Java." },
                    { id: "xl_copy", concept: "shallow vs deep copy",
                        code: "import copy\nshallow = arr[:]           # or list(arr) or copy.copy(arr)\ndeep    = copy.deepcopy(arr)\n\n# Trap with nested:\na = [[1,2],[3,4]]\nb = a[:]      # shallow — b[0] is SAME list as a[0]\nb[0].append(99)\n# a -> [[1,2,99],[3,4]]   !!\n\n# For grids, deep copy or rebuild via comprehension:\nb = [row[:] for row in a]",
                        complexity: "O(N) / O(total)",
                        note: "C++ copy constructors do deep by default for value types; Python defaults shallow. `copy.deepcopy` is slow — prefer comprehensions for grids." },
                    { id: "xl_exceptions", concept: "exceptions",
                        code: "# Java: throws checked, must declare. C++: noexcept opt-in. Rust: Result<T,E>.\n# Python: all exceptions are unchecked.\n\nclass MyError(Exception):\n    pass\n\ntry:\n    do()\nexcept (KeyError, ValueError) as e:\n    log(e)\n    raise MyError('wrapped') from e   # chain cause\nexcept Exception:\n    pass\nfinally:\n    cleanup()\n\n# Don't bare `except:` — also catches KeyboardInterrupt/SystemExit\n# Use `except Exception:` minimum",
                        complexity: "N/A",
                        note: "EAFP idiom: try the op, catch failure. Pythonic. Java devs may overuse pre-checks (LBYL) — drop the habit." },
                    { id: "xl_raii", concept: "RAII / try-with-resources",
                        code: "# C++: ~File() releases. Java: try (BufferedReader r = ...) {}. Rust: Drop trait.\n# Python: with-statement contracts (__enter__ / __exit__).\n\nwith open('f') as fh, lock:\n    fh.write('x')         # both released on exit\n\n# Custom\nfrom contextlib import contextmanager\n@contextmanager\ndef opened(path):\n    fh = open(path)\n    try: yield fh\n    finally: fh.close()",
                        complexity: "N/A",
                        note: "No deterministic destructor (don't rely on __del__). Use `with` for cleanup — equivalent to Java try-with-resources / Rust scope-end Drop." }
                ]
            },
            {
                title: "Threading & async", icon: "ph-cpu", color: "text-cyan-400", bg: "bg-cyan-400/10",
                items: [
                    { id: "xl_gil", concept: "The GIL",
                        code: "# CPython has a Global Interpreter Lock — only one thread executes Python bytecode at a time.\n# Threads are still useful for I/O-bound work (blocked threads release the GIL).\n# For CPU-bound parallelism, use multiprocessing or native extensions (numpy, C ext).\n\n# Python 3.13+: experimental no-GIL build exists but is opt-in.",
                        complexity: "N/A",
                        note: "Coming from Java/C++/Rust threading, this is the big surprise. 'Why isn't my multithreaded sort faster?' — GIL." },
                    { id: "xl_threading", concept: "threading & concurrent.futures",
                        code: "from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor, as_completed\n\n# I/O-bound\nwith ThreadPoolExecutor(max_workers=8) as ex:\n    futures = [ex.submit(fetch, url) for url in urls]\n    for f in as_completed(futures):\n        process(f.result())\n\n# CPU-bound — sidesteps the GIL\nwith ProcessPoolExecutor() as ex:\n    results = list(ex.map(heavy, inputs))",
                        complexity: "depends",
                        note: "Java's `ExecutorService` analog. `ProcessPoolExecutor` forks workers — each has its own GIL, gives real parallelism but no shared memory." },
                    { id: "xl_asyncio", concept: "asyncio (coroutines)",
                        code: "import asyncio\nasync def fetch(url):\n    await io_op(url)\n    return ...\n\nasync def main():\n    urls = [...]\n    results = await asyncio.gather(*(fetch(u) for u in urls))\n    return results\n\nasyncio.run(main())",
                        complexity: "N/A",
                        note: "Closest to JS `async/await` or Rust `tokio`. Single-threaded but cooperative — `await` yields control. Don't mix blocking calls into async code." }
                ]
            }
        ]
    },

    gotchas: {
        id: 'gotchas',
        title: "Gotchas & Best Practices",
        icon: "ph-warning",
        categories: [
            {
                title: "Common traps", icon: "ph-bug", color: "text-rose-400", bg: "bg-rose-400/10",
                items: [
                    { id: "trap_2d_list", concept: "2D list with multiplication",
                        code: "# WRONG\ngrid = [[0]*3]*4\ngrid[0][0] = 1\n# grid -> [[1,0,0],[1,0,0],[1,0,0],[1,0,0]]\n\n# RIGHT\ngrid = [[0]*3 for _ in range(4)]",
                        complexity: "N/A",
                        note: "`*4` on a list of lists shares ONE inner list. The comprehension form creates fresh inner lists per row." },
                    { id: "trap_modify_while_iter", concept: "Modify while iterating",
                        code: "# BAD: skips elements / RuntimeError\nfor x in arr:\n    if cond(x):\n        arr.remove(x)\n\nfor k in d:\n    if cond(k):\n        del d[k]    # RuntimeError: dict changed size\n\n# GOOD\narr[:] = [x for x in arr if not cond(x)]\nfor k in list(d):       # snapshot keys\n    if cond(k):\n        del d[k]",
                        complexity: "O(N)",
                        note: "Java `ConcurrentModificationException` analog. Snapshot keys via `list(d)` or build a new container with a comprehension." },
                    { id: "trap_int_overflow", concept: "No int overflow (mostly good, sometimes bad)",
                        code: "1 << 1000          # fine, but expensive\nfor _ in range(1_000_000):\n    x = x * x      # grows unboundedly if you forget MOD\n\n# Mirror the C++/Java mod habit\nMOD = 10**9 + 7\nx = (x * x) % MOD",
                        complexity: "varies",
                        note: "Great for correctness, bad for perf. Modular arithmetic isn't required by Python but is required by problem constraints." },
                    { id: "trap_recursion_limit", concept: "Default recursion limit (1000)",
                        code: "import sys\nsys.setrecursionlimit(10**6)\n\n# Better yet: convert to iterative with explicit stack\n# Python has NO tail-call optimization (Guido's call).",
                        complexity: "N/A",
                        note: "Java default is way deeper (~10k frames). Deep DFS on a 10^5 grid will RecursionError. Bump the limit first thing in graph problems." },
                    { id: "trap_division", concept: "Integer division sign",
                        code: "# Python uses FLOOR division (rounds toward -inf)\n-7 // 2    # -4   (NOT -3)\n-7 % 2     # 1    (NOT -1)\n\n# C/Java behavior (round toward 0)\nimport math\nmath.trunc(-7 / 2)         # -3\nint(-7 / 2)                # -3\nq, r = divmod(-7, 2)       # (-4, 1)  Python style\n\n# Manual C-style trunc div\ndef cdiv(a, b):\n    return -(-a // b) if (a < 0) ^ (b < 0) else a // b",
                        complexity: "O(1)",
                        note: "Burned countless C++/Java porters. When porting solutions, double-check any `//` / `%` involving negatives." },
                    { id: "trap_string_concat", concept: "+= on str inside a loop",
                        code: "# Slow (often O(N^2))\ns = ''\nfor c in chars: s += c\n\n# Fast (O(N))\ns = ''.join(chars)\n\n# Fast for streaming (avoid materializing intermediate list)\nimport io\nbuf = io.StringIO()\nfor c in chars: buf.write(c)\ns = buf.getvalue()",
                        complexity: "O(N) with join",
                        note: "Some CPython versions optimize the `s += c` case but not in all environments. Don't bet on it; just use `join`." },
                    { id: "trap_default_arg", concept: "Mutable default argument",
                        code: "def f(x, acc=[]):     # BUG: shared between calls\n    acc.append(x)\n    return acc\nf(1)   # [1]\nf(2)   # [1, 2]\n\ndef f(x, acc=None):   # FIX\n    if acc is None: acc = []\n    acc.append(x)\n    return acc",
                        complexity: "N/A",
                        note: "One of the top-3 Python newcomer traps. Defaults are evaluated once at def time and persist forever." },
                    { id: "trap_is_vs_eq", concept: "`is` for value compare",
                        code: "# WORKS by accident due to small-int cache\na = 100; b = 100\na is b   # True (interned, but DON'T rely)\na = 1000; b = 1000\na is b   # False !\n\n# RULE: `is` only for None/True/False/sentinels.\nif x is None: ...",
                        complexity: "O(1)",
                        note: "Use `==` for value comparison, `is` only for identity (singletons like None)." },
                    { id: "trap_floats", concept: "Float equality",
                        code: "0.1 + 0.2 == 0.3      # False\nimport math\nmath.isclose(0.1+0.2, 0.3)   # True\nmath.isclose(a, b, abs_tol=1e-9, rel_tol=1e-9)",
                        complexity: "O(1)",
                        note: "Same IEEE 754 gotchas as C++/Java, but Python doesn't have `epsilon` constants — use `math.isclose`." }
                ]
            },
            {
                title: "Perf tips for interviews", icon: "ph-rocket", color: "text-emerald-400", bg: "bg-emerald-400/10",
                items: [
                    { id: "perf_local", concept: "Local variable lookups are faster",
                        code: "# Hot loop: cache lookups as locals\ndef hot(arr):\n    a = arr.append   # local bound method\n    for x in big:\n        a(x)         # faster than arr.append(x)\n    \n# Same for math.sqrt, len, etc. when in a tight loop.",
                        complexity: "constant factor",
                        note: "Local lookups use a fast array index; globals/builtins go through dict lookups. Worth 1.2-2x on tight loops." },
                    { id: "perf_builtins", concept: "Push work into C builtins",
                        code: "# Slower\ntotal = 0\nfor x in arr: total += x\n\n# Faster — sum() is in C\ntotal = sum(arr)\n\n# Similar:\nany(...), all(...), min(...), max(...)\nmap(...), filter(...)\n''.join(parts)\nCounter(arr) instead of manual dict counting",
                        complexity: "constant factor",
                        note: "Most builtins are implemented in C and beat a Python loop. Rule of thumb: if there's a builtin for what you're doing, use it." },
                    { id: "perf_set_lookup", concept: "Use sets for membership tests",
                        code: "# O(N) per lookup\nif x in list_of_things: ...\n\n# O(1) per lookup\ntargets = set(list_of_things)\nif x in targets: ...",
                        complexity: "O(1) vs O(N)",
                        note: "Single biggest perf bug in interview code — `in` on a list is linear. Convert to a set once if you do many lookups." },
                    { id: "perf_input", concept: "Fast input for competitive",
                        code: "import sys\ninput = sys.stdin.readline    # ~4x faster than builtin\ndata = sys.stdin.read().split()\n\n# Bulk read all ints\nimport sys\nints = map(int, sys.stdin.buffer.read().split())",
                        complexity: "O(N)",
                        note: "`input()` is slow due to prompt-handling overhead. Mandatory for any 10^5+ N problem with many lines." },
                    { id: "perf_pypy_numpy", concept: "When stdlib isn't enough",
                        code: "# Heavy numeric crunch in the same thread?\n# 1) PyPy (JIT) often 5-50x speedup, but not in most interview envs\n# 2) numpy for vectorized array math (allowed on most platforms)\nimport numpy as np\na = np.array(arr, dtype=np.int64)\nresult = np.cumsum(a)\nmask = a > 0\nfiltered = a[mask]",
                        complexity: "N/A",
                        note: "On LeetCode numpy is available. Use it when you need vectorized prefix sums, dot products, etc. Beware of conversion overhead for tiny arrays." }
                ]
            },
            {
                title: "Pythonic idioms (write less code)", icon: "ph-feather", color: "text-yellow-400", bg: "bg-yellow-400/10",
                items: [
                    { id: "idiom_unpack_swap", concept: "Swap & multi-assign",
                        code: "a, b = b, a                 # swap\na, b = 0, 1                 # multi-assign\nfor i, v in enumerate(arr): # index + value\n    ...",
                        complexity: "O(1)",
                        note: "Show enumerate in interviews — `for i in range(len(arr)): v = arr[i]` is a tell that the candidate doesn't write Python." },
                    { id: "idiom_zip", concept: "zip / zip(*x)",
                        code: "for a, b in zip(xs, ys):           # parallel iter\n    ...\nfor i, (a, b) in enumerate(zip(xs, ys)):\n    ...\n\n# Transpose a matrix\nT = list(zip(*matrix))             # list of TUPLES\n\n# 3.10+: zip(..., strict=True) raises if lengths differ",
                        complexity: "O(N)",
                        note: "`zip` stops at the shortest by default (silent truncation). Use `strict=True` (3.10+) or `itertools.zip_longest` when needed." },
                    { id: "idiom_dict_comp", concept: "Index/inverse map in one line",
                        code: "idx = {v: i for i, v in enumerate(arr)}\ninv = {v: k for k, v in d.items()}    # invert a mapping",
                        complexity: "O(N)",
                        note: "Indexed lookup builder is the most common dict comp in interviews (two-sum, anagram grouping)." },
                    { id: "idiom_any_all", concept: "any / all short-circuit",
                        code: "if any(x < 0 for x in arr): ...     # stop on first True\nif all(x > 0 for x in arr): ...     # stop on first False\n\n# Note: generator beats list — don't materialize\n# any([cond(x) for x in big])   # builds whole list first",
                        complexity: "O(N) worst",
                        note: "Pass a GENERATOR expression (no brackets), not a list comprehension — otherwise you lose short-circuit benefits." },
                    { id: "idiom_sentinel", concept: "Sentinel: float('inf')",
                        code: "best_min = float('inf')\nbest_max = float('-inf')\nfor x in arr:\n    best_min = min(best_min, x)\n\n# DP base case\ndp = [[float('inf')]*n for _ in range(m)]",
                        complexity: "O(1)",
                        note: "No `Integer.MAX_VALUE` ceremony. `float('inf')` compares correctly against any int." },
                    { id: "idiom_eafp", concept: "EAFP vs LBYL",
                        code: "# LBYL (look before you leap) — Java/C++ style\nif key in d and isinstance(d[key], int):\n    val = d[key]\n\n# EAFP (easier to ask forgiveness) — Pythonic\ntry:\n    val = d[key]\nexcept (KeyError, TypeError):\n    val = default",
                        complexity: "depends",
                        note: "EAFP is faster when the exception is rare. For interviews, pick whichever reads cleaner — but know both terms." }
                ]
            },
            {
                title: "Testing & debugging", icon: "ph-test-tube", color: "text-cyan-400", bg: "bg-cyan-400/10",
                items: [
                    { id: "debug_repr", concept: "repr vs str, print debugging",
                        code: "print(x)         # str() — user-facing\nprint(repr(x))   # debugger-friendly: quotes strings, shows types\nprint(f'{x=}')   # 3.8+: prints 'x=value'\n\n# Quick pretty\nimport pprint\npprint.pp(deep_dict, indent=2)",
                        complexity: "N/A",
                        note: "`{x=}` in f-strings is interview gold — quickly shows variable name + value without typing the name twice." },
                    { id: "debug_assert", concept: "assert for invariants",
                        code: "assert 0 <= i < n, f'index {i} out of range'\nassert sorted(arr) == arr, 'precondition: arr sorted'\n\n# WARNING: stripped with `python -O`. Don't use for production validation.",
                        complexity: "O(1)",
                        note: "Use freely during interviews to communicate invariants. The interviewer reads `assert` as 'I'm thinking about this case'." },
                    { id: "debug_typecheck", concept: "Static type-check (mypy / pyright)",
                        code: "# Run mypy on a file\n# $ mypy solution.py\n# Or pyright (faster, used by Pylance / VS Code)\n# $ pyright solution.py",
                        complexity: "N/A",
                        note: "Hints catch real bugs at write time without runtime cost. In interviews, even partial hints signal seriousness." }
                ]
            }
        ]
    },

    sandbox: {
        id: 'sandbox',
        title: "Live Sandbox",
        icon: "ph-terminal-window",
        categories: []
    },

    quiz: {
        id: 'quiz',
        title: "Flash Cards",
        icon: "ph-brain",
        categories: []
    },

    strategy: {
        id: 'strategy',
        title: "Interview Strategy",
        icon: "ph-strategy",
        categories: [
            {
                title: "The 5-step approach", icon: "ph-list-numbers", color: "text-blue-400", bg: "bg-blue-400/10",
                items: [
                    { id: "step_clarify", concept: "1. Clarify (2-3 min)",
                        code: "# Always ask:\n# - Input ranges (N? value bounds? negatives? duplicates?)\n# - Sorted? Unique? Connected?\n# - Multiple valid answers? Lex-smallest required?\n# - Memory constraints? Streaming?\n# - Can I assume valid input?",
                        complexity: "N/A",
                        note: "Constraints drive algorithm choice. N=20 => allow O(2^N); N=10^5 => need O(N log N); N=10^9 => O(log N) only." },
                    { id: "step_examples", concept: "2. Walk through an example",
                        code: "# Pick a small, non-trivial example BEFORE coding.\n# Cover at least one edge: empty, single, all-same, sorted, reverse.\n# Trace by hand. Find the pattern.",
                        complexity: "N/A",
                        note: "Skipping this is the #1 cause of buggy solutions. The pattern usually appears once you do 2 small examples by hand." },
                    { id: "step_brute", concept: "3. State the brute force",
                        code: "# Even if obviously too slow.\n# Tells the interviewer you can think.\n# Often becomes the optimization target.\n# Note its complexity explicitly.",
                        complexity: "N/A",
                        note: "Always say the brute force first. Then propose the optimization — interviewers want to see the gradient of your thinking." },
                    { id: "step_optimize", concept: "4. Optimize → choose template",
                        code: "# Map symptoms to templates:\n# 'shortest path unweighted'   -> BFS\n# 'weighted shortest path'     -> Dijkstra\n# 'subarray sum = K'           -> prefix-sum + hash\n# 'longest with property'      -> sliding window\n# 'top-K'                      -> heap (bounded)\n# 'connectivity / groups'      -> Union-Find\n# 'overlap / scheduling'       -> sort + sweep / heap\n# 'count ways / min cost'      -> DP\n# 'sorted + pair sum'          -> two pointers\n# 'first/last index'           -> binary search",
                        complexity: "N/A",
                        note: "Build the symptom→template map ahead of time. Interviewers love hearing the template named." },
                    { id: "step_code_test", concept: "5. Code + dry-run edge cases",
                        code: "# WHILE coding:\n# - Name vars semantically (l/r, lo/hi, i/j ok for indices)\n# - Use helper functions for clarity\n# - Type hints if natural\n# AFTER coding:\n# - Dry-run on your example\n# - Test: empty, single element, duplicates, max/min bounds\n# - State final complexity (time + space) without prompting",
                        complexity: "N/A",
                        note: "Volunteering the complexity unprompted is a strong positive signal. So is announcing edge cases before the interviewer asks." }
                ]
            },
            {
                title: "Time/space cheatsheet by N", icon: "ph-clock", color: "text-emerald-400", bg: "bg-emerald-400/10",
                items: [
                    { id: "n_complexity", concept: "What complexity fits N?",
                        code: "# N <= 10:        O(N!)         backtracking, all perms\n# N <= 20-25:     O(2^N * N)    bitmask DP, subset enum\n# N <= 100-200:   O(N^4)        4D DP, triple loops + something\n# N <= 1,000:     O(N^3)        Floyd-Warshall, knapsack-ish\n# N <= 10,000:    O(N^2)        n^2 DP, all-pairs scans\n# N <= 100,000:   O(N log N)    sort, heap, bin search, segment tree\n# N <= 10^6-10^7: O(N) / O(N log log N)  linear scans, sieve\n# N <= 10^9:      O(log N) / O(sqrt N)   binary search, math",
                        complexity: "rule of thumb",
                        note: "Memorize. Picking the right target up-front prevents wasted minutes on a brute force that can't pass." },
                    { id: "python_constants", concept: "Python constant factors are LARGE",
                        code: "# Rough: Python is ~30-100x slower than C++ for tight loops.\n# 10^7 simple ops/sec is a safe ceiling for a Python loop.\n# 10^8 ops in a Python loop will TLE on most judges.\n# Push work into C builtins (sum, sorted, set ops, numpy) when possible.",
                        complexity: "N/A",
                        note: "If you're translating a C++ AC solution and it TLEs in Python, look for an iteration you can vectorize or replace with a builtin." }
                ]
            },
            {
                title: "Communication signals", icon: "ph-chat-circle-text", color: "text-violet-400", bg: "bg-violet-400/10",
                items: [
                    { id: "comm_think_aloud", concept: "Think aloud, but structured",
                        code: "# DO:\n# 'Two approaches: brute O(N^2) or hash O(N). I'll go with hash.'\n# 'I'm worried about the case where all values are duplicates.'\n# 'I'll trade O(N) extra space for O(N) time.'\n\n# DON'T:\n# Long silent thinking with no narration.\n# Coding without verbalizing what you're trying.",
                        complexity: "N/A",
                        note: "Interviewers grade your reasoning, not just your output. A clean thought process with a small bug beats a silent perfect solution." },
                    { id: "comm_edge_cases", concept: "Announce edge cases you covered",
                        code: "# 'Edge cases I handled: empty input, single element, all equal, negative numbers, integer overflow (not applicable here since Python).'\n# 'This breaks if k > len(arr); I'm clamping it.'",
                        complexity: "N/A",
                        note: "Listing them aloud beats silently checking them — even if your code already covers them, the interviewer needs to see it." }
                ]
            }
        ]
    }

};

// ---- Flashcards ----
const flashcards = [
    { tag: "C++ → Py", question: "C++ `std::lower_bound(v.begin(), v.end(), x)` — Python equivalent?",
      answer: "`bisect.bisect_left(arr, x)` from the `bisect` module. Returns the index of the first element >= x. O(log N).",
      code: "from bisect import bisect_left\ni = bisect_left(arr, x)\n# arr[i] >= x (or i == len(arr))" },
    { tag: "Java → Py", question: "Java `PriorityQueue<Integer>` (default min) ↔ Python?",
      answer: "`heapq` IS a min-heap. Same default. For Java's `PriorityQueue<>(Comparator.reverseOrder())`, push `-x` in Python.",
      code: "import heapq\nh = []\nheapq.heappush(h, x)\nheapq.heappop(h)        # min\n# Max-heap: push -x and negate on pop" },
    { tag: "Rust → Py", question: "Rust `Option<T>` and `if let Some(x) = opt {}` — Python equivalent?",
      answer: "Python uses `T | None` (or `Optional[T]`). Check with `is not None`. There's no destructuring keyword — assign then test.",
      code: "x: int | None = find(arr)\nif x is not None:\n    use(x)" },
    { tag: "Trap", question: "Why is `[[0]*3]*4` wrong for a 2D grid?",
      answer: "All 4 rows alias the SAME inner list. Mutating one mutates all. Use `[[0]*3 for _ in range(4)]` to get 4 distinct rows.",
      code: "grid = [[0]*3 for _ in range(4)]\ngrid[0][0] = 1   # only row 0 affected" },
    { tag: "Trap", question: "What does `-7 // 2` evaluate to?",
      answer: "`-4`. Python uses FLOOR division (rounds toward -infinity). C/Java/Rust would give `-3` (round toward zero). Same trap with `%`: `-7 % 2 == 1` in Python.",
      code: "-7 // 2          # -4 (floor)\n-7 % 2           # 1\n# C-style trunc div:\nimport math\nmath.trunc(-7/2) # -3" },
    { tag: "Stdlib", question: "Fastest way to count character frequencies?",
      answer: "`Counter` from `collections`. It's implemented in C and gives multiset semantics for free.",
      code: "from collections import Counter\nfreq = Counter(s)\nfreq.most_common(3)" },
    { tag: "Idiom", question: "Pythonic way to swap two variables?",
      answer: "`a, b = b, a`. Tuple-pack/unpack — no temp variable needed. Same trick for any number: `a, b, c = c, a, b`.",
      code: "a, b = b, a" },
    { tag: "Stdlib", question: "Single-line memoization of a recursive function?",
      answer: "Decorate with `@functools.cache` (or `@lru_cache(maxsize=None)`). All arguments must be hashable.",
      code: "from functools import cache\n@cache\ndef fib(n):\n    return n if n < 2 else fib(n-1) + fib(n-2)" },
    { tag: "Trap", question: "Why is `def f(x, acc=[])` dangerous?",
      answer: "The default `[]` is evaluated ONCE at def time. Successive calls share the SAME list. Use `acc=None` and check inside.",
      code: "def f(x, acc=None):\n    if acc is None:\n        acc = []\n    acc.append(x)" },
    { tag: "Stdlib", question: "How do you build an O(1) FIFO queue?",
      answer: "`collections.deque` — `append` on the right, `popleft` from the left, both O(1). Never use `list.pop(0)` (that's O(N)).",
      code: "from collections import deque\nq = deque()\nq.append(x)\nq.popleft()" },
    { tag: "Idiom", question: "Pythonic 'not found' return for a search function?",
      answer: "Return `None`. Caller checks `is not None`. Avoid sentinels like `-1` unless the problem requires it (e.g., LeetCode signatures).",
      code: "def find(arr, x):\n    for i, v in enumerate(arr):\n        if v == x:\n            return i\n    return None" },
    { tag: "Perf", question: "How can `x in some_collection` be a perf trap?",
      answer: "`x in list` is O(N). `x in set` and `x in dict` are O(1) average. Convert once if you do many lookups.",
      code: "targets = set(targets_list)  # one-time O(N)\nfor q in queries:\n    if q in targets:           # O(1)\n        ..." },
    { tag: "C++ → Py", question: "C++ `std::map<K,V>` — closest Python equivalent?",
      answer: "Python stdlib has NONE. Use third-party `sortedcontainers.SortedDict` (allowed on LeetCode) or simulate with `bisect` + sorted list.",
      code: "from sortedcontainers import SortedDict\nsd = SortedDict()\nsd[k] = v\nsd.bisect_left(k)" },
    { tag: "Stdlib", question: "Compute a prefix-sum in one line?",
      answer: "`list(itertools.accumulate(arr))`. With `initial=0` (3.8+) it includes a leading zero — handy for range-sum queries.",
      code: "from itertools import accumulate\npref = list(accumulate(arr, initial=0))\n# arr[l..r] = pref[r+1] - pref[l]" },
    { tag: "Java → Py", question: "Java `String.format(\"%.2f\", x)` — Python equivalent?",
      answer: "`f'{x:.2f}'` or `'{:.2f}'.format(x)`. F-strings (3.6+) are fastest and most readable.",
      code: "x = 3.14159\nf'{x:.2f}'        # '3.14'\nf'{x:>8.2f}'      # '    3.14'" }
];

// ---- Sandbox templates ----
const sandboxAlgos = {
binary_search: `from bisect import bisect_left, bisect_right

def lower_bound(arr, target):
    lo, hi = 0, len(arr)
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo

arr = [1, 3, 4, 4, 4, 7, 9]
print("arr:", arr)
print("lower_bound(4):", lower_bound(arr, 4))
print("bisect_left(4):", bisect_left(arr, 4))
print("bisect_right(4):", bisect_right(arr, 4))
print("# occurrences of 4:", bisect_right(arr, 4) - bisect_left(arr, 4))
print("first idx >= 5:", bisect_left(arr, 5))
`,

two_pointers: `def max_area(height):
    l, r = 0, len(height) - 1
    best = 0
    while l < r:
        h = min(height[l], height[r])
        best = max(best, h * (r - l))
        if height[l] < height[r]:
            l += 1
        else:
            r -= 1
    return best

heights = [1, 8, 6, 2, 5, 4, 8, 3, 7]
print("heights:", heights)
print("Max container water area:", max_area(heights))
`,

sliding_window: `def longest_no_repeat(s):
    last = {}
    left = 0
    best = 0
    for right, c in enumerate(s):
        if c in last and last[c] >= left:
            left = last[c] + 1
        last[c] = right
        best = max(best, right - left + 1)
    return best

tests = ["abcabcbb", "bbbbb", "pwwkew", ""]
for t in tests:
    print(f"longest_no_repeat({t!r}) = {longest_no_repeat(t)}")
`,

bfs_grid: `from collections import deque

def shortest_path(grid, src, dst):
    R, C = len(grid), len(grid[0])
    DIRS = [(-1,0),(1,0),(0,-1),(0,1)]
    q = deque([(src, 0)])
    seen = {src}
    while q:
        (r,c), d = q.popleft()
        if (r,c) == dst:
            return d
        for dr, dc in DIRS:
            nr, nc = r+dr, c+dc
            if (0 <= nr < R and 0 <= nc < C
                and grid[nr][nc] == 0 and (nr,nc) not in seen):
                seen.add((nr,nc))
                q.append(((nr,nc), d+1))
    return -1

grid = [
    [0, 0, 0, 1, 0],
    [1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
]
for row in grid: print(row)
print("shortest (0,0) -> (4,4):", shortest_path(grid, (0,0), (4,4)))
`,

dfs_backtrack: `def permutations(nums):
    res, path, used = [], [], [False]*len(nums)
    def back():
        if len(path) == len(nums):
            res.append(path[:])
            return
        for i, v in enumerate(nums):
            if used[i]: continue
            used[i] = True
            path.append(v)
            back()
            path.pop()
            used[i] = False
    back()
    return res

nums = [1, 2, 3]
perms = permutations(nums)
print(f"{len(perms)} permutations of {nums}:")
for p in perms:
    print(" ", p)
`,

dijkstra: `import heapq

def dijkstra(adj, src, n):
    dist = [float('inf')] * n
    dist[src] = 0
    h = [(0, src)]
    while h:
        d, u = heapq.heappop(h)
        if d > dist[u]:
            continue
        for v, w in adj.get(u, []):
            nd = d + w
            if nd < dist[v]:
                dist[v] = nd
                heapq.heappush(h, (nd, v))
    return dist

# weighted directed graph
adj = {
    0: [(1, 4), (2, 1)],
    1: [(3, 1)],
    2: [(1, 2), (3, 5)],
    3: []
}
n = 4
d = dijkstra(adj, 0, n)
print("Shortest distances from 0:")
for v in range(n):
    print(f"  -> {v}: {d[v]}")
`,

union_find: `class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank   = [0] * n
        self.count  = n
    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x
    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb: return False
        if self.rank[ra] < self.rank[rb]: ra, rb = rb, ra
        self.parent[rb] = ra
        if self.rank[ra] == self.rank[rb]: self.rank[ra] += 1
        self.count -= 1
        return True

n, edges = 6, [(0,1),(1,2),(3,4)]
dsu = DSU(n)
for u, v in edges:
    dsu.union(u, v)
print(f"{n} nodes, edges={edges}")
print("Connected components:", dsu.count)
print("Roots:", [dsu.find(i) for i in range(n)])
`,

dp_knapsack: `def knapsack(weights, values, W):
    dp = [0] * (W + 1)
    for w, v in zip(weights, values):
        for cap in range(W, w - 1, -1):
            dp[cap] = max(dp[cap], dp[cap - w] + v)
    return dp[W]

weights = [2, 3, 4, 5]
values  = [3, 4, 5, 6]
W = 5
print(f"weights={weights}, values={values}, capacity={W}")
print("Max value:", knapsack(weights, values, W))
`,

topo_sort: `from collections import deque, defaultdict

def topo_sort(n, edges):
    adj = defaultdict(list)
    indeg = [0] * n
    for u, v in edges:
        adj[u].append(v)
        indeg[v] += 1
    q = deque(i for i in range(n) if indeg[i] == 0)
    order = []
    while q:
        u = q.popleft()
        order.append(u)
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return order if len(order) == n else []

n, edges = 6, [(5,2),(5,0),(4,0),(4,1),(2,3),(3,1)]
print(f"n={n}, edges={edges}")
print("Topological order:", topo_sort(n, edges))
`,

lru_cache: `from collections import OrderedDict

class LRUCache:
    def __init__(self, cap):
        self.cap = cap
        self.d = OrderedDict()
    def get(self, k):
        if k not in self.d: return -1
        self.d.move_to_end(k)
        return self.d[k]
    def put(self, k, v):
        if k in self.d:
            self.d.move_to_end(k)
        self.d[k] = v
        if len(self.d) > self.cap:
            ev, _ = self.d.popitem(last=False)
            print(f"  evicted key {ev}")

c = LRUCache(2)
print("put 1=A"); c.put(1, 'A')
print("put 2=B"); c.put(2, 'B')
print("get 1 ->", c.get(1))
print("put 3=C (should evict 2)"); c.put(3, 'C')
print("get 2 ->", c.get(2))
print("get 3 ->", c.get(3))
`,

trie: `class Trie:
    def __init__(self):
        self.root = {}
    def insert(self, word):
        node = self.root
        for c in word:
            node = node.setdefault(c, {})
        node['$'] = True
    def search(self, word):
        node = self.root
        for c in word:
            if c not in node: return False
            node = node[c]
        return '$' in node
    def startsWith(self, pre):
        node = self.root
        for c in pre:
            if c not in node: return False
            node = node[c]
        return True

t = Trie()
for w in ["apple", "app", "apt", "bear"]:
    t.insert(w)
print("search('app')      ->", t.search("app"))
print("search('appl')     ->", t.search("appl"))
print("startsWith('app')  ->", t.startsWith("app"))
print("startsWith('bear') ->", t.startsWith("bear"))
print("startsWith('cat')  ->", t.startsWith("cat"))
`,

segment_tree: `class SegTree:
    def __init__(self, arr):
        n = self.n = len(arr)
        self.t = [0] * (2*n)
        for i, x in enumerate(arr):
            self.t[n + i] = x
        for i in range(n - 1, 0, -1):
            self.t[i] = self.t[2*i] + self.t[2*i+1]
    def update(self, i, x):
        i += self.n
        self.t[i] = x
        i //= 2
        while i:
            self.t[i] = self.t[2*i] + self.t[2*i+1]
            i //= 2
    def query(self, l, r):   # [l, r)
        l += self.n; r += self.n
        s = 0
        while l < r:
            if l & 1: s += self.t[l]; l += 1
            if r & 1: r -= 1; s += self.t[r]
            l //= 2; r //= 2
        return s

arr = [1, 3, 5, 7, 9, 11]
st = SegTree(arr)
print("arr:", arr)
print("sum[1,4) =", st.query(1, 4), "(expect 3+5+7=15)")
print("update idx 2 -> 50")
st.update(2, 50)
print("sum[1,4) =", st.query(1, 4), "(expect 3+50+7=60)")
print("sum[0,6) =", st.query(0, 6))
`
};
