import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateTaskModal from '../CreateTaskModal';
import axios from 'axios';

vi.mock('axios');

describe('CreateTaskModal Component Validation', () => {
    const mockOnClose = vi.fn();
    const mockOnCreated = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // IntersectionObserver is used by Radix
        global.IntersectionObserver = vi.fn(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn(),
        }));
    });

    it('shows validation errors for required fields', async () => {
        render(<CreateTaskModal open={true} onClose={mockOnClose} onCreated={mockOnCreated} />);
        
        fireEvent.click(screen.getByText(/Submit Task/i));

        expect(await screen.findByText(/Address is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Latitude is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Longitude is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Description is required/i)).toBeInTheDocument();
    });

    it('validates coordinates range', async () => {
        render(<CreateTaskModal open={true} onClose={mockOnClose} onCreated={mockOnCreated} />);

        fireEvent.change(screen.getByPlaceholderText('6.0174'), { target: { value: '95' } });
        fireEvent.change(screen.getByPlaceholderText('80.2489'), { target: { value: '200' } });

        fireEvent.click(screen.getByText(/Submit Task/i));

        expect(await screen.findByText(/Latitude must be between -90 and 90/i)).toBeInTheDocument();
        expect(screen.getByText(/Longitude must be between -180 and 180/i)).toBeInTheDocument();
    });

    it('submits correctly when data is valid', async () => {
        axios.post.mockResolvedValue({ data: { _id: 'new_task' } });
        
        render(<CreateTaskModal open={true} onClose={mockOnClose} onCreated={mockOnCreated} />);

        fireEvent.change(screen.getByPlaceholderText(/e.g. Unawatuna Beach/i), { target: { value: 'Colombo Harbor' } });
        fireEvent.change(screen.getByPlaceholderText('6.0174'), { target: { value: '6.9' } });
        fireEvent.change(screen.getByPlaceholderText('80.2489'), { target: { value: '79.8' } });
        fireEvent.change(screen.getByPlaceholderText(/Provide specific cleanup instructions/i), { target: { value: 'Cleanup mission description that is long enough.' } });

        fireEvent.click(screen.getByText(/Submit Task/i));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalled();
            expect(mockOnCreated).toHaveBeenCalled();
        });
    });
});
