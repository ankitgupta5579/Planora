import test from 'node:test';
import assert from 'node:assert/strict';
import { loadSavedEvents, saveAllEvents, getActiveEventId, setActiveEventId } from './storage';
import { SAMPLE_EVENTS } from './sampleData';
import { EventPlan } from '../types/event';

// Simple in-memory localStorage polyfill for testing
class MockLocalStorage {
  private store = new Map<string, string>();
  getItem(key: string) {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

test('storage: loadSavedEvents falls back to SAMPLE_EVENTS when localStorage is empty', () => {
  const mock = new MockLocalStorage();
  (globalThis as any).window = globalThis;
  (globalThis as any).localStorage = mock;

  const events = loadSavedEvents();
  assert.equal(Array.isArray(events), true);
  assert.equal(events.length, SAMPLE_EVENTS.length);
  assert.equal(events[0].id, SAMPLE_EVENTS[0].id);
});

test('storage: loadSavedEvents falls back to SAMPLE_EVENTS when localStorage contains corrupt JSON', () => {
  const mock = new MockLocalStorage();
  mock.setItem('celebration_events_v1', '{invalid-json');
  (globalThis as any).window = globalThis;
  (globalThis as any).localStorage = mock;

  const events = loadSavedEvents();
  assert.equal(Array.isArray(events), true);
  assert.equal(events.length, SAMPLE_EVENTS.length);
});

test('storage: loadSavedEvents falls back to SAMPLE_EVENTS when localStorage contains an empty array', () => {
  const mock = new MockLocalStorage();
  mock.setItem('celebration_events_v1', '[]');
  (globalThis as any).window = globalThis;
  (globalThis as any).localStorage = mock;

  const events = loadSavedEvents();
  assert.equal(events.length, SAMPLE_EVENTS.length);
});

test('storage: saved events round-trip cleanly through saveAllEvents and loadSavedEvents', () => {
  const mock = new MockLocalStorage();
  (globalThis as any).window = globalThis;
  (globalThis as any).localStorage = mock;

  const customEvent: EventPlan = {
    ...SAMPLE_EVENTS[0],
    id: 'custom-event-roundtrip',
    title: 'Custom Gala Dinner',
    totalBudget: 42000,
  };

  saveAllEvents([customEvent]);
  const loaded = loadSavedEvents();
  assert.equal(loaded.length, 1);
  assert.equal(loaded[0].id, 'custom-event-roundtrip');
  assert.equal(loaded[0].title, 'Custom Gala Dinner');
  assert.equal(loaded[0].totalBudget, 42000);
});

test('storage: active event ID round-trips and validates existence against event list', () => {
  const mock = new MockLocalStorage();
  (globalThis as any).window = globalThis;
  (globalThis as any).localStorage = mock;

  const events = SAMPLE_EVENTS;
  setActiveEventId(events[1].id);
  assert.equal(getActiveEventId(events), events[1].id);

  // If saved ID does not exist in events list, falls back to first event
  setActiveEventId('non-existent-id');
  assert.equal(getActiveEventId(events), events[0].id);
});
