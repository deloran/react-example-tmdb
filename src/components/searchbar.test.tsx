import { act, fireEvent, render, screen } from '@testing-library/react';
import { Searchbar } from './searchbar';

beforeEach(() => { jest.useFakeTimers(); });
afterEach(() => { jest.useRealTimers(); });
const mockOnSearch = jest.fn(term => { });

test('searchbar - not send test', async () =>
{
    act(() => { render(<Searchbar onSearch={mockOnSearch} />); });
    expect(mockOnSearch).toHaveBeenCalledTimes(0);
    const input = screen.getByTestId("search-text");

    act(() => { fireEvent.change(input, { target: { value: 'th' } }); });
    expect(mockOnSearch).toHaveBeenCalledTimes(0);

    act(() => { jest.advanceTimersByTime(600); });
    expect(mockOnSearch).toHaveBeenCalledTimes(0);
    expect(screen.queryByText("Enter at least 3 chars")).toBeInTheDocument();
});

test('searchbar - auto send', async () =>
{
    act(() => { render(<Searchbar onSearch={mockOnSearch} />); });
    expect(mockOnSearch).toHaveBeenCalledTimes(0);
    const input = screen.getByTestId("search-text");

    act(() => { fireEvent.change(input, { target: { value: 'the' } }); });
    expect(mockOnSearch).toHaveBeenCalledTimes(0);
    act(() => { jest.advanceTimersByTime(600); });
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Enter at least 3 chars")).toBeNull();
});

test('searchbar - button send', async () =>
{
    act(() => { render(<Searchbar onSearch={mockOnSearch} />); });
    expect(mockOnSearch).toHaveBeenCalledTimes(0);
    const input = screen.getByTestId("search-text");
    const button = screen.getByTestId("search-button");

    act(() => { fireEvent.change(input, { target: { value: 'the' } }); });
    expect(mockOnSearch).toHaveBeenCalledTimes(0);
    act(() => { jest.advanceTimersByTime(100); });
    expect(mockOnSearch).toHaveBeenCalledTimes(0);
    act(() => { fireEvent.click(button, { target: {} }); });
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
    act(() => { jest.advanceTimersByTime(600); });
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
});