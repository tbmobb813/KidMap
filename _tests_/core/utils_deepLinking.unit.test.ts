import { Linking } from 'react-native';

import { nav } from '@/shared/navigation/nav';
import { handleDeepLink, createShareableLink, shareRoute } from '@/utils/navigation/deepLinking';

jest.mock('react-native', () => ({
  Linking: {
    openURL: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@/shared/navigation/nav', () => ({
  nav: {
    push: jest.fn(),
  },
}));

describe('deepLinking utils', () => {
  beforeEach(() => jest.clearAllMocks());

  it('handles /route/:id pattern', () => {
    handleDeepLink('https://kidmap.app/route/abc123');
    expect(nav.push).toHaveBeenCalledWith('/route/:id', { id: 'abc123' });
  });

  it('handles /search with category param', () => {
    handleDeepLink('https://kidmap.app/search?category=park');
    expect(nav.push).toHaveBeenCalledWith('/search', { category: 'park' });
  });

  it('createShareableLink adds params and shareRoute calls Linking', async () => {
    const url = createShareableLink('/route/xyz', { ref: 'u1' });
    expect(url).toContain('/route/xyz');
    expect(url).toContain('ref=u1');

    await shareRoute('xyz');
    expect(Linking.openURL).toHaveBeenCalled();
  });
});
