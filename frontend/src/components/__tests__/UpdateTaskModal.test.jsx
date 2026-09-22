import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UpdateTaskModal from '../UpdateTaskModal';
import axios from 'axios';

vi.mock('axios');

describe('UpdateTaskModal Component', () => {
    const mockTask = {
        _id: 'task_1',
        status: 'Pending',
        description: 'Original description',
        priority: 'Low',
        location: {
            address: 'Negombo',
            coordinates: { lat: 7.2, lng: 79.8 }
        }
    };
    const mockOnClose = vi.fn();
    const mockOnUpdated = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        global.IntersectionObserver = vi.fn(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn(),
        }));
        // Mock volunteer fetch
        axios.get.mockResolvedValue({ data: [] });
    });

    it('initializes with task data', () => {
        render(<UpdateTaskModal open={true} onClose={mockOnClose} task={mockTask} onUpdated={mockOnUpdated} />);
        
        expect(screen.getByText('Negombo')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Original description')).toBeInTheDocument();
    });

    it('allows changing status and priority', async () => {
        render(<UpdateTaskModal open={true} onClose={mockOnClose} task={mockTask} onUpdated={mockOnUpdated} />);

        const inProgressBtn = screen.getByText('In Progress');
        fireEvent.click(inProgressBtn);
        
        const highPriorityBtn = screen.getByText('High');
        fireEvent.click(highPriorityBtn);

        // Success condition on click is UI feedback (active class) 
        // We test the final save payload
        axios.patch.mockResolvedValue({ data: { ...mockTask, status: 'In Progress', priority: 'High' } });
        
        fireEvent.click(screen.getByText(/Save Changes/i));

        await waitFor(() => {
            expect(axios.patch).toHaveBeenCalledWith(
                expect.stringContaining('task_1'),
                expect.objectContaining({
                    status: 'In Progress',
                    priority: 'High'
                })
            );
        });
    });

    it('handles server errors gracefully', async () => {
        axios.patch.mockRejectedValue({ response: { data: { message: 'Database Error' } } });
        
        render(<UpdateTaskModal open={true} onClose={mockOnClose} task={mockTask} onUpdated={mockOnUpdated} />);
        
        fireEvent.click(screen.getByText(/Save Changes/i));

        expect(await screen.findByText(/Database Error/i)).toBeInTheDocument();
    });
});
