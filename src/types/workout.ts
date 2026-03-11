export interface SetConfig {
    type: 'warmup' | 'feeder' | 'work' | 'dropset';
    count: number;
    reps: string;
}

export interface Exercise {
    id?: number;
    workout_id?: number;
    name: string;
    sets_config: SetConfig[];
}

export interface Workout {
    id: number;
    personal_id: number | null;
    student_id: number;
    title: string;
    description?: string;
    planned_day?: string | null;
    cardio_enabled: boolean;
    cardio_type: 'minutes' | 'calories';
    cardio_duration_minutes: number | null;
    cardio_calories: number | null;
    exercises: Exercise[];
    created_at?: string;
    updated_at?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'personal' | 'student';
    avatar_url?: string;
}
