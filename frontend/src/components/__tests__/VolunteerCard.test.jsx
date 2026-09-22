import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import VolunteerCard from '../VolunteerCard';

describe('VolunteerCard Component', () => {
    const mockVolunteer = {
        _id: '123',
        name: 'Jane Doe',
        type: 'individual',
        availability: '2026-05-20',
        description: 'Loves the ocean'
    };

    it('renders volunteer information correctly', () => {
        render(<VolunteerCard volunteer={mockVolunteer} />);
        
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        expect(screen.getByText(/Type: individual/i)).toBeInTheDocument();
        expect(screen.getByText(/Loves the ocean/i)).toBeInTheDocument();
    });

    it('calls onEdit when the Edit button is clicked', () => {
        const onEditMock = vi.fn();
        render(<VolunteerCard volunteer={mockVolunteer} onEdit={onEditMock} />);
        
        fireEvent.click(screen.getByText('Edit'));
        expect(onEditMock).toHaveBeenCalledWith(mockVolunteer);
    });

    it('calls onDelete with correct ID when the Delete button is clicked', () => {
        const onDeleteMock = vi.fn();
        render(<VolunteerCard volunteer={mockVolunteer} onDelete={onDeleteMock} />);
        
        fireEvent.click(screen.getByText('Delete'));
        expect(onDeleteMock).toHaveBeenCalledWith('123');
    });
});
