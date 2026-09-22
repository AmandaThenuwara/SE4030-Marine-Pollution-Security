import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AchievementHub from '../../pages/AchievementHub';
import achievementService from '../../services/achievementService';
import api from '../../services/api';
import { BrowserRouter } from 'react-router-dom';

// Mock services
vi.mock('../../services/achievementService', () => ({
    default: {
        getAllAchievements: vi.fn(),
        getAchievementStats: vi.fn(),
        createAchievement: vi.fn(),
        updateAchievement: vi.fn(),
        approveAchievement: vi.fn(),
        rejectAchievement: vi.fn(),
        deleteAchievement: vi.fn()
    }
}));

vi.mock('../../services/api', () => ({
    default: {
        get: vi.fn()
    }
}));

describe('AchievementHub Integration', () => {
    const mockAchievements = [
        {
            _id: 'a1',
            volunteerId: { _id: 'v1', name: 'John Doe', email: 'john@example.com' },
            activityTitle: 'Beach Cleanup',
            description: 'Cleaned 10kg plastic',
            badgeType: 'Gold',
            level: 'Advanced',
            status: 'pending',
            createdAt: '2024-03-20T10:00:00Z'
        },
        {
            _id: 'a2',
            volunteerId: { _id: 'v2', name: 'Jane Smith', email: 'jane@example.com' },
            activityTitle: 'Coral Planting',
            description: 'Planted 5 corals',
            badgeType: 'Silver',
            level: 'Intermediate',
            status: 'approved',
            pointsAwarded: 500,
            totalAccumulatedPoints: 1200,
            createdAt: '2024-03-19T10:00:00Z'
        }
    ];

    const mockStats = {
        totalAchievements: 2,
        pendingAchievements: 1,
        totalPointsAwarded: 500,
        uniqueVolunteersCount: 2
    };

    beforeEach(() => {
        vi.clearAllMocks();
        achievementService.getAllAchievements.mockResolvedValue({ data: mockAchievements, pagination: { total: 2, pages: 1 } });
        achievementService.getAchievementStats.mockResolvedValue({ data: mockStats });
        api.get.mockResolvedValue({ data: [] });
    });

    const renderHub = () => {
        return render(
            <BrowserRouter>
                <AchievementHub />
            </BrowserRouter>
        );
    };

    it('loads and displays achievements and statistics', async () => {
        renderHub();

        expect(await screen.findByText(/Achievement Hub/i)).toBeInTheDocument();
        
        // Use specific selectors for stats to avoid ambiguity
        expect(await screen.findByText('Total Achievements')).toBeInTheDocument();
        const statsValues = screen.getAllByRole('heading', { level: 3 });
        expect(statsValues.some(h => h.textContent === '2')).toBe(true);
        expect(statsValues.some(h => h.textContent === '500')).toBe(true);

        // Check list entries
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Beach Cleanup')).toBeInTheDocument();
    });

    it('filters achievements by status', async () => {
        renderHub();
        await screen.findByText('Beach Cleanup');

        // Target the Approved filter button specifically
        const filterBtns = screen.getAllByRole('button');
        const approvedBtn = filterBtns.find(b => b.textContent === 'Approved');
        fireEvent.click(approvedBtn);

        await waitFor(() => {
            expect(achievementService.getAllAchievements).toHaveBeenCalledWith(expect.objectContaining({
                status: 'approved'
            }));
        });
    });

    it('allows an admin to approve a pending achievement', async () => {
        window.prompt = vi.fn(() => '100');
        achievementService.approveAchievement.mockResolvedValue({});
        
        renderHub();
        await screen.findByText('Beach Cleanup');

        const approveBtns = screen.getAllByTitle('Approve');
        fireEvent.click(approveBtns[0]);

        expect(window.prompt).toHaveBeenCalled();
        await waitFor(() => {
            expect(achievementService.approveAchievement).toHaveBeenCalledWith('a1', { pointsAwarded: 100 });
        });
    });

    it('searches for achievements by volunteer name', async () => {
        renderHub();
        await screen.findByText('Beach Cleanup');

        const searchInput = screen.getByPlaceholderText(/Search by volunteer/i);
        fireEvent.change(searchInput, { target: { value: 'Jane' } });

        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
});
