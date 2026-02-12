import { render, screen, fireEvent } from '@testing-library/react'
import Navbar from '@/components/Navbar'
import { useSession, signIn, signOut } from 'next-auth/react'

// Mocks are already setup in global or hoisted.
// But we need to control useSession specifically here.
// In jest.setup.js? No, I mocked it globally?
// No, I mocked it in Navbar.test.tsx previously.
// But jest resets mocks.
// So I mock it here again.

jest.mock('next-auth/react', () => ({
    useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
    signIn: jest.fn(),
    signOut: jest.fn(),
}))

describe('Navbar', () => {

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders logo and sign in button when logged out', () => {
        (useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' })

        render(<Navbar />)

        expect(screen.getByText('PanoAI')).toBeInTheDocument()
        const signInBtn = screen.getByText('Sign In')
        expect(signInBtn).toBeInTheDocument()

        fireEvent.click(signInBtn)
        expect(signIn).toHaveBeenCalledWith('google')
    })

    it('renders user info and sign out button when logged in', () => {
        const mockUser = { name: 'Test User', email: 'test@example.com', image: 'test.jpg' };
        (useSession as jest.Mock).mockReturnValue({
            data: { user: mockUser },
            status: 'authenticated'
        })

        render(<Navbar />)

        expect(screen.getByText('Test User')).toBeInTheDocument()
        expect(screen.getByText('test@example.com')).toBeInTheDocument()

        // Sign out button is an icon button. LogOut icon mocked as icon-LogOut
        // Find by icon testid
        const signOutBtn = screen.getByTestId('icon-LogOut').closest('button')

        fireEvent.click(signOutBtn!)
        expect(signOut).toHaveBeenCalled()
    })
})
