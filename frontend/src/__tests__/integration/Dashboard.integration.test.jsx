import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PollutionDashboard from '../../components/PollutionDashboard';
import { AuthProvider } from '../../context/AuthContext';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';

vi.mock('axios');

// Mock matchMedia for JSDOM
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock scrollIntoView for Radix/JSDOM
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        user: { id: 'm1', name: 'Manager', role: 'Cleanup_Task_Manager' },
        isAdmin: () => false,
        isLoggedIn: () => true,
        isCleanupTaskManager: () => true,
        loading: false
    })
}));

// Mock the Map UI components to avoid WebGL errors and missing exports in JSDOM
// Note: Path is aliased with @ in component but mocked here as relative to component
vi.mock('../../components/ui/map', () => ({
    Map: ({ children }) => <div data-testid="mock-map">{children}</div>,
    MapMarker: ({ children }) => <div data-testid="mock-marker">{children}</div>,
    MarkerContent: ({ children }) => <div data-testid="mock-marker-content">{children}</div>,
    MarkerTooltip: ({ children }) => <div data-testid="mock-marker-tooltip">{children}</div>,
    Source: ({ children }) => <div data-testid="mock-source">{children}</div>,
    Layer: () => <div data-testid="mock-layer" />,
    Popup: ({ children }) => <div data-testid="mock-popup">{children}</div>
}));

// Mock Socket.io
vi.mock('socket.io-client', () => ({
    default: () => ({
        on: vi.fn(),
        off: vi.fn(),
        disconnect: vi.fn()
    })
}));

describe('PollutionDashboard Integration', () => {
    const mockTasks = [
        {
            _id: 't1',
            location: { address: 'Beach A', coordinates: { lat: 0, lng: 0 } },
            status: 'Pending',
            wasteType: 'Plastic',
            description: 'Lots of plastic'
        },
        {
            _id: 't2',
            location: { address: 'Coast B', coordinates: { lat: 1, lng: 1 } },
            status: 'Completed',
            wasteType: 'Oil',
            description: 'Oil spill'
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        axios.get.mockImplementation((url) => {
            if (url.includes('reports')) return Promise.resolve({ data: { reports: [] } });
            if (url.includes('status=Completed')) return Promise.resolve({ data: [mockTasks[1]] });
            return Promise.resolve({ data: mockTasks });
        });
        
        // Mock IntersectionObserver for Map
        global.IntersectionObserver = vi.fn(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn(),
        }));
    });

    const renderDashboard = () => {
        return render(
            <BrowserRouter>
                <PollutionDashboard />
            </BrowserRouter>
        );
    };

    it('filters tasks when status dropdown changes', async () => {
        renderDashboard();

        // Initial load
        const beachA = await screen.findAllByText('Beach A');
        expect(beachA[0]).toBeInTheDocument();
        expect(screen.getAllByText('Coast B')[0]).toBeInTheDocument();

        // Change filter to Completed
        const filterSelect = screen.getByRole('combobox');
        fireEvent.click(filterSelect);
        
        // Select 'Completed' from the items
        const completedOption = await screen.findByRole('option', { name: /Completed/i });
        fireEvent.click(completedOption);

        // Verify axios was called with status=Completed
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('status=Completed'));
        });

        // Verify only Completed task is shown
        const coastB = await screen.findAllByText('Coast B');
        expect(coastB[0]).toBeInTheDocument();
        expect(screen.queryByText('Beach A')).not.toBeInTheDocument();
    });

    it('searches for tasks and updates the list', async () => {
        renderDashboard();

        const searchInput = await screen.findByPlaceholderText(/Search location/i);
        fireEvent.change(searchInput, { target: { value: 'Beach A' } });

        expect(screen.getAllByText('Beach A')[0]).toBeInTheDocument();
        expect(screen.queryByText('Coast B')).not.toBeInTheDocument();
    });
});
