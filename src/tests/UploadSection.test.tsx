import { render, screen, fireEvent } from '@testing-library/react'
import UploadSection from '@/components/UploadSection'

describe('UploadSection', () => {
    const mockOnGenerate = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders upload area and input', () => {
        render(<UploadSection onGenerate={mockOnGenerate} isGenerating={false} />)
        expect(screen.getByText('Upload Reference Photos')).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/A modern living room/)).toBeInTheDocument()
    })

    it('calls onGenerate when button clicked', () => {
        render(<UploadSection onGenerate={mockOnGenerate} isGenerating={false} />)
        const textarea = screen.getByPlaceholderText(/A modern living room/)
        fireEvent.change(textarea, { target: { value: 'Beautiful sunset' } })

        const button = screen.getByText(/Create 360/)
        fireEvent.click(button)

        expect(mockOnGenerate).toHaveBeenCalledWith('Beautiful sunset', [])
    })
})
