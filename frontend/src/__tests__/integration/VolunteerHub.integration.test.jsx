import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VolunteerHub from '../../pages/VolunteerHub';
import { AuthProvider } from '../../context/AuthContext';
import * as volunteerApi from '../../api/volunteerApi';
import { BrowserRouter } from 'react-router-dom';

// Mock the API
vi.mock('../../api/volunteerApi', () => ({
    getVolunteers: vi.fn(),
    addVolunteer: vi.fn(),
    updateVolunteer: vi.fn(),
    deleteVolunteer: vi.fn()
}));

const mockIsAdmin = vi.fn();

// Mock AuthContext
vi.mock('../../context/AuthContext', async () => {
    return {
        useAuth: () => ({
            user: { id: 'user1', name: 'Test User', role: 'Volunteer' },
            isAdmin: mockIsAdmin,
            isLoggedIn: () => true,
            isCleanupTaskManager: () => false,
            loading: false
        })
    };
});

describe('VolunteerHub Integration', () => {
    const mockVolunteers = [
        {
            _id: 'v1',
            name: 'John Doe',
            contact: '123456789',
            role: 'individual',
            teamSize: 1,
            description: 'Ocean lover',
            skills: ['Diving'],
            availabilityDates: ['Morning'],
            profilePicture: 'https://via.placeholder.com/150',
            city: 'Colombo',
            userId: 'user1'
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        volunteerApi.getVolunteers.mockResolvedValue({ data: mockVolunteers });
    });

    const renderHub = () => {
        return render(
            <BrowserRouter>
                <VolunteerHub />
            </BrowserRouter>
        );
    };

    it('loads and displays volunteers on entry in volunteer mode', async () => {
        mockIsAdmin.mockReturnValue(false);
        renderHub();
        
        expect(await screen.findByText('John Doe')).toBeInTheDocument();
        expect(screen.getAllByText('1 person')[0]).toBeInTheDocument();
        expect(screen.getAllByText(/Register Now/i)[0]).toBeInTheDocument();
    });


    it('completes the registration flow for a new volunteer', async () => {
        mockIsAdmin.mockReturnValue(false);
        volunteerApi.addVolunteer.mockResolvedValue({ data: { name: 'New Vol' } });
        renderHub();

        // Open Modal
        fireEvent.click(screen.getAllByText(/Register Now/i)[0]);


        // Fill Form
        fireEvent.change(screen.getByPlaceholderText(/Enter name/i), { target: { value: 'Jane Smith' } });
        fireEvent.change(screen.getByPlaceholderText(/Phone number/i), { target: { value: '987654321' } });
        fireEvent.change(screen.getByPlaceholderText(/Enter your city/i), { target: { value: 'Galle' } });
        
        // Select a skill
        fireEvent.click(screen.getByText('First Aid'));

        // Select a date (Today)
        const todayStr = new Date().getDate().toString();
        const dayButtons = screen.getAllByText(todayStr);
        fireEvent.click(dayButtons[dayButtons.length - 1]);

        // Submit
        fireEvent.click(screen.getByRole('button', { name: /^Register$/ }));

        await waitFor(() => {
            expect(volunteerApi.addVolunteer).toHaveBeenCalled();
        });

        expect(await screen.findByText(/Volunteer registered successfully/i)).toBeInTheDocument();
    });

    it('allows deleting a volunteer from the list as Admin', async () => {
        mockIsAdmin.mockReturnValue(true);
        window.confirm = vi.fn(() => true);
        volunteerApi.deleteVolunteer.mockResolvedValue({});
        
        renderHub();

        // Wait for table to load
        await screen.findByText('John Doe');

        // Click View in the table
        fireEvent.click(screen.getAllByText('View')[0]);

        // Wait for details modal
        await screen.findByText('CONTACT PROTOCOL');
        
        // Find the delete button 
        const deleteBtn = screen.getByText(/Delete Personnel Record/i); 
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(volunteerApi.deleteVolunteer).toHaveBeenCalledWith('v1');
        });
    });
});
