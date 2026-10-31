import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import axe from 'axe-core';

import { SAMPLE_EVENTS } from '../utils/sampleData';
import { EventOverviewTab } from './EventOverviewTab';
import { BudgetTab } from './BudgetTab';
import { TimelineTab } from './TimelineTab';
import { VendorsTab } from './VendorsTab';
import { IdeasTab } from './IdeasTab';
import { GuestsTab } from './GuestsTab';
import { EventWizardModal } from './EventWizardModal';
import { AiAssistantDrawer } from './AiAssistantDrawer';
import { ExportModal } from './ExportModal';
import { SpeechInviteModal } from './SpeechInviteModal';
import { PlannerInsights } from './PlannerInsights';
import { CsvImportModal } from './CsvImportModal';
import { ResetConfirmDialog } from './ResetConfirmDialog';
import { DeleteEventConfirmDialog } from './DeleteEventConfirmDialog';

// Setup JSDOM environment
const dom = new JSDOM(
  '<!doctype html><html lang="en"><head><title>Accessibility Test</title></head><body><div id="root"></div></body></html>',
  { url: 'http://localhost:3000', pretendToBeVisual: true }
);

Object.defineProperty(globalThis, 'window', {
  value: dom.window,
  configurable: true,
  writable: true,
});
Object.defineProperty(globalThis, 'document', {
  value: dom.window.document,
  configurable: true,
  writable: true,
});
Object.defineProperty(globalThis, 'HTMLElement', {
  value: dom.window.HTMLElement,
  configurable: true,
  writable: true,
});
Object.defineProperty(globalThis, 'HTMLInputElement', {
  value: dom.window.HTMLInputElement,
  configurable: true,
  writable: true,
});
Object.defineProperty(globalThis, 'HTMLButtonElement', {
  value: dom.window.HTMLButtonElement,
  configurable: true,
  writable: true,
});
Object.defineProperty(globalThis, 'KeyboardEvent', {
  value: dom.window.KeyboardEvent,
  configurable: true,
  writable: true,
});
Object.defineProperty(globalThis, 'requestAnimationFrame', {
  value: (cb: FrameRequestCallback) => setTimeout(cb, 0),
  configurable: true,
  writable: true,
});
Object.defineProperty(globalThis, 'cancelAnimationFrame', {
  value: (id: number) => clearTimeout(id),
  configurable: true,
  writable: true,
});

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
dom.window.HTMLElement.prototype.scrollIntoView = () => {};

// Canvas mock for canvas-confetti
if (!(dom.window as any).HTMLCanvasElement.prototype.getContext) {
  (dom.window as any).HTMLCanvasElement.prototype.getContext = () => ({
    clearRect: () => {},
    fillRect: () => {},
  });
}

const samplePlan = SAMPLE_EVENTS[0];

