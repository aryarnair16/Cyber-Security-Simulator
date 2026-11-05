import test from "node:test";
import assert from "node:assert/strict";
import { correlateEvents } from "./eventCorrelation.js";

const events = [
  {
    id: "event-001",
    timestamp: "2026-10-15T09:00:00Z",
    user: "alex.morgan",
    ip: "192.0.2.10",
  },
  {
    id: "event-002",
    timestamp: "2026-10-15T09:15:00Z",
    user: "alex.morgan",
    ip: "198.51.100.25",
  },
  {
    id: "event-003",
    timestamp: "2026-10-15T09:18:00Z",
    user: "alex.morgan",
    ip: "198.51.100.25",
  },
];

test("correlates events involving the same user", () => {
  const result = correlateEvents(events);

  assert.ok(
    result.some(
      (item) =>
        item.eventIds.includes("event-001") &&
        item.eventIds.includes("event-002") &&
        item.reasons.includes("Same user account")
    )
  );
});

test("correlates events involving the same IP address", () => {
  const result = correlateEvents(events);

  assert.ok(
    result.some(
      (item) =>
        item.eventIds.includes("event-002") &&
        item.eventIds.includes("event-003") &&
        item.reasons.includes("Same IP address")
    )
  );
});

test("does not correlate events outside the time window", () => {
  const result = correlateEvents([
    events[0],
    {
      ...events[1],
      timestamp: "2026-10-15T12:00:00Z",
    },
  ]);

  assert.equal(result.length, 0);
});

test("ignores events with invalid timestamps", () => {
  const result = correlateEvents([
    events[0],
    { ...events[1], timestamp: "invalid-date" },
  ]);

  assert.equal(result.length, 0);
});

test("returns an empty array for invalid input", () => {
  assert.deepEqual(correlateEvents(null), []);
});