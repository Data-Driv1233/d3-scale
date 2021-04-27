import assert from "assert";
import * as d3 from "../src/index.js";

it("scaleOrdinal() has the expected defaults", () => {
  const s = d3.scaleOrdinal();
  assert.deepStrictEqual(s.domain(), []);
  assert.deepStrictEqual(s.range(), []);
  assert.strictEqual(s(0), undefined);
  assert.strictEqual(s.unknown(), d3.scaleImplicit);
  assert.deepStrictEqual(s.domain(), [0]);
});

it("ordinal(x) maps a unique name x in the domain to the corresponding value y in the range", () => {
  const s = d3.scaleOrdinal().domain([0, 1]).range(["foo", "bar"]);
  assert.strictEqual(s(0), "foo");
  assert.strictEqual(s(1), "bar");
  s.range(["a", "b", "c"]);
  assert.strictEqual(s(0), "a");
  assert.strictEqual(s("0"), "a");
  assert.strictEqual(s([0]), "a");
  assert.strictEqual(s(1), "b");
  assert.strictEqual(s(2.0), "c");
  assert.strictEqual(s(new Number(2)), "c");
});

it("ordinal(x) implicitly extends the domain when a range is explicitly specified", () => {
  const s = d3.scaleOrdinal().range(["foo", "bar"]);
  assert.deepStrictEqual(s.domain(), []);
  assert.strictEqual(s(0), "foo");
  assert.deepStrictEqual(s.domain(), [0]);
  assert.strictEqual(s(1), "bar");
  assert.deepStrictEqual(s.domain(), [0, 1]);
  assert.strictEqual(s(0), "foo");
  assert.deepStrictEqual(s.domain(), [0, 1]);
});

it("ordinal.domain(x) makes a copy of the domain", () => {
  const domain = ["red", "green"],
      s = d3.scaleOrdinal().domain(domain);
  domain.push("blue");
  assert.deepStrictEqual(s.domain(), ["red", "green"]);
});

it("ordinal.domain() returns a copy of the domain", () => {
  const s = d3.scaleOrdinal().domain(["red", "green"]),
      domain = s.domain();
  s("blue");
  assert.deepStrictEqual(domain, ["red", "green"]);
});

it("ordinal.domain() accepts an iterable", () => {
  const s = d3.scaleOrdinal().domain(new Set(["red", "green"]));
  assert.deepStrictEqual(s.domain(), ["red", "green"]);
});

it("ordinal.domain() replaces previous domain values", () => {
  const s = d3.scaleOrdinal().range(["foo", "bar"]);
  assert.strictEqual(s(1), "foo");
  assert.strictEqual(s(0), "bar");
  assert.deepStrictEqual(s.domain(), [1, 0]);
  s.domain(["0", "1"]);
  assert.strictEqual(s(0), "foo"); // it changed!
  assert.strictEqual(s(1), "bar");
  assert.deepStrictEqual(s.domain(), ["0", "1"]);
});

it("ordinal.domain() uniqueness is based on string coercion", () => {
  const s = d3.scaleOrdinal().domain(["foo"]).range([42, 43, 44]);
  assert.strictEqual(s(new String("foo")), 42);
  assert.strictEqual(s({toString: function() { return "foo"; }}), 42);
  assert.strictEqual(s({toString: function() { return "bar"; }}), 43);
});

it("ordinal.domain() does not coerce domain values to strings", () => {
  const s = d3.scaleOrdinal().domain([0, 1]);
  assert.deepStrictEqual(s.domain(), [0, 1]);
  assert.strictEqual(typeof s.domain()[0], "number");
  assert.strictEqual(typeof s.domain()[1], "number");
});

it("ordinal.domain() does not barf on object built-ins", () => {
  const s = d3.scaleOrdinal().domain(["__proto__", "hasOwnProperty"]).range([42, 43]);
  assert.strictEqual(s("__proto__"), 42);
  assert.strictEqual(s("hasOwnProperty"), 43);
  assert.deepStrictEqual(s.domain(), ["__proto__", "hasOwnProperty"]);
});

it("ordinal.domain() is ordered by appearance", () => {
  const s = d3.scaleOrdinal();
  s("foo");
  s("bar");
  s("baz");
  assert.deepStrictEqual(s.domain(), ["foo", "bar", "baz"]);
  s.domain(["baz", "bar"]);
  s("foo");
  assert.deepStrictEqual(s.domain(), ["baz", "bar", "foo"]);
  s.domain(["baz", "foo"]);
  assert.deepStrictEqual(s.domain(), ["baz", "foo"]);
  s.domain([]);
  s("foo");
  s("bar");
  assert.deepStrictEqual(s.domain(), ["foo", "bar"]);
});

