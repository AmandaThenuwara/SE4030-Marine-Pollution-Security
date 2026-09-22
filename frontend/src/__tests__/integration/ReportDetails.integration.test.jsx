import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReportDetailsPage from '../../pages/ReportDetailsPage';
import api from '../../api/api.js';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';

// Mock API
vi.mock('../../api/api.js', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn()
    }
}));

// Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        isAdmin: () => true,
        isLoggedIn: () => true,
        user: { name: 'Admin' }
    })
}));

// Mock Leaflet as it causes issues in JSDOM
vi.mock('react-leaflet', () => ({
    MapContainer: ({ children }) => <div data-testid="mock-map">{children}</div>,
    TileLayer: () => <div data-testid="mock-tile-layer" />,
    Marker: () => <div data-testid="mock-marker" />
}));

describe('ReportDetailsPage Integration', () => {
    const mockReport = {
        _id: 'r1',
        title: 'Oil Spill in Lagoon',
        address: 'Negombo Lagoon',
        severity: 'High',
        photoUrl: 'https://example.com/photo.jpg',
        finalDescription: 'Large oil slick detected.',
        aiDescription: 'Detected petroleum hydrocarbon patterns.',
        aiStatus: 'pending',
        isPublished: false,
        location: { coordinates: [79.8, 6.9] },
        createdAt: '2024-03-20T10:00:00Z'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        api.get.mockResolvedValue({ data: { report: mockReport } });
    });

    const renderPage = () => {
        return render(
            <MemoryRouter initialEntries={['/reports/r1']}>
                <Routes>
                    <Route path="/reports/:id" element={<ReportDetailsPage />} />
                </Routes>
            </MemoryRouter>
        );
    };

    it('loads and displays report details', async () => {
        renderPage();

        expect(await screen.findByText('Oil Spill in Lagoon')).toBeInTheDocument();
        expect(screen.getByText('Report ID: r1')).toBeInTheDocument();
        expect(screen.getByText('Large oil slick detected.')).toBeInTheDocument();
        expect(screen.getByText('Negombo Lagoon')).toBeInTheDocument();
        expect(screen.getByText('Severity: High')).toBeInTheDocument();
        expect(screen.getByText('Draft')).toBeInTheDocument();
    });

    it('generates AI description when requested', async () => {
        api.post.mockResolvedValue({ data: { report: { ...mockReport, aiStatus: 'completed', aiDescription: 'Updated AI Analysis' } } });
        renderPage();

        const generateBtn = await screen.findByRole('button', { name: /Generate Description/i });
        fireEvent.click(generateBtn);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/ch/reports/r1/ai/generate', { force: true });
        });

        expect(await screen.findByText('Updated AI Analysis')).toBeInTheDocument();
        expect(screen.getByText('AI Analysis updated successfully.')).toBeInTheDocument();
    });

    it('publishes a report and updates the status', async () => {
        api.post.mockResolvedValue({ data: { report: { ...mockReport, isPublished: true } } });
        renderPage();

        const publishBtn = await screen.findByRole('button', { name: /Publish Report/i });
        fireEvent.click(publishBtn);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/ch/reports/r1/publish');
        });

        expect(await screen.findByText('Published')).toBeInTheDocument();
        expect(screen.getByText('Report published successfully.')).toBeInTheDocument();
    });

    it('prompts and deletes a report', async () => {
        window.confirm = vi.fn(() => true);
        api.delete.mockResolvedValue({});
        renderPage();

        const deleteBtn = await screen.findByRole('button', { name: /Delete Report/i });
        fireEvent.click(deleteBtn);

        expect(window.confirm).toHaveBeenCalledWith('Delete this report permanently?');
        await waitFor(() => {
            expect(api.delete).toHaveBeenCalledWith('/ch/reports/r1');
        });
    });

    it('displays error message when report fails to load', async () => {
        api.get.mockRejectedValue(new Error('API Error'));
        renderPage();

        expect(await screen.findByText('Failed to load report data.')).toBeInTheDocument();
    });
});
