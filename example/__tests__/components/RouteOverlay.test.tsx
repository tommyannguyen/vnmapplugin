import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RouteOverlay } from '../../src/components/RouteOverlay';

const meta = { distanceM: 1200, durationS: 480 };

describe('RouteOverlay', () => {
  it('shows duration in minutes', () => {
    const { getByText } = render(
      <RouteOverlay meta={meta} onCancel={jest.fn()} />,
    );
    expect(getByText('8 phút')).toBeTruthy();
  });

  it('shows distance in km', () => {
    const { getByText } = render(
      <RouteOverlay meta={meta} onCancel={jest.fn()} />,
    );
    expect(getByText('1.2 km')).toBeTruthy();
  });

  it('calls onCancel when Hủy is pressed', () => {
    const onCancel = jest.fn();
    const { getByText } = render(
      <RouteOverlay meta={meta} onCancel={onCancel} />,
    );
    fireEvent.press(getByText('✕ Hủy'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('rounds up partial minutes', () => {
    const { getByText } = render(
      <RouteOverlay meta={{ distanceM: 500, durationS: 61 }} onCancel={jest.fn()} />,
    );
    expect(getByText('2 phút')).toBeTruthy();
  });
});