it("ordinal.range(x) makes a copy of the range", () => {
  const range = ["red", "green"],
      s = d3.scaleOrdinal().range(range);
  range.push("blue");
  assert.deepStrictEqual(s.range(), ["red", "green"]);
});

it("ordinal.range() accepts an iterable", () => {
  const s = d3.scaleOrdinal().range(new Set(["red", "green"]));
  assert.deepStrictEqual(s.range(), ["red", "green"]);
});

it("ordinal.range() returns a copy of the range", () => {
  const s = d3.scaleOrdinal().range(["red", "green"]),
      range = s.range();
  assert.deepStrictEqual(range, ["red", "green"]);
  range.push("blue");
  assert.deepStrictEqual(s.range(), ["red", "green"]);
});

it("ordinal.range(values) does not discard implicit domain associations", () => {
  const s = d3.scaleOrdinal();
  assert.strictEqual(s(0), undefined);
  assert.strictEqual(s(1), undefined);
  s.range(["foo", "bar"]);
  assert.strictEqual(s(1), "bar");
  assert.strictEqual(s(0), "foo");
});

it("ordinal(value) recycles values when exhausted", () => {
  const s = d3.scaleOrdinal().range(["a", "b", "c"]);
  assert.strictEqual(s(0), "a");
  assert.strictEqual(s(1), "b");
  assert.strictEqual(s(2), "c");
  assert.strictEqual(s(3), "a");
  assert.strictEqual(s(4), "b");
  assert.strictEqual(s(5), "c");
  assert.strictEqual(s(2), "c");
  assert.strictEqual(s(1), "b");
  assert.strictEqual(s(0), "a");
});

it("ordinal.unknown(x) sets the output value for unknown inputs", () => {
  const s = d3.scaleOrdinal().domain(["foo", "bar"]).unknown("gray").range(["red", "blue"]);
  assert.strictEqual(s("foo"), "red");
  assert.strictEqual(s("bar"), "blue");
  assert.strictEqual(s("baz"), "gray");
  assert.strictEqual(s("quux"), "gray");
});

it("ordinal.unknown(x) prevents implicit domain extension if x is not implicit", () => {
  const s = d3.scaleOrdinal().domain(["foo", "bar"]).unknown(undefined).range(["red", "blue"]);
  assert.strictEqual(s("baz"), undefined);
  assert.deepStrictEqual(s.domain(), ["foo", "bar"]);
});

it("ordinal.copy() copies all fields", () => {
  const s1 = d3.scaleOrdinal().domain([1, 2]).range(["red", "green"]).unknown("gray"),
      s2 = s1.copy();
  assert.deepStrictEqual(s2.domain(), s1.domain());
  assert.deepStrictEqual(s2.range(), s1.range());
  assert.deepStrictEqual(s2.unknown(), s1.unknown());
});

it("ordinal.copy() changes to the domain are isolated", () => {
  const s1 = d3.scaleOrdinal().range(["foo", "bar"]),
      s2 = s1.copy();
  s1.domain([1, 2]);
  assert.deepStrictEqual(s2.domain(), []);
  assert.strictEqual(s1(1), "foo");
  assert.strictEqual(s2(1), "foo");
  s2.domain([2, 3]);
  assert.strictEqual(s1(2), "bar");
  assert.strictEqual(s2(2), "foo");
  assert.deepStrictEqual(s1.domain(), [1, 2]);
  assert.deepStrictEqual(s2.domain(), [2, 3]);
});

it("ordinal.copy() changes to the range are isolated", () => {
  const s1 = d3.scaleOrdinal().range(["foo", "bar"]),
      s2 = s1.copy();
  s1.range(["bar", "foo"]);
  assert.strictEqual(s1(1), "bar");
  assert.strictEqual(s2(1), "foo");
  assert.deepStrictEqual(s2.range(), ["foo", "bar"]);
  s2.range(["foo", "baz"]);
  assert.strictEqual(s1(2), "foo");
  assert.strictEqual(s2(2), "baz");
  assert.deepStrictEqual(s1.range(), ["bar", "foo"]);
  assert.deepStrictEqual(s2.range(), ["foo", "baz"]);
});
