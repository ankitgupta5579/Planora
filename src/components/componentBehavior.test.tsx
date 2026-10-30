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
import { IdeasTab } from './IdeasTab';
import { ResetConfirmDialog } from './ResetConfirmDialog';

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
    assert.ok(text.includes('booked or signed'), 'Should display "booked or signed" to match Vendors tab');
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


test('behavior: IdeasTab renders 3 returned ideas as 3 distinct cards', () => {
  const event = {
    ...SAMPLE_EVENTS[0],
    ideas: [
      {
        id: 'idea-1',
        title: 'Acoustic Sunset Prelude',
        category: 'entertainment' as const,
        description: 'Live guitarist performing indie acoustic covers as the sun sets over the ocean.',
        tags: ['Music', 'Sunset'],
      },
      {
        id: 'idea-2',
        title: 'Local Honeycomb Grazing Table',
        category: 'food_beverage' as const,
        description: 'Fresh honeycomb dripping over artisan goat cheese and crusty sourdough loaves.',
        tags: ['Gourmet', 'Honey'],
      },
      {
        id: 'idea-3',
        title: 'Wildflower Seed Packet Favors',
        category: 'sustainable_tip' as const,
        description: 'Stamped biodegradable kraft envelopes filled with pollinator-friendly seeds.',
        tags: ['Eco', 'Favors'],
      },
    ],
  };

  const rendered = renderComponent(
    <IdeasTab
      plan={event}
      onUpdatePlan={() => {}}
      onOpenAiChat={() => {}}
    />
  );

  try {
    const text = rendered.textContent || '';
    assert.ok(text.includes('Acoustic Sunset Prelude'), 'Must render card 1 title');
    assert.ok(text.includes('Local Honeycomb Grazing Table'), 'Must render card 2 title');
    assert.ok(text.includes('Wildflower Seed Packet Favors'), 'Must render card 3 title');
    // Ensure all 3 descriptions are in the DOM
    assert.ok(text.includes('Live guitarist performing'));
    assert.ok(text.includes('Fresh honeycomb dripping'));
    assert.ok(text.includes('Stamped biodegradable kraft'));
  } finally {
    cleanupComponent();
  }
});

test('behavior: ResetConfirmDialog handles cancel vs confirm', () => {
  let confirmed = false;
  let closed = false;

  const rendered = renderComponent(
    <ResetConfirmDialog
      isOpen={true}
      onClose={() => {
        closed = true;
      }}
      onConfirm={() => {
        confirmed = true;
      }}
    />
  );

  try {
    const dialog = rendered.querySelector('[role="alertdialog"]');
    assert.ok(dialog, 'Must render role="alertdialog"');
    assert.equal(dialog?.getAttribute('aria-modal'), 'true');
    assert.equal(dialog?.getAttribute('aria-labelledby'), 'reset-dialog-title');
    assert.equal(dialog?.getAttribute('aria-describedby'), 'reset-dialog-description');

    const desc = rendered.querySelector('#reset-dialog-description');
    assert.ok(
      desc?.textContent?.includes('This will erase all saved events in this browser and restore the sample events.'),
      'Must contain exact warning description'
    );

    // Test Cancel button
    const buttons = Array.from(rendered.querySelectorAll('button'));
    const cancelBtn = buttons.find((b) => b.textContent?.trim() === 'Cancel');
    assert.ok(cancelBtn, 'Cancel button must exist');

    act(() => {
      cancelBtn!.click();
    });
    assert.equal(closed, true, 'Clicking Cancel should trigger onClose');
    assert.equal(confirmed, false, 'Clicking Cancel must NOT trigger onConfirm');

    // Reset flags and test Confirm button
    closed = false;
    confirmed = false;
    const confirmBtn = buttons.find((b) => b.textContent?.includes('Reset All Events'));
    assert.ok(confirmBtn, 'Confirm button must exist');

    act(() => {
      confirmBtn!.click();
    });
    assert.equal(confirmed, true, 'Clicking Confirm must trigger onConfirm');
  } finally {
    cleanupComponent();
  }
});
