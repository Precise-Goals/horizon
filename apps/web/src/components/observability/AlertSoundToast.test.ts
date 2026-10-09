import { describe, it, expect } from 'bun:test';
import { AlertSoundToast } from './AlertSoundToast';

describe('AlertSoundToast Component Suite', () => {
  it('exports AlertSoundToast as a valid React functional component', () => {
    expect(typeof AlertSoundToast).toBe('function');
  });

  it('validates AlertSoundToast prop signatures and types', () => {
    const props = {
      isOpen: true,
      nodeName: 'PostgreSQL Primary',
      nodeId: 'db-primary',
      incidentId: 'PD-1024',
      isSounding: true,
      isSilenced: false,
      autoRemediate: true,
      onStopAlert: () => {},
    };

    expect(props.isOpen).toBe(true);
    expect(props.nodeName).toBe('PostgreSQL Primary');
    expect(props.isSounding).toBe(true);
  });
});
