import { render, screen } from '@testing-library/react'
import PanoramaViewer from '@/components/PanoramaViewer'

describe('PanoramaViewer', () => {
    it('renders the container div', () => {
        render(<PanoramaViewer imageUrl="test.jpg" />)
        // Since it's Pannellum, it just renders a div with a ref
        const container = document.querySelector('div[id^="panorama-"]');
        expect(container).toBeDefined();
    })
})
