import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import App from './App';

// Mock axios to prevent real HTTP requests during tests
jest.mock('axios');

describe('App component', () => {
  beforeEach(() => {
    // Default mock for get-greatlakes endpoint
    axios.get.mockImplementation((url) => {
      if (url.startsWith('/get-greatlakes')) {
        return Promise.resolve({ data: { 'Great Lakes': [] } });
      }
      // Provide empty suggestions by default
      if (url.startsWith('/suggest-recipes')) {
        return Promise.resolve({ data: { suggestions: [] } });
      }
      if (url.startsWith('/suggest-ingredients')) {
        return Promise.resolve({ data: { suggestions: [] } });
      }
      // Other endpoints
      return Promise.resolve({ data: {} });
    });
  });

  test('renders main header and search inputs', async () => {
    render(<App />);

    // Check that the main header is in the document
    expect(
      screen.getByText(/Native American Cuisine: Great Lakes Region/i)
    ).toBeInTheDocument();

    // Check that the recipe search input is rendered
    expect(
      screen.getByPlaceholderText(/Search by recipe name/i)
    ).toBeInTheDocument();

    // Check that the ingredient filter input is rendered
    expect(
      screen.getByPlaceholderText(/Filter by ingredient/i)
    ).toBeInTheDocument();

    // Wait for initial fetchRecipes call to complete and loading to finish
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/get-greatlakes', { params: {} }));
  });
});
