import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterBar } from './FilterBar'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

beforeEach(() => jest.clearAllMocks())

describe('FilterBar', () => {
  it('renders all four filter fields and search button', () => {
    render(<FilterBar />)

    expect(screen.getByLabelText(/day/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/end time/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/service type/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })

  it('day select contains all 7 days', () => {
    render(<FilterBar />)
    const daySelect = screen.getByLabelText(/day/i)

    expect(daySelect).toContainElement(screen.getByRole('option', { name: 'Sunday' }))
    expect(daySelect).toContainElement(screen.getByRole('option', { name: 'Saturday' }))
  })

  it('navigates to correct URL on submit', async () => {
    const user = userEvent.setup()
    render(<FilterBar />)

    await user.selectOptions(screen.getByLabelText(/day/i), '1')
    await user.selectOptions(screen.getByLabelText(/start time/i), '09:00')
    await user.selectOptions(screen.getByLabelText(/end time/i), '13:00')
    await user.selectOptions(screen.getByLabelText(/service type/i), 'residential')
    await user.click(screen.getByRole('button', { name: /search/i }))

    expect(mockPush).toHaveBeenCalledWith(
      '/browse?day=1&start=09%3A00&end=13%3A00&type=residential'
    )
  })

  it('pre-fills values from defaultValues prop', () => {
    render(<FilterBar defaultValues={{ day: 2, start: '10:00', end: '14:00', type: 'commercial' }} />)

    expect(screen.getByLabelText<HTMLSelectElement>(/day/i).value).toBe('2')
    expect(screen.getByLabelText<HTMLSelectElement>(/start time/i).value).toBe('10:00')
    expect(screen.getByLabelText<HTMLSelectElement>(/end time/i).value).toBe('14:00')
    expect(screen.getByLabelText<HTMLSelectElement>(/service type/i).value).toBe('commercial')
  })
})
