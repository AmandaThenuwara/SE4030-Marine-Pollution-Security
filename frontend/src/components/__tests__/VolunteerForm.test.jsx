import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import VolunteerForm from '../VolunteerForm';

describe('VolunteerForm Component Validation', () => {
  it('renders the correct title when adding a new volunteer', () => {
    render(<VolunteerForm onSubmit={vi.fn()} />);
    expect(screen.getByText(/Add Volunteer/i)).toBeInTheDocument();
  });

  it('populates fields when an existing volunteer is provided for editing', () => {
    const existingVolunteer = {
      name: 'John Doe',
      email: 'john@test.com',
      phone: '123456789',
      description: 'Loves diving',
      team: 'Ocean Guards'
    };
    render(<VolunteerForm onSubmit={vi.fn()} volunteer={existingVolunteer} />);
    
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@test.com')).toBeInTheDocument();
    expect(screen.getByText(/Edit Volunteer/i)).toBeInTheDocument();
  });

  it('calls onSubmit with form data when submitted', () => {
    const onSubmit = vi.fn();
    render(<VolunteerForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByPlaceholderText(/Name/i), { target: { value: 'New Volunteer' } });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'new@test.com' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Add/i }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      name: 'New Volunteer',
      email: 'new@test.com'
    }));
  });

  it('prevents submission if required fields are missing via HTML validation', () => {
    const onSubmit = vi.fn();
    render(<VolunteerForm onSubmit={onSubmit} />);
    
    // In jsdom/vitest, form.checkValidity() can be used to test HTML5 required
    const form = screen.getByRole('button', { name: /Add/i }).closest('form');
    expect(form.checkValidity()).toBe(false);
  });
});
