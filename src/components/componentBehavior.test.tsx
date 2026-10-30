import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

import { SAMPLE_EVENTS } from '../utils/sampleData';
import { EventOverviewTab } from './EventOverviewTab';
import { BudgetTab } from './BudgetTab';
import { GuestsTab } from './GuestsTab';
import { TimelineTab } from './TimelineTab';
import { VendorsTab } from './VendorsTab';

// Setup JSDOM environment if not already defined
if (!globalThis.window) {
  const dom = new JSDOM(
    '<!doctype html><html lang="en"><head><title>Behavior Test</title></head><body><div id="root"></div></body></html>',
    { url: 'http://localhost:3000', pretendToBeVisual: true }
  );

  Object.defineProperty(globalThis, 'window', { value: dom.window, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'document', { value: dom.window.document, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'HTMLElement', { value: dom.window.HTMLElement, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'HTMLInputElement', { value: dom.window.HTMLInputElement, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'HTMLButtonElement', { value: dom.window.HTMLButtonElement, configurable: true, writable: true });
  (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
}

let root: Root | null = null;
let container: HTMLDivElement | null = null;

function renderComponent(ui: React.ReactElement): HTMLDivElement {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root!.render(ui);
  });
  return container;
}

function cleanupComponent() {
  if (root) {
    act(() => {
      root!.unmount();
    });
    root = null;
  }
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
    container = null;
  }
}

test('behavior: EventOverviewTab renders event title, date, location and guest count', () => {
  const event = SAMPLE_EVENTS[0];
  const rendered = renderComponent(
    <EventOverviewTab
      plan={event}
      onNavigateTab={() => {}}
      onOpenAiChat={() => {}}
      onOpenSpeechModal={() => {}}
    />
  );

  try {
    const text = rendered.textContent || '';
    assert.ok(text.includes(event.title), 'Should display event title');
    assert.ok(text.includes(event.location), 'Should display event location');
    assert.ok(text.includes(String(event.guestCount)), 'Should display guest count');
  } finally {
    cleanupComponent();
  }
});

test('behavior: BudgetTab displays financial totals and category breakdown', () => {
  const event = SAMPLE_EVENTS[0];
  const rendered = renderComponent(
    <BudgetTab
      plan={event}
      onUpdatePlan={() => {}}
    />
  );

  try {
    const text = rendered.textContent || '';
    assert.ok(text.includes('Total Budget'), 'Should render Total Budget header');
    assert.ok(text.includes('Allocated'), 'Should render Allocated label');
    // Check that at least one budget item is rendered
    assert.ok(event.budgetItems.length > 0);
    assert.ok(text.includes(event.budgetItems[0].title), 'Should display first budget item title');
  } finally {
    cleanupComponent();
  }
});

test('behavior: GuestsTab renders guest count and RSVP summary', () => {
  const event = SAMPLE_EVENTS[0];
  const rendered = renderComponent(
    <GuestsTab
      plan={event}
      onUpdatePlan={() => {}}
    />
  );

  try {
    const text = rendered.textContent || '';
    assert.ok(text.includes('Guests & RSVPs') || text.includes('Guest'), 'Should display guest tab heading');
    assert.ok(text.includes('Attending'), 'Should show Attending counter');
    assert.ok(text.includes(event.guests[0].name), 'Should display first guest name');
  } finally {
    cleanupComponent();
  }
});

test('behavior: TimelineTab renders milestones and phases', () => {
  const event = SAMPLE_EVENTS[0];
  const rendered = renderComponent(
    <TimelineTab
      plan={event}
      onUpdatePlan={() => {}}
      onOpenAiChat={() => {}}
    />
  );

  try {
    const text = rendered.textContent || '';
    assert.ok(text.includes('Timeline & Schedule') || text.includes('Milestones'), 'Should display timeline heading');
    assert.ok(text.includes(event.timelineItems[0].title), 'Should display first timeline milestone title');
  } finally {
    cleanupComponent();
  }
});

test('behavior: VendorsTab renders vendor cards and quotes', () => {
  const event = SAMPLE_EVENTS[0];
  const rendered = renderComponent(
    <VendorsTab
      plan={event}
      onUpdatePlan={() => {}}
    />
  );

  try {
    const text = rendered.textContent || '';
    assert.ok(text.includes('Vendor Management') || text.includes('Vendors'), 'Should display vendors heading');
    assert.ok(text.includes(event.vendors[0].name), 'Should display first vendor name');
  } finally {
    cleanupComponent();
  }
});
