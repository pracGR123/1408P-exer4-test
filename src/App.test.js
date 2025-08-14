import { render, screen } from '@testing-library/react';
import App from './App';

test('renders dancing capybara heading', () => {
  render(<App />);
  const heading = screen.getByText(/Dancing Capybara/i);
  expect(heading).toBeInTheDocument();
});
