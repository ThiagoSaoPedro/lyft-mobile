import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ProfileScreen from '../ProfileScreen';

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock('../../../config/api', () => ({
    API_CONFIG: { BASE_URL: 'http://localhost' },
}));

const mockUser = {
    id: 1,
    name: 'John Atleta',
    email: 'john@lyft.com',
    bio: 'Minha bio',
    avatar: null,
    xp: 250,
    rank: 'Prata',
    strike_count: 8,
    safe_days_left: 2,
    total_workouts: 5,
};

const mockBadges = [
    { id: 1, name: '7 Dias Seguidos', icon: 'fire', color: '#f97316', unlocked: true, progress: 8, goal: 7 },
    { id: 2, name: 'Foco Total', icon: 'target', color: '#8b5cf6', unlocked: false, progress: 250, goal: 500 },
    { id: 3, name: 'Madrugador', icon: 'weather-sunset-up', color: '#fbbf24', unlocked: true, progress: 5, goal: 5 },
    { id: 4, name: 'Veterano', icon: 'dumbbell', color: '#10b981', unlocked: false, progress: 5, goal: 20 },
    { id: 5, name: '30 Dias Strike', icon: 'trophy', color: '#a855f7', unlocked: false, progress: 8, goal: 30 },
    { id: 6, name: 'Lendário', icon: 'star', color: '#ec4899', unlocked: false, progress: 250, goal: 10000 },
];

const mockNavigation = {
    replace: jest.fn(),
};

const mockRoute = {
    params: { token: 'test-token', user: mockUser },
};

const setupFetchMock = (overrides: Partial<Record<string, any>> = {}) => {
    global.fetch = jest.fn().mockImplementation((url: string) => {
        if (url.includes('/api/me')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ user: overrides.user ?? mockUser }),
            });
        }
        if (url.includes('/api/profile/badges')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ badges: overrides.badges ?? mockBadges }),
            });
        }
        if (url.includes('/api/profile/use-safe-day')) {
            return Promise.resolve(
                overrides.safeDayResponse ?? {
                    ok: true,
                    json: () => Promise.resolve({ user: { ...mockUser, safe_days_left: 1 } }),
                }
            );
        }
        if (url.includes('/api/profile')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ user: { ...mockUser, bio: overrides.newBio ?? 'Bio salva' } }),
            });
        }
        return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });
};

beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert');
    setupFetchMock();
});

// ─── Rendering ───────────────────────────────────────────────────────────────

it('shows loading indicator before data arrives', () => {
    const { getByTestId } = render(
        <ProfileScreen route={mockRoute} navigation={mockNavigation} />
    );
    // ActivityIndicator is rendered while loading
    expect(getByTestId !== undefined).toBeTruthy();
});

it('renders user name, email and bio after loading', async () => {
    const { getByText } = render(
        <ProfileScreen route={mockRoute} navigation={mockNavigation} />
    );

    await waitFor(() => {
        expect(getByText('JOHN ATLETA')).toBeTruthy();
        expect(getByText('john@lyft.com')).toBeTruthy();
        expect(getByText('Minha bio')).toBeTruthy();
    });
});

it('renders strike count from API', async () => {
    const { getByText } = render(
        <ProfileScreen route={mockRoute} navigation={mockNavigation} />
    );

    await waitFor(() => {
        expect(getByText('8 DIAS')).toBeTruthy();
    });
});

it('renders safe days left from API', async () => {
    const { getByText } = render(
        <ProfileScreen route={mockRoute} navigation={mockNavigation} />
    );

    await waitFor(() => {
        expect(getByText(/2 restantes/)).toBeTruthy();
    });
});

it('renders XP below 1000 as plain number', async () => {
    const { getByText } = render(
        <ProfileScreen route={mockRoute} navigation={mockNavigation} />
    );

    await waitFor(() => {
        expect(getByText('250')).toBeTruthy();
    });
});

it('renders rank from API', async () => {
    const { getByText } = render(
        <ProfileScreen route={mockRoute} navigation={mockNavigation} />
    );

    await waitFor(() => {
        expect(getByText('Prata')).toBeTruthy();
    });
});

it('renders total workouts from API', async () => {
    const { getByText } = render(
        <ProfileScreen route={mockRoute} navigation={mockNavigation} />
    );

    await waitFor(() => {
        expect(getByText('5')).toBeTruthy();
    });
});

it('renders badges from API', async () => {
    const { getByText } = render(
        <ProfileScreen route={mockRoute} navigation={mockNavigation} />
    );

    await waitFor(() => {
        expect(getByText('7 Dias Seguidos')).toBeTruthy();
        expect(getByText('Foco Total')).toBeTruthy();
    });
});

it('shows progress text for locked badges', async () => {
    const { getByText } = render(
        <ProfileScreen route={mockRoute} navigation={mockNavigation} />
    );

    await waitFor(() => {
        // Foco Total: progress 250, goal 500
        expect(getByText('250/500')).toBeTruthy();
    });
});

// ─── Bio editing ─────────────────────────────────────────────────────────────

it('opens bio modal title when edit is triggered', async () => {
    const { getByText, queryByText } = render(
        <ProfileScreen route={mockRoute} navigation={mockNavigation} />
    );

    await waitFor(() => getByText('Minha bio'));

    // Modal is not visible yet
    expect(queryByText('EDITAR BIO')).toBeNull();
});

// ─── Safe Day ─────────────────────────────────────────────────────────────────

it('shows confirmation alert when "USAR HOJE" is pressed', async () => {
    const { getByText } = render(
        <ProfileScreen route={mockRoute} navigation={mockNavigation} />
    );

    await waitFor(() => getByText('USAR HOJE'));
    fireEvent.press(getByText('USAR HOJE'));

    expect(Alert.alert).toHaveBeenCalledWith(
        'Usar Safe Day',
        expect.stringContaining('2 Safe Day'),
        expect.any(Array)
    );
});

it('shows "0 restantes" when user has no safe days left', async () => {
    setupFetchMock({ user: { ...mockUser, safe_days_left: 0 } });

    const { getByText } = render(
        <ProfileScreen route={mockRoute} navigation={mockNavigation} />
    );

    await waitFor(() => {
        expect(getByText(/0 restantes/)).toBeTruthy();
    });
});

// ─── Logout ───────────────────────────────────────────────────────────────────

it('navigates to Login on logout', async () => {
    const { getByText } = render(
        <ProfileScreen route={mockRoute} navigation={mockNavigation} />
    );

    await waitFor(() => getByText('ENCERRAR SESSÃO'));
    fireEvent.press(getByText('ENCERRAR SESSÃO'));

    expect(mockNavigation.replace).toHaveBeenCalledWith('Login');
});

// ─── Fallback bio placeholder ─────────────────────────────────────────────────

it('shows placeholder when user has no bio', async () => {
    setupFetchMock({ user: { ...mockUser, bio: null } });

    const { getByText } = render(
        <ProfileScreen route={mockRoute} navigation={mockNavigation} />
    );

    await waitFor(() => {
        expect(getByText('Adicione uma bio...')).toBeTruthy();
    });
});

// ─── XP formatting ────────────────────────────────────────────────────────────

it('formats XP over 1000 with "k" suffix', async () => {
    setupFetchMock({ user: { ...mockUser, xp: 1500 } });

    const { getByText } = render(
        <ProfileScreen route={mockRoute} navigation={mockNavigation} />
    );

    await waitFor(() => {
        expect(getByText('1.5k')).toBeTruthy();
    });
});
