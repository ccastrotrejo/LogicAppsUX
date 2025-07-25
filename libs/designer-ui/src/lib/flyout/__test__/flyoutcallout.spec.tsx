import type { FlyoutCalloutProps } from '../flyoutcallout';
import { FlyoutCallout } from '../flyoutcallout';
import { DirectionalHint } from '@fluentui/react';
import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';
import { describe, vi, beforeEach, afterEach, beforeAll, afterAll, it, test, expect } from 'vitest';
describe('lib/flyout/flyoutcallout', () => {
  let minimal: FlyoutCalloutProps, renderer: ShallowRenderer.ShallowRenderer;

  beforeEach(() => {
    minimal = {
      target: undefined,
      text: 'text',
      visible: true,
      onDismiss: vi.fn(),
    };
    renderer = ShallowRenderer.createRenderer();
  });

  afterEach(() => {
    renderer.unmount();
  });

  it('should render', () => {
    renderer.render(<FlyoutCallout {...minimal} />);

    const callout = renderer.getRenderOutput();
    expect(callout.props).toEqual(
      expect.objectContaining({
        ariaLabel: minimal.text,
        beakWidth: 8,
        directionalHint: DirectionalHint.rightTopEdge,
        focusTrapProps: {
          isClickableOutsideFocusTrap: true,
        },
        gapSpace: 0,
        setInitialFocus: true,
        target: minimal.target,
      })
    );

    // Check that the className contains the expected class
    expect(callout.props.className).toContain('msla-flyout-callout');

    const dialog = React.Children.only(callout.props.children);
    expect(dialog.props.children).toBe(minimal.text);
    expect(dialog.props).toEqual(
      expect.objectContaining({
        'data-is-focusable': true,
        role: 'dialog',
      })
    );
  });

  it('should not render when not visible', () => {
    renderer.render(<FlyoutCallout {...minimal} visible={false} />);
    const callout = renderer.getRenderOutput();
    expect(callout).toBeNull();
  });

  it('should render', () => {
    const callout = renderer.render(<FlyoutCallout {...minimal} />);
    expect(callout).toMatchSnapshot();
  });
});
