import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AchievementForm from '../AchievementForm';

describe('AchievementForm Component Validation', () => {
    const mockVolunteers = [
        { _id: 'v1', name: 'John Doe', contact: '123' }
    ];

    const renderForm = (props = {}) => {
        return render(
            <AchievementForm 
                onSubmit={vi.fn()} 
                onCancel={vi.fn()} 
                volunteers={mockVolunteers} 
                {...props} 
            />
        );
    };

    it('shows validation errors when submitting an empty form', async () => {
        renderForm();
        
        fireEvent.click(screen.getByRole('button', { name: /Create Achievement/i }));

        expect(await screen.findByText(/Please select a volunteer/i)).toBeInTheDocument();
        expect(screen.getByText(/Mission title is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Mission details are required/i)).toBeInTheDocument();
        expect(screen.getByText(/Points are required/i)).toBeInTheDocument();
    });

    it('validates minimum length for title and description', async () => {
        renderForm();

        fireEvent.change(screen.getByPlaceholderText(/e.g., Beach Cleanup Drive/i), {
            target: { value: 'Ab' }
        });
        fireEvent.change(screen.getByPlaceholderText(/Describe the volunteer's contribution/i), {
            target: { value: 'Too short' }
        });

        fireEvent.click(screen.getByRole('button', { name: /Create Achievement/i }));

        expect(await screen.findByText(/Title must be at least 3 characters/i)).toBeInTheDocument();
        expect(screen.getByText(/Description must be at least 10 characters/i)).toBeInTheDocument();
    });

    it('validates points range', async () => {
        renderForm();

        const input = screen.getByLabelText(/Points/i);
        fireEvent.change(input, { target: { value: '10001' } });
        fireEvent.blur(input);

        fireEvent.click(screen.getByRole('button', { name: /Create Achievement/i }));

        expect(await screen.findByText(/Maximum points allowed is 10,000/i)).toBeInTheDocument();
    });

    it('submits successfully with valid data', async () => {
        const onSubmit = vi.fn();
        renderForm({ onSubmit });

        // Fill form
        fireEvent.change(screen.getByLabelText(/Select Volunteer/i), { target: { value: 'v1' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g., Beach Cleanup Drive/i), {
            target: { value: 'Valid Mission Title' }
        });
        fireEvent.change(screen.getByPlaceholderText(/Describe the volunteer's contribution/i), {
            target: { value: 'This is a long enough description for the mission.' }
        });
        fireEvent.change(screen.getByLabelText(/Points/i), {
            target: { value: '500' }
        });

        fireEvent.click(screen.getByRole('button', { name: /Create Achievement/i }));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalled();
        });
    });
});
