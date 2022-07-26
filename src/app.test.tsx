import { render, screen } from '@testing-library/react';
import App from './app';

jest.mock('./components/grid', () => ({ Grid: (props: { label: string }) => <>{props.label}</> }));

test('app component layout test', async () =>
{
    render(<App />);

    expect(screen.getByText(/Simple react example for TheMovieDB/i)).toBeInTheDocument();
    expect(screen.getByText(/Movie finder/i)).toBeInTheDocument();
    expect(screen.getByText(/Favorite movies/i)).toBeInTheDocument();
});
