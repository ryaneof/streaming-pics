import { expect } from 'chai';
import { mapUrl } from '../utils/url';

describe('mapUrl', () => {
  it('extracts nothing if both params are undefined', () => {
    expect(mapUrl(undefined, undefined)).to.deep.equal({
      action: null,
      params: []
    });
  });
});
