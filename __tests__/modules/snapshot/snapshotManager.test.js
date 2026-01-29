import MapboxGL from '../../../src/index.native';

describe('snapshotManager', () => {
  it('should resolve uri', async () => {
    const options = { centerCoordinate: [1, 2] };
    const uri = await MapboxGL.snapshotManager.takeSnap(options);
    expect(uri).toEqual('file://test.png');
  });
});