async function renderComponent(
  element: React.ReactElement
): Promise<{ container: HTMLDivElement; cleanup: () => void }> {
  const container = dom.window.document.createElement('div');
  dom.window.document.body.appendChild(container);
  let root: Root;

  await act(async () => {
    root = createRoot(container);
    root.render(element);
  });

  return {
    container,
    cleanup: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

async function checkAxe(container: HTMLElement, label: string) {
  const results = await axe.run(container, {
    iframes: false,
    rules: {
      'color-contrast': { enabled: false }, // Color contrast requires real layout rendering engine
    },
  });

  assert.equal(
    results.violations.length,
    0,
    `Axe accessibility violations found in ${label}: ${JSON.stringify(
      results.violations.map((v) => ({ id: v.id, impact: v.impact, description: v.description })),
      null,
      2
    )}`
  );
}

// -------------------------------------------------------------
// TAB ACCESSIBILITY TESTS
// -------------------------------------------------------------
test('a11y tab: EventOverviewTab has ZERO axe violations', async () => {
  const { container, cleanup } = await renderComponent(
    <EventOverviewTab
      plan={samplePlan}
      onNavigateTab={() => {}}
      onOpenAiChat={() => {}}
      onOpenSpeechModal={() => {}}
    />
  );
  try {
    await checkAxe(container, 'EventOverviewTab');
  } finally {
    cleanup();
  }
});

test('a11y tab: BudgetTab has ZERO axe violations', async () => {
  const { container, cleanup } = await renderComponent(
    <BudgetTab plan={samplePlan} onUpdatePlan={() => {}} />
  );
  try {
    await checkAxe(container, 'BudgetTab');
  } finally {
    cleanup();
  }
});

test('a11y tab: TimelineTab has ZERO axe violations', async () => {
  const { container, cleanup } = await renderComponent(
    <TimelineTab plan={samplePlan} onUpdatePlan={() => {}} onOpenAiChat={() => {}} />
  );
  try {
    await checkAxe(container, 'TimelineTab');
  } finally {
    cleanup();
  }
});

test('a11y tab: VendorsTab has ZERO axe violations', async () => {
  const { container, cleanup } = await renderComponent(
    <VendorsTab plan={samplePlan} onUpdatePlan={() => {}} />
  );
  try {
    await checkAxe(container, 'VendorsTab');
  } finally {
    cleanup();
  }
});

test('a11y tab: IdeasTab has ZERO axe violations', async () => {
  const { container, cleanup } = await renderComponent(
    <IdeasTab plan={samplePlan} onUpdatePlan={() => {}} onOpenAiChat={() => {}} />
  );
  try {
    await checkAxe(container, 'IdeasTab');
  } finally {
    cleanup();
  }
});

test('a11y tab: GuestsTab has ZERO axe violations', async () => {
  const { container, cleanup } = await renderComponent(
    <GuestsTab plan={samplePlan} onUpdatePlan={() => {}} />
  );
  try {
    await checkAxe(container, 'GuestsTab');
  } finally {
    cleanup();
  }
});

// -------------------------------------------------------------
// DIALOG ACCESSIBILITY AND INTERACTION TESTS
// -------------------------------------------------------------
test('a11y dialog: EventWizardModal has role="dialog", moves focus inside, closes on Escape, and has zero axe violations', async () => {
  let closed = false;
  const { container, cleanup } = await renderComponent(
    <EventWizardModal
      isOpen={true}
      onClose={() => {
        closed = true;
      }}
      onPlanCreated={() => {}}
    />
  );

  try {
    const dialog = container.querySelector('[role="dialog"]');
    assert.equal(Boolean(dialog), true, 'Modal must have role="dialog"');

    // Focus check: wait for focus trap tick
    await new Promise((r) => setTimeout(r, 60));
    assert.equal(
      dialog?.contains(dom.window.document.activeElement),
      true,
      'Focus must move inside the dialog upon opening'
    );

    // Escape check
    dom.window.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape' }));
    assert.equal(closed, true, 'Escape key must trigger modal close');

    await checkAxe(container, 'EventWizardModal');
  } finally {
    cleanup();
  }
});

test('a11y dialog: AiAssistantDrawer has role="dialog", moves focus inside, closes on Escape, and has zero axe violations', async () => {
  let closed = false;
  const { container, cleanup } = await renderComponent(
    <AiAssistantDrawer
      isOpen={true}
      onClose={() => {
        closed = true;
      }}
      plan={samplePlan}
    />
  );

  try {
    const dialog = container.querySelector('[role="dialog"]');
    assert.equal(Boolean(dialog), true, 'Drawer must have role="dialog"');

    await new Promise((r) => setTimeout(r, 60));
    assert.equal(
      dialog?.contains(dom.window.document.activeElement),
      true,
      'Focus must move inside the drawer upon opening'
    );

    dom.window.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape' }));
    assert.equal(closed, true, 'Escape key must trigger drawer close');

    await checkAxe(container, 'AiAssistantDrawer');
  } finally {
    cleanup();
  }
});

test('a11y dialog: ExportModal has role="dialog", moves focus inside, closes on Escape, and has zero axe violations', async () => {
  let closed = false;
  const { container, cleanup } = await renderComponent(
    <ExportModal
      isOpen={true}
      onClose={() => {
        closed = true;
      }}
      plan={samplePlan}
    />
  );

  try {
    const dialog = container.querySelector('[role="dialog"]');
    assert.equal(Boolean(dialog), true, 'Modal must have role="dialog"');

    await new Promise((r) => setTimeout(r, 60));
    assert.equal(
      dialog?.contains(dom.window.document.activeElement),
      true,
      'Focus must move inside the modal upon opening'
    );

    dom.window.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape' }));
    assert.equal(closed, true, 'Escape key must trigger modal close');

    await checkAxe(container, 'ExportModal');
  } finally {
    cleanup();
  }
});

test('a11y dialog: SpeechInviteModal has role="dialog", moves focus inside, closes on Escape, and has zero axe violations', async () => {
  let closed = false;
  const { container, cleanup } = await renderComponent(
    <SpeechInviteModal
      isOpen={true}
      onClose={() => {
        closed = true;
      }}
      plan={samplePlan}
    />
  );

  try {
    const dialog = container.querySelector('[role="dialog"]');
    assert.equal(Boolean(dialog), true, 'Modal must have role="dialog"');

    await new Promise((r) => setTimeout(r, 60));
    assert.equal(
      dialog?.contains(dom.window.document.activeElement),
      true,
      'Focus must move inside the modal upon opening'
    );

    dom.window.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape' }));
    assert.equal(closed, true, 'Escape key must trigger modal close');

    await checkAxe(container, 'SpeechInviteModal');
  } finally {
    cleanup();
  }
});

test('a11y component: PlannerInsights has accessible heading, list, and zero axe violations', async () => {
  const { container, cleanup } = await renderComponent(
    <PlannerInsights plan={samplePlan} onNavigateTab={() => {}} today={new Date(2026, 9, 31)} />
  );

  try {
    const section = container.querySelector('section[aria-labelledby="planner-insights-heading"]');
    assert.ok(section, 'Section must have aria-labelledby="planner-insights-heading"');
    const heading = container.querySelector('#planner-insights-heading');
    assert.ok(heading, 'Heading with matching ID must exist');
    const list = container.querySelector('ul');
    assert.ok(list, 'List must exist');
    await checkAxe(container, 'PlannerInsights');
  } finally {
    cleanup();
  }
});

test('a11y dialog: CsvImportModal has role="dialog", moves focus inside, closes on Escape, and has zero axe violations', async () => {
  let closed = false;
  const { container, cleanup } = await renderComponent(
    <CsvImportModal
      isOpen={true}
      onClose={() => {
        closed = true;
      }}
      existingGuests={samplePlan.guests}
      onImport={() => {}}
    />
  );

  try {
    const dialog = container.querySelector('[role="dialog"]');
    assert.equal(Boolean(dialog), true, 'Modal must have role="dialog"');

    await new Promise((r) => setTimeout(r, 60));
    assert.equal(
      dialog?.contains(dom.window.document.activeElement),
      true,
      'Focus must move inside the modal upon opening'
    );

    dom.window.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape' }));
    assert.equal(closed, true, 'Escape key must trigger modal close');

    await checkAxe(container, 'CsvImportModal');
  } finally {
    cleanup();
  }
});

test('a11y dialog: ResetConfirmDialog has role="alertdialog", moves focus inside, closes on Escape, and has zero axe violations', async () => {
  let closed = false;
  const { container, cleanup } = await renderComponent(
    <ResetConfirmDialog
      isOpen={true}
      onClose={() => {
        closed = true;
      }}
      onConfirm={() => {}}
    />
  );

  try {
    const dialog = container.querySelector('[role="alertdialog"]');
    assert.equal(Boolean(dialog), true, 'Dialog must have role="alertdialog"');
    assert.equal(dialog?.getAttribute('aria-modal'), 'true');
    assert.equal(dialog?.getAttribute('aria-labelledby'), 'reset-dialog-title');
    assert.equal(dialog?.getAttribute('aria-describedby'), 'reset-dialog-description');

    await new Promise((r) => setTimeout(r, 60));
    assert.equal(
      dialog?.contains(dom.window.document.activeElement),
      true,
      'Focus must move inside the alertdialog upon opening'
    );

    dom.window.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape' }));
    assert.equal(closed, true, 'Escape key must trigger dialog close');

    await checkAxe(container, 'ResetConfirmDialog');
  } finally {
    cleanup();
  }
});

test('a11y dialog: DeleteEventConfirmDialog has role="alertdialog", moves focus inside, closes on Escape, and has zero axe violations', async () => {
  let closed = false;
  const { container, cleanup } = await renderComponent(
    <DeleteEventConfirmDialog
      isOpen={true}
      onClose={() => {
        closed = true;
      }}
      onConfirm={() => {}}
      eventTitle="Elena & Marcus: Coastal Boho Wedding"
      canDelete={true}
    />
  );

  try {
    const dialog = container.querySelector('[role="alertdialog"]');
    assert.equal(Boolean(dialog), true, 'Dialog must have role="alertdialog"');
    assert.equal(dialog?.getAttribute('aria-modal'), 'true');
    assert.equal(dialog?.getAttribute('aria-labelledby'), 'delete-event-dialog-title');
    assert.equal(dialog?.getAttribute('aria-describedby'), 'delete-event-dialog-description');

    await new Promise((r) => setTimeout(r, 60));
    assert.equal(
      dialog?.contains(dom.window.document.activeElement),
      true,
      'Focus must move inside the alertdialog upon opening'
    );

    dom.window.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape' }));
    assert.equal(closed, true, 'Escape key must trigger dialog close');

    await checkAxe(container, 'DeleteEventConfirmDialog');
  } finally {
    cleanup();
  }
});
