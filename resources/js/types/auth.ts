export type Workspace = {
    id: number;
    name: string;
    description?: string;
    owner_id: number;
    created_at: string;
    updated_at: string;
}

export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    avatar_url?: string;
    current_workspace_id: number;
    workspaces?: Workspace[];
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    authority?: string[];
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};

export type SignInCredential = {
    email: string
    password: string
}

export type SignInResponse = {
    token: string
    user: {
        userId: string
        userName: string
        authority: string[]
        avatar: string
        avatar_url?: string
        email: string
    }
}

export type SignUpResponse = SignInResponse

export type SignUpCredential = {
    userName: string
    email: string
    password: string
}

export type ForgotPassword = {
    email: string
}

export type ResetPassword = {
    password: string
}

export type AuthRequestStatus = 'success' | 'failed' | ''

export type AuthResult = Promise<{
    status: AuthRequestStatus
    message: string
}>

export type Token = {
    accessToken: string
    refereshToken?: string
}

export type OauthSignInCallbackPayload = {
    onSignIn: (tokens: Token, user?: User) => void
    redirect: () => void
}
