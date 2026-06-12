import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterBar } from './FilterBar'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

beforeEach(() => jest.clearAllMocks())

async function openDays(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /days/i }))
}

describe('FilterBar', () => {
  it('hides the day checkboxes until the Days button is clicked', () => {
    render(<FilterBar />)

    expect(screen.getByRole('button', { name: /days/i })).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: /sun/i })).not.toBeInTheDocument()
  })

  it('renders a checkbox for each day of the week plus an All Days checkbox once opened', async () => {
    const user = userEvent.setup()
    render(<FilterBar />)
    await openDays(user)

    expect(screen.getByRole('checkbox', { name: /sun/i })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /sat/i })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /all days/i })).toBeInTheDocument()
    expect(screen.getAllByRole('checkbox')).toHaveLength(8)
  })

  it('toggles the days panel closed when the Days button is clicked again', async () => {
    const user = userEvent.setup()
    render(<FilterBar />)

    await openDays(user)
    expect(screen.getByRole('checkbox', { name: /sun/i })).toBeInTheDocument()

    await openDays(user)
    expect(screen.queryByRole('checkbox', { name: /sun/i })).not.toBeInTheDocument()
  })

  it('selects every day when the All Days checkbox is clicked', async () => {
    const user = userEvent.setup()
    render(<FilterBar />)
    await openDays(user)

    const allDays = screen.getByRole('checkbox', { name: /all days/i })
    expect(allDays).not.toBeChecked()

    await user.click(allDays)

    for (const day of ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']) {
      expect(screen.getByRole('checkbox', { name: new RegExp(day, 'i') })).toBeChecked()
    }
    expect(allDays).toBeChecked()

    await user.click(allDays)

    for (const day of ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']) {
      expect(screen.getByRole('checkbox', { name: new RegExp(day, 'i') })).not.toBeChecked()
    }
  })

  it('shows the number of selected days on the Days button', async () => {
    const user = userEvent.setup()
    render(<FilterBar />)
    await openDays(user)

    await user.click(screen.getByRole('checkbox', { name: /mon/i }))
    await user.click(screen.getByRole('checkbox', { name: /wed/i }))

    expect(screen.getByRole('button', { name: /days \(2\)/i })).toBeInTheDocument()
  })

  it('renders a time of day select with all day, morning, noon, evening and night', () => {
    render(<FilterBar />)

    expect(screen.getByLabelText(/time of day/i)).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'All Day' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Morning' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Noon' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Evening' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Night' })).toBeInTheDocument()
  })

  it('renders service type, location fields and search button', () => {
    render(<FilterBar />)

    expect(screen.getByLabelText(/service type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })

  it('navigates with selected days, time of day, type and location', async () => {
    const user = userEvent.setup()
    render(<FilterBar />)

    await openDays(user)
    await user.click(screen.getByRole('checkbox', { name: /mon/i }))
    await user.click(screen.getByRole('checkbox', { name: /wed/i }))
    await user.selectOptions(screen.getByLabelText(/time of day/i), 'morning')
    await user.selectOptions(screen.getByLabelText(/service type/i), 'residential')
    await user.type(screen.getByLabelText(/location/i), 'Tel Aviv')
    await user.click(screen.getByRole('button', { name: /search/i }))

    expect(mockPush).toHaveBeenCalledWith(
      '/browse?type=residential&days=1%2C3&timeOfDay=morning&location=Tel+Aviv'
    )
  })

  it('navigates without a days param when no day is selected', async () => {
    const user = userEvent.setup()
    render(<FilterBar />)

    await user.selectOptions(screen.getByLabelText(/time of day/i), 'evening')
    await user.selectOptions(screen.getByLabelText(/service type/i), 'commercial')
    await user.click(screen.getByRole('button', { name: /search/i }))

    expect(mockPush).toHaveBeenCalledWith('/browse?type=commercial&timeOfDay=evening')
  })

  it('clears all filters and navigates to /browse when Clear is clicked', async () => {
    const user = userEvent.setup()
    render(<FilterBar defaultValues={{ days: [1, 3], timeOfDay: 'evening', type: 'commercial', location: 'Haifa' }} />)

    await user.click(screen.getByRole('button', { name: /clear/i }))

    expect(mockPush).toHaveBeenCalledWith('/browse')
    await openDays(user)
    expect(screen.getByRole('checkbox', { name: /mon/i })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: /wed/i })).not.toBeChecked()
    expect(screen.getByLabelText<HTMLSelectElement>(/time of day/i).value).toBe('')
    expect(screen.getByLabelText<HTMLSelectElement>(/service type/i).value).toBe('')
    expect(screen.getByLabelText<HTMLInputElement>(/location/i).value).toBe('')
  })

  it('pre-fills values from defaultValues prop', async () => {
    const user = userEvent.setup()
    render(<FilterBar defaultValues={{ days: [1, 3], timeOfDay: 'evening', type: 'commercial', location: 'Haifa' }} />)

    expect(screen.getByRole('button', { name: /days \(2\)/i })).toBeInTheDocument()

    await openDays(user)
    expect(screen.getByRole('checkbox', { name: /mon/i })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /wed/i })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /sun/i })).not.toBeChecked()
    expect(screen.getByLabelText<HTMLSelectElement>(/time of day/i).value).toBe('evening')
    expect(screen.getByLabelText<HTMLSelectElement>(/service type/i).value).toBe('commercial')
    expect(screen.getByLabelText<HTMLInputElement>(/location/i).value).toBe('Haifa')
  })
})
