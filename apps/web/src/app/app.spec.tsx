import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import App from './app';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(baseElement).toBeTruthy();
  });

  it('should have a greeting as the title', () => {
    const { getAllByText } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(getAllByText(new RegExp('WanderBook', 'gi')).length > 0).toBeTruthy();
  });
});
